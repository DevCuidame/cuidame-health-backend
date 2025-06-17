"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = __importDefault(require("../../core/config/environment"));
const error_handler_1 = require("../../utils/error-handler");
const logger_1 = __importDefault(require("../../utils/logger"));
const password_util_1 = require("../../utils/password.util");
const patient_repository_1 = require("../patient/patient.repository");
const user_repository_1 = require("../user/user.repository");
const user_session_repository_1 = require("./user-session.repository");
const health_repository_1 = require("../../modules/health/health.repository");
const medical_info_repository_1 = require("../../modules/medical-info/medical-info.repository");
const file_upload_util_1 = require("../../utils/file-upload.util");
const database_1 = require("../../core/config/database");
const role_repository_1 = require("../role/role.repository");
const user_role_model_1 = require("../../models/user-role.model");
const email_service_1 = require("../notification/services/email.service");
const date_format_1 = require("../../utils/date-format");
const notification_template_service_1 = require("../notification/services/notification-template.service");
const template_file_service_1 = require("../notification/services/template-file.service");
class AuthService {
    userRepository;
    userSessionRepository;
    patientRepository;
    healthRepository;
    medicalInfoRepository;
    roleRepository;
    emailService;
    notificationTemplateService;
    templateFileService;
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
        this.userSessionRepository = new user_session_repository_1.UserSessionRepository();
        this.patientRepository = new patient_repository_1.PatientRepository();
        this.healthRepository = new health_repository_1.HealthRepository();
        this.medicalInfoRepository = new medical_info_repository_1.MedicalInfoRepository();
        this.roleRepository = new role_repository_1.RoleRepository();
        this.emailService = email_service_1.EmailService.getInstance();
        this.notificationTemplateService = new notification_template_service_1.NotificationTemplateService();
        this.templateFileService = new template_file_service_1.TemplateFileService();
    }
    /**
     * Iniciar sesión de usuario
     * @param credentials Credenciales de inicio de sesión
     * @returns Respuesta de autenticación con token y datos de usuario
     */
    async login(credentials, deviceInfo) {
        const { email, password } = credentials;
        const normalizedEmail = email.toLowerCase();
        // Buscar usuario por email incluyendo el campo password
        const user = await this.userRepository.findByEmail(normalizedEmail, true);
        if (!user) {
            throw new error_handler_1.UnauthorizedError('Credenciales inválidas');
        }
        // Verificar contraseña
        if (!user.password) {
            throw new error_handler_1.UnauthorizedError('Este usuario no tiene contraseña configurada');
        }
        // Verificar contraseña (compatible con MD5 y PBKDF2)
        const isPasswordValid = password_util_1.PasswordService.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new error_handler_1.UnauthorizedError('Credenciales inválidas');
        }
        let message = 'Sesión iniciada exitosamente';
        if (!user.verificado) {
            message = 'emailnoverificado';
        }
        // Limpiar sesiones inactivas automáticamente en cada login
        try {
            const cleanupResult = await this.userSessionRepository.cleanInactiveSessionsAutomatically();
            logger_1.default.info(`Limpieza automática de sesiones: ${cleanupResult.expired} expiradas, ${cleanupResult.inactive} inactivas, ${cleanupResult.unused} no usadas eliminadas`);
        }
        catch (error) {
            logger_1.default.error('Error en limpieza automática de sesiones:', error);
            // No interrumpir el login si falla la limpieza
        }
        // Limitar número de sesiones activas por usuario ANTES de crear la nueva (máximo 5)
        await this.userSessionRepository.limitUserSessions(user.id, 4);
        // Crear nueva sesión
        const sessionResponse = await this.createUserSession(user.id, deviceInfo);
        // Obtener el conteo de pacientes a cargo
        const patientCount = await this.patientRepository.count({
            where: { a_cargo_id: user.id }
        });
        // Obtener pacientes a cargo del usuario
        let cared_persons = await this.patientRepository.findByCaregiverId(user.id);
        // Añadir datos de salud y localización para cada paciente a cargo
        if (cared_persons && cared_persons.length > 0) {
            const enrichedPatients = await Promise.all(cared_persons.map(async (patient) => {
                // Remove imagebs64 from patient object to reduce size
                // const { imagebs64, ...patientWithoutImage } = patient;
                const { ...patientWithoutImage } = patient;
                // Obtener datos de salud para el paciente
                const [latestVitals, medicalInfo] = await Promise.all([
                    this.healthRepository.getLatestVitals(patient.id),
                    this.medicalInfoRepository.getAllMedicalInfo(patient.id)
                ]);
                // Obtener información detallada de ciudad y departamento
                let cityName = patient.ciudad || "";
                let departmentName = patient.departamento || "";
                // Si hay city_id, intentar obtener el nombre real de la ciudad y departamento
                if (patient.city_id) {
                    try {
                        // Obtener datos de la ciudad desde el repositorio de ubicaciones
                        const locationRepository = database_1.AppDataSource.getRepository('townships');
                        const cityData = await locationRepository.findOne({
                            where: { id: patient.city_id },
                            relations: ['department']
                        });
                        if (cityData) {
                            cityName = cityData.name;
                            if (cityData.department) {
                                departmentName = cityData.department.name;
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error al obtener información de localización:', error);
                        // Mantener los valores originales en caso de error
                    }
                }
                // Crear un objeto que combine el paciente con sus datos de salud y localización
                return {
                    ...patientWithoutImage,
                    ciudad: cityName,
                    department_name: departmentName,
                    health_data: {
                        vitals: latestVitals,
                        medical_info: medicalInfo
                    }
                };
            }));
            // Reemplazar la lista original con la enriquecida
            cared_persons = enrichedPatients;
        }
        // Obtener el rol del usuario para incluirlo en la respuesta
        const userRoleRepository = database_1.AppDataSource.getRepository(user_role_model_1.UserRole);
        const userRole = await userRoleRepository.findOne({
            where: { user_id: user.id },
            relations: ['role']
        });
        const roleName = userRole?.role?.name || 'User';
        // Crear objeto de respuesta (exclude imagebs64 from user data as well)
        const userData = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                verificado: user.verificado,
                phone: user.phone,
                typeid: user.typeid,
                numberid: user.numberid,
                address: user.address,
                gender: user.gender,
                birth_date: (0, date_format_1.formatBirthDate)(user.birth_date),
                city_id: user.city_id,
                department: null,
                pubname: user.pubname,
                privname: user.privname,
                imagebs64: user.imagebs64,
                path: user.path,
                role: roleName,
            },
            access_token: sessionResponse.accessToken,
            refresh_token: sessionResponse.refreshToken,
            session_id: sessionResponse.sessionId,
            patientCount: patientCount,
            cared_persons: cared_persons,
        };
        const locationRepository = database_1.AppDataSource.getRepository('townships');
        const cityData = await locationRepository.findOne({
            where: { id: user.city_id },
            relations: ['department']
        });
        if (cityData?.department) {
            userData.user.department = cityData.department.id;
        }
        return {
            success: true,
            message,
            data: userData,
            token: sessionResponse.accessToken,
            refresh_token: sessionResponse.refreshToken
        };
    }
    /**
     * Refrescar token de acceso usando un refresh token
     * @param refreshTokenData Datos del refresh token
     * @returns Nuevo token de acceso
     */
    async refreshToken(refreshTokenData) {
        const { refresh_token } = refreshTokenData;
        try {
            // Buscar sesión por refresh token
            const session = await this.userSessionRepository.findByRefreshToken(refresh_token);
            if (!session) {
                throw new error_handler_1.UnauthorizedError('Refresh token inválido o expirado');
            }
            // Verificar que la sesión no haya expirado
            if (session.refresh_expires_at < new Date()) {
                // Desactivar sesión expirada
                await this.userSessionRepository.deactivateSession(session.id);
                throw new error_handler_1.UnauthorizedError('Refresh token expirado');
            }
            // Verificar refresh token JWT
            const decoded = jsonwebtoken_1.default.verify(refresh_token, environment_1.default.jwt.secret);
            // Validar que sea un refresh token
            if (decoded.type !== 'refresh') {
                throw new error_handler_1.UnauthorizedError('Token inválido');
            }
            // Generar nuevos tokens
            const newAccessToken = await this.generateToken(session.user);
            const newRefreshToken = this.generateRefreshToken(session.user);
            // Calcular nuevas fechas de expiración
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(environment_1.default.jwt.expiresIn));
            const refreshExpiresAt = new Date();
            refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 días
            // Actualizar tokens en la sesión
            await this.userSessionRepository.updateTokens(session.id, newAccessToken, newRefreshToken, expiresAt, refreshExpiresAt);
            // Actualizar última vez usado
            await this.userSessionRepository.updateLastUsed(session.id);
            // Obtener el rol del usuario para incluirlo en la respuesta
            const userRoleRepository = database_1.AppDataSource.getRepository(user_role_model_1.UserRole);
            const userRole = await userRoleRepository.findOne({
                where: { user_id: session.user.id },
                relations: ['role']
            });
            const roleName = userRole?.role?.name || 'User';
            return {
                success: true,
                message: 'Token renovado exitosamente',
                data: {
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken,
                    session_id: session.id,
                    role: roleName
                },
                token: newAccessToken,
                refresh_token: newRefreshToken
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new error_handler_1.UnauthorizedError('Refresh token inválido o expirado');
            }
            throw error;
        }
    }
    /**
     * Generar refresh token JWT
     * @param user Usuario
     * @returns Refresh token JWT
     */
    generateRefreshToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            type: 'refresh',
            token_version: 1, // Versión del token para invalidación masiva si es necesario
        };
        return jsonwebtoken_1.default.sign(payload, environment_1.default.jwt.secret, {
            expiresIn: '30d', // El refresh token dura más tiempo
        });
    }
    /**
     * Registrar un nuevo usuario
     * @param userData Datos del nuevo usuario
     * @returns Respuesta de autenticación
     */
    async register(userData) {
        const normalizedUserData = {
            ...userData,
            email: userData.email.toLowerCase()
        };
        const { email, password } = normalizedUserData;
        // Verificar si el email ya está registrado
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new error_handler_1.BadRequestError('No logramos registrar tu correo electrónico.');
        }
        // Verificar si el numero de identificación ya está registrado
        const existingUserIdentification = await this.userRepository.findByIdentification(normalizedUserData.numberid);
        if (existingUserIdentification) {
            throw new error_handler_1.BadRequestError('No logramos registrar tu número de documento.');
        }
        // Generar hash de la contraseña
        const hashedPassword = password_util_1.PasswordService.hashPasswordMD5(password);
        const imageBase64 = normalizedUserData.imagebs64;
        const userDataToSave = { ...normalizedUserData };
        delete userDataToSave.imagebs64;
        const newUser = await this.userRepository.create({
            ...userDataToSave,
            password: hashedPassword,
            verificado: false,
            created_at: new Date(),
            updated_at: new Date(),
        });
        // Asignar rol por defecto al usuario
        try {
            // Obtener el rol por defecto (normalmente 'usuario')
            const defaultRole = await this.roleRepository.getDefaultRole();
            if (defaultRole) {
                // Crear la relación usuario-rol
                const userRoleRepository = database_1.AppDataSource.getRepository(user_role_model_1.UserRole);
                const userRole = userRoleRepository.create({
                    user_id: newUser.id,
                    role_id: defaultRole.id
                });
                await userRoleRepository.save(userRole);
            }
            else {
                logger_1.default.warn(`No se pudo asignar rol por defecto al usuario ${newUser.id} porque no existe el rol 'usuario'`);
            }
        }
        catch (error) {
            logger_1.default.error(`Error al asignar rol al usuario ${newUser.id}:`, error);
            // No fallamos el proceso completo si hay error en la asignación de rol
        }
        // Si hay imagen, guardarla y actualizar la URL de la foto
        let photoUrl = '';
        if (imageBase64) {
            try {
                // Guardar imagen usando el servicio de utilidad
                photoUrl = await file_upload_util_1.FileUploadService.saveBase64Image(imageBase64, 'users', 'profile');
                if (photoUrl) {
                    // Actualizar la URL en la base de datos
                    await this.userRepository.update(newUser.id, {
                        path: photoUrl,
                        updated_at: new Date(),
                    }, 'User');
                    // Actualizar el objeto del paciente antes de devolverlo
                    newUser.path = photoUrl;
                }
            }
            catch (error) {
                console.error('Error al guardar imagen de paciente:', error);
                // No fallamos el proceso completo si hay error en la imagen
            }
        }
        // TODO: Enviar email de verificación (implementar en un servicio de email)
        return {
            success: true,
            message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                lastname: newUser.lastname,
            },
        };
    }
    /**
     * Solicitar restablecimiento de contraseña
     * @param email Email del usuario
     * @returns Respuesta de autenticación
     */
    async forgotPassword(email) {
        // Verificar si el usuario existe
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            // Por seguridad, no informar si el email existe o no
            return {
                success: true,
                message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
            };
        }
        // Generar token de restablecimiento
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, environment_1.default.jwt.secret, { expiresIn: '1h' });
        // Actualizar token en la base de datos
        await this.userRepository.updateSessionToken(user.id, resetToken);
        // Construir la URL de restablecimiento
        const resetUrl = `https://${environment_1.default.server.production_url}/reset-password?token=${resetToken}`;
        // Enviar email con instrucciones
        try {
            // Intentar usar la plantilla desde archivo
            let emailHtml = '';
            let emailSubject = 'Restablecimiento de contraseña';
            try {
                // Intentar obtener la plantilla desde archivo
                emailHtml = await this.templateFileService.renderTemplate('password_reset', {
                    userName: user.name,
                    resetUrl: resetUrl,
                    expirationTime: '1 hora'
                });
            }
            catch (templateError) {
                // Si no se puede leer la plantilla desde archivo, intentar usar la plantilla de la base de datos
                logger_1.default.warn('No se pudo leer la plantilla desde archivo, intentando usar plantilla de la base de datos');
                try {
                    // Intentar obtener la plantilla por código desde la base de datos
                    const { subject, body } = await this.notificationTemplateService.renderTemplate('password_reset', {
                        userName: user.name,
                        resetUrl: resetUrl,
                        expirationTime: '1 hora'
                    });
                    emailHtml = body;
                    emailSubject = subject;
                }
                catch (dbTemplateError) {
                    // Si no existe la plantilla en la base de datos, usar la plantilla en línea
                    logger_1.default.warn('Plantilla de restablecimiento de contraseña no encontrada, usando plantilla por defecto');
                    emailHtml = `
            <h1>Restablecimiento de contraseña</h1>
            <p>Hola ${user.name},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <p><a href="${resetUrl}">Restablecer contraseña</a></p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>Saludos,<br>El equipo de Cuidame Health</p>
          `;
                }
            }
            // Enviar el correo
            await this.emailService.sendEmail({
                to: user.email,
                subject: emailSubject,
                html: emailHtml
            });
            logger_1.default.info(`Email de restablecimiento enviado a ${user.email}`);
        }
        catch (error) {
            logger_1.default.error('Error al enviar email de restablecimiento:', error);
            // No devolvemos el error al usuario por seguridad
        }
        return {
            success: true,
            message: 'Se han enviado instrucciones para restablecer tu contraseña a tu correo.',
        };
    }
    /**
     * Restablecer contraseña de usuario
     * @param token Token de restablecimiento
     * @param newPassword Nueva contraseña
     * @returns Respuesta de autenticación
     */
    async resetPassword(token, newPassword) {
        try {
            // Verificar token
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.default.jwt.secret);
            // Buscar usuario
            const user = await this.userRepository.findById(decoded.id);
            if (!user || user.session_token !== token) {
                throw new error_handler_1.UnauthorizedError('Token inválido o expirado');
            }
            // Generar hash de la nueva contraseña
            const hashedPassword = password_util_1.PasswordService.hashPasswordMD5(newPassword);
            // Actualizar contraseña y limpiar token
            await this.userRepository.update(user.id, {
                password: hashedPassword,
                session_token: null,
            }, 'Usuario');
            return {
                success: true,
                message: 'Contraseña actualizada correctamente',
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new error_handler_1.UnauthorizedError('Token inválido o expirado');
            }
            throw error;
        }
    }
    /**
     * Verificar email de usuario
     * @param token Token de verificación
     * @returns Respuesta de autenticación
     */
    async verifyEmail(token) {
        try {
            // Verificar token
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.default.jwt.secret);
            // Buscar usuario
            const user = await this.userRepository.findById(decoded.id);
            if (!user || user.session_token !== token) {
                throw new error_handler_1.UnauthorizedError('Token inválido o expirado');
            }
            // Actualizar estado de verificación y limpiar token
            await this.userRepository.updateVerificationStatus(user.id, true);
            await this.userRepository.updateSessionToken(user.id, null);
            return {
                success: true,
                message: 'Correo electrónico verificado correctamente',
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new error_handler_1.UnauthorizedError('Token inválido o expirado');
            }
            throw error;
        }
    }
    /**
     * Cambiar contraseña de usuario
     * @param userId ID del usuario
     * @param currentPassword Contraseña actual
     * @param newPassword Nueva contraseña
     * @returns Respuesta de autenticación
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Buscar usuario por ID
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError('Usuario no encontrado');
        }
        // Buscar usuario por email para incluir la contraseña
        const userWithPassword = await this.userRepository.findByEmail(user.email, true);
        if (!userWithPassword || !userWithPassword.password) {
            throw new error_handler_1.UnauthorizedError('Este usuario no tiene contraseña configurada');
        }
        // Verificar contraseña actual (compatible con MD5 y PBKDF2)
        const isPasswordValid = password_util_1.PasswordService.verifyPassword(currentPassword, userWithPassword.password);
        if (!isPasswordValid) {
            throw new error_handler_1.UnauthorizedError('La contraseña actual es incorrecta');
        }
        // Generar hash de la nueva contraseña
        const hashedPassword = password_util_1.PasswordService.hashPasswordMD5(newPassword);
        // Actualizar contraseña
        await this.userRepository.update(user.id, {
            password: hashedPassword,
            updated_at: new Date(),
        }, 'Usuario');
        return {
            success: true,
            message: 'Contraseña actualizada correctamente',
        };
    }
    /**
     * Cerrar sesión de usuario
     * @param userId ID del usuario
     * @returns Respuesta de autenticación
     */
    async logout(userId) {
        // Desactivar todas las sesiones del usuario
        await this.userSessionRepository.deactivateAllUserSessions(userId);
        return {
            success: true,
            message: 'Todas las sesiones cerradas correctamente',
        };
    }
    /**
     * Generar token JWT
     * @param user Usuario
     * @returns Token JWT
     */
    async generateToken(user) {
        // Obtener el rol del usuario
        const userRoleRepository = database_1.AppDataSource.getRepository(user_role_model_1.UserRole);
        const userRole = await userRoleRepository.findOne({
            where: { user_id: user.id },
            relations: ['role']
        });
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: userRole?.role?.name || 'User'
        };
        // @ts-ignore - Forzar a TypeScript a ignorar este error específico
        return jsonwebtoken_1.default.sign(payload, environment_1.default.jwt.secret, {
            expiresIn: environment_1.default.jwt.expiresIn,
        });
    }
    /**
     * Verificar contraseña del usuario para eliminación de cuenta
     * @param userId ID del usuario
     * @param password Contraseña a verificar
     * @returns Respuesta de autenticación
     */
    async verifyPasswordForDeletion(userId, password) {
        // Buscar usuario por ID
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError('Usuario no encontrado');
        }
        // Buscar usuario por email para incluir la contraseña
        const userWithPassword = await this.userRepository.findByEmail(user.email, true);
        if (!userWithPassword || !userWithPassword.password) {
            throw new error_handler_1.UnauthorizedError('Este usuario no tiene contraseña configurada');
        }
        // Verificar contraseña (compatible con MD5 y PBKDF2)
        const isPasswordValid = password_util_1.PasswordService.verifyPassword(password, userWithPassword.password);
        if (!isPasswordValid) {
            throw new error_handler_1.UnauthorizedError('Contraseña incorrecta');
        }
        return {
            success: true,
            message: 'Contraseña verificada correctamente',
        };
    }
    /**
     * Obtener información para eliminación de cuenta
     * @returns Información para eliminación de cuenta
     */
    async getAccountDeletionInfo() {
        // Lista de razones predefinidas para eliminación de cuenta
        const reasons = [
            'Ya no necesito el servicio',
            'Preocupaciones de privacidad',
            'Problemas técnicos',
            'Servicio al cliente',
            'Otro motivo'
        ];
        // Texto de confirmación que el usuario debe escribir
        const confirmationText = 'ELIMINAR';
        return {
            reasons,
            confirmationText
        };
    }
    /**
     * Eliminar cuenta de usuario
     * @param userId ID del usuario
     * @param deleteData Datos para eliminación de cuenta
     * @returns Respuesta de autenticación
     */
    async deleteAccount(userId, deleteData) {
        const { password, confirmation, reason, otherReason } = deleteData;
        // Verificar que la confirmación sea correcta
        const accountInfo = await this.getAccountDeletionInfo();
        if (confirmation !== accountInfo.confirmationText) {
            throw new error_handler_1.BadRequestError('El texto de confirmación no es correcto');
        }
        // Verificar contraseña y obtener usuario
        await this.verifyPasswordForDeletion(userId, password);
        // Registrar la razón de eliminación (esto podría guardarse en una tabla de auditoría)
        logger_1.default.info(`Usuario ${userId} eliminó su cuenta. Razón: ${reason || 'No especificada'} ${otherReason ? `- ${otherReason}` : ''}`);
        // Eliminar usuario (o marcar como inactivo, dependiendo de la política de la aplicación)
        // Opción 1: Eliminar completamente
        await this.userRepository.delete(userId, 'Usuario');
        // Opción 2: Marcar como inactivo y anonimizar datos (descomentar si se prefiere esta opción)
        /*
        await this.userRepository.update(
          userId,
          {
            active: false,
            email: `deleted_${userId}_${Date.now()}@deleted.com`,
            name: 'Usuario eliminado',
            lastname: '',
            phone: '',
            session_token: null,
            updated_at: new Date(),
          },
          'Usuario'
        );
        */
        return {
            success: true,
            message: 'Cuenta eliminada correctamente',
        };
    }
    /**
     * Crear una nueva sesión de usuario
     * @param userId ID del usuario
     * @param deviceInfo Información del dispositivo
     * @returns Datos de la sesión creada
     */
    async createUserSession(userId, deviceInfo) {
        // Generar tokens
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError(`Usuario con ID ${userId} no encontrado`);
        }
        // Generar token JWT
        const accessToken = await this.generateToken(user);
        // Generar refresh token
        const refreshToken = this.generateRefreshToken(user);
        // Calcular fechas de expiración
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(environment_1.default.jwt.expiresIn));
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 días
        // Formatear información del dispositivo
        let deviceInfoStr = null;
        if (deviceInfo) {
            deviceInfoStr = JSON.stringify(deviceInfo);
        }
        // Crear nueva sesión
        const session = await this.userSessionRepository.createSession({
            user_id: userId,
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
            refresh_expires_at: refreshExpiresAt,
            device_info: deviceInfoStr || undefined,
            device_name: deviceInfo?.deviceName,
            device_type: deviceInfo?.deviceType,
            ip_address: deviceInfo?.ipAddress,
            user_agent: deviceInfo?.userAgent,
            last_used_at: new Date(),
            is_active: true
        });
        return {
            sessionId: session.id,
            accessToken,
            refreshToken,
            expiresAt,
            refreshExpiresAt,
            deviceInfo: deviceInfoStr || undefined
        };
    }
    /**
     * Obtener todas las sesiones activas de un usuario
     * @param userId ID del usuario
     * @param currentSessionId ID de la sesión actual
     * @returns Lista de sesiones activas
     */
    async getActiveSessions(userId, currentSessionId) {
        const sessions = await this.userSessionRepository.findActiveSessionsByUserId(userId);
        return sessions.map(session => {
            let deviceInfo = null;
            try {
                if (session.device_info) {
                    deviceInfo = JSON.parse(session.device_info);
                }
            }
            catch (error) {
                logger_1.default.error('Error al parsear información del dispositivo', error);
            }
            return {
                sessionId: session.id,
                deviceInfo: deviceInfo ? `${deviceInfo.browser || 'Desconocido'} en ${deviceInfo.os || 'Dispositivo desconocido'}` : 'Sesión desconocida',
                ipAddress: session.ip_address,
                lastUsedAt: session.last_used_at,
                createdAt: session.created_at,
                isCurrent: currentSessionId ? session.id === currentSessionId : false
            };
        });
    }
    /**
     * Cerrar sesión específica o todas las sesiones
     * @param logoutData Datos para cerrar sesión
     * @returns Respuesta de autenticación
     */
    async logoutSession(logoutData) {
        const { sessionId, accessToken, logoutAll } = logoutData;
        if (logoutAll) {
            // Si se solicita cerrar todas las sesiones, necesitamos el ID de usuario
            if (!accessToken && !sessionId) {
                throw new error_handler_1.BadRequestError('Se requiere un token de acceso o ID de sesión para cerrar todas las sesiones');
            }
            let userId;
            if (sessionId) {
                // Obtener sesión por ID
                const session = await this.userSessionRepository.findById(sessionId);
                if (!session) {
                    throw new error_handler_1.NotFoundError(`Sesión con ID ${sessionId} no encontrada`);
                }
                userId = session.user_id;
            }
            else {
                // Obtener sesión por token de acceso
                const session = await this.userSessionRepository.findByAccessToken(accessToken);
                if (!session) {
                    throw new error_handler_1.UnauthorizedError('Token de acceso inválido');
                }
                userId = session.user_id;
            }
            // Desactivar todas las sesiones del usuario
            await this.userSessionRepository.deactivateAllUserSessions(userId);
            return {
                success: true,
                message: 'Todas las sesiones han sido cerradas correctamente'
            };
        }
        else if (sessionId) {
            // Cerrar sesión específica por ID
            await this.userSessionRepository.deactivateSession(sessionId);
            return {
                success: true,
                message: 'Sesión cerrada correctamente'
            };
        }
        else if (accessToken) {
            // Cerrar sesión específica por token de acceso
            await this.userSessionRepository.deactivateByAccessToken(accessToken);
            return {
                success: true,
                message: 'Sesión cerrada correctamente'
            };
        }
        else {
            throw new error_handler_1.BadRequestError('Se requiere un ID de sesión o token de acceso para cerrar sesión');
        }
    }
    /**
     * Limpiar sesiones expiradas y antiguas
     * @returns Número de sesiones limpiadas
     */
    async cleanupSessions() {
        const expired = await this.userSessionRepository.cleanExpiredSessions();
        const inactive = await this.userSessionRepository.cleanInactiveSessions(30); // Limpiar sesiones inactivas de más de 30 días
        return { expired, inactive };
    }
}
exports.AuthService = AuthService;
