import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../core/config/environment';
import {
  ILoginCredentials,
  JwtPayload,
  IRegisterData,
  RefreshTokenPayload,
  IRefreshTokenData,
  IAccountDeletionInfo,
  IDeleteAccountData,
  IDeviceInfo,
  ISessionData,
  ISessionResponse,
  ILogoutSessionData,
  IActiveSession
} from '../auth/auth.interface';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../../utils/error-handler';
import { IAuthResponse } from '../auth/auth.interface';
import logger from '../../utils/logger';
import { PasswordService } from '../../utils/password.util';
import { PatientRepository } from '../patient/patient.repository';
import { UserRepository } from '../user/user.repository';
import { UserSessionRepository } from './user-session.repository';
import { User } from '@models/user.model';

import { HealthRepository } from '../../modules/health/health.repository';
import { MedicalInfoRepository } from '../../modules/medical-info/medical-info.repository';
import { FileUploadService } from '../../utils/file-upload.util';
import { AppDataSource } from '../../core/config/database';
import { RoleRepository } from '../role/role.repository';
import { UserRole } from '../../models/user-role.model';
import { EmailService } from '../notification/services/email.service';
import { formatBirthDate } from '../../utils/date-format';
import { NotificationTemplateService } from '../notification/services/notification-template.service';
import { TemplateFileService } from '../notification/services/template-file.service';


export class AuthService {
  private userRepository: UserRepository;
  private userSessionRepository: UserSessionRepository;
  private patientRepository: PatientRepository;
  private healthRepository: HealthRepository;
  private medicalInfoRepository: MedicalInfoRepository;
  private roleRepository: RoleRepository;
  private emailService: EmailService;
  private notificationTemplateService: NotificationTemplateService;
  private templateFileService: TemplateFileService;

  constructor() {
    this.userRepository = new UserRepository();
    this.userSessionRepository = new UserSessionRepository();
    this.patientRepository = new PatientRepository(); 
    this.healthRepository = new HealthRepository();
    this.medicalInfoRepository = new MedicalInfoRepository();
    this.roleRepository = new RoleRepository();
    this.emailService = EmailService.getInstance();
    this.notificationTemplateService = new NotificationTemplateService();
    this.templateFileService = new TemplateFileService();
  }

  /**
   * Iniciar sesión de usuario
   * @param credentials Credenciales de inicio de sesión
   * @returns Respuesta de autenticación con token y datos de usuario
   */

/**
   * Login básico optimizado - Solo autenticación y tokens
   * @param credentials Credenciales de inicio de sesión
   * @param deviceInfo Información del dispositivo
   * @returns Respuesta de autenticación básica
   */
  async login(credentials: ILoginCredentials, deviceInfo?: IDeviceInfo): Promise<IAuthResponse> {
    const startTime = Date.now();
    const { email, password } = credentials;
    const normalizedEmail = email.toLowerCase();
    
    logger.info(`🔐 [AUTH-SERVICE] Iniciando autenticación para: ${normalizedEmail}`);

    // Buscar usuario por email incluyendo el campo password
    const userSearchStart = Date.now();
    const user = await this.userRepository.findByEmail(normalizedEmail, true);
    const userSearchEnd = Date.now();
    
    logger.info(`🔐 [AUTH-SERVICE] Búsqueda de usuario completada en ${userSearchEnd - userSearchStart}ms`);
    
    if (!user) {
      logger.warn(`🔐 [AUTH-SERVICE] Usuario no encontrado: ${normalizedEmail}`);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    logger.info(`🔐 [AUTH-SERVICE] Usuario encontrado: ID ${user.id}`);

    // Verificar contraseña
    if (!user.password) {
      logger.warn(`🔐 [AUTH-SERVICE] Usuario ${user.id} no tiene contraseña configurada`);
      throw new UnauthorizedError('Este usuario no tiene contraseña configurada');
    }

    // Verificar contraseña (compatible con MD5 y PBKDF2)
    const passwordVerifyStart = Date.now();
    const isPasswordValid = PasswordService.verifyPassword(password, user.password);
    const passwordVerifyEnd = Date.now();
    
    logger.info(`🔐 [AUTH-SERVICE] Verificación de contraseña completada en ${passwordVerifyEnd - passwordVerifyStart}ms`);
    
    if (!isPasswordValid) {
      logger.warn(`🔐 [AUTH-SERVICE] Contraseña inválida para usuario: ${user.id}`);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    let message = 'Sesión iniciada exitosamente';
    if (!user.verificado) {
      message = 'emailnoverificado';
      logger.info(`🔐 [AUTH-SERVICE] Usuario ${user.id} no verificado`);
    }

    // Limitar número de sesiones activas por usuario ANTES de crear la nueva (máximo 5)
    const sessionLimitStart = Date.now();
    await this.userSessionRepository.limitUserSessions(user.id, 4);
    const sessionLimitEnd = Date.now();
    
    logger.info(`🔐 [AUTH-SERVICE] Limitación de sesiones completada en ${sessionLimitEnd - sessionLimitStart}ms`);

    // Crear nueva sesión
    const sessionCreateStart = Date.now();
    const sessionResponse = await this.createUserSession(user.id, deviceInfo);
    const sessionCreateEnd = Date.now();
    
    logger.info(`🔐 [AUTH-SERVICE] Creación de sesión completada en ${sessionCreateEnd - sessionCreateStart}ms`);

    // Obtener solo información básica del usuario
    const userRoleStart = Date.now();
    const userRoleRepository = AppDataSource.getRepository(UserRole);
    const userRole = await userRoleRepository.findOne({
      where: { user_id: user.id },
      relations: ['role']
    });
    const userRoleEnd = Date.now();
    
    logger.info(`🔐 [AUTH-SERVICE] Obtención de rol completada en ${userRoleEnd - userRoleStart}ms`);
    
    const roleName = userRole?.role?.name || 'User';

    // Obtener información básica de ubicación del usuario
    let userDepartment = null;
    if (user.city_id) {
      try {
        const locationStart = Date.now();
        const locationRepository = AppDataSource.getRepository('townships');
        const cityData = await locationRepository.findOne({
          where: { id: user.city_id },
          relations: ['department']
        });
        const locationEnd = Date.now();
        
        logger.info(`🔐 [AUTH-SERVICE] Obtención de ubicación completada en ${locationEnd - locationStart}ms`);
        
        if (cityData?.department) {
          userDepartment = cityData.department.id;
        }
      } catch (error) {
        logger.error('🔐 [AUTH-SERVICE] Error al obtener información de ubicación del usuario:', error);
      }
    }

    // Obtener solo el conteo de pacientes (sin cargar todos los datos)
    const patientCountStart = Date.now();
    const patientCount = await this.patientRepository.count({
      where: { a_cargo_id: user.id }
    });
    const patientCountEnd = Date.now();
    
    logger.info(`🔐 [AUTH-SERVICE] Conteo de pacientes completado en ${patientCountEnd - patientCountStart}ms - Total: ${patientCount}`);

    // Respuesta básica optimizada
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
        birth_date: formatBirthDate(user.birth_date),
        city_id: user.city_id,
        department: userDepartment,
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
      // Los datos de pacientes se cargan por separado
      cared_persons: [],
    };

    const totalTime = Date.now() - startTime;
    logger.info(`🔐 [AUTH-SERVICE] Login completo en ${totalTime}ms para usuario ${user.id}`);

    return {
      success: true,
      message,
      data: userData,
      token: sessionResponse.accessToken,
      refresh_token: sessionResponse.refreshToken
    };
  }

  /**
   * Obtener datos enriquecidos de pacientes a cargo
   * @param userId ID del usuario
   * @param includeHealthData Si incluir datos de salud
   * @param includeMedicalInfo Si incluir información médica
   * @returns Lista de pacientes con datos enriquecidos
   */
  async getCaredPatientsData(
    userId: number, 
    includeHealthData: boolean = true, 
    includeMedicalInfo: boolean = true
  ): Promise<any[]> {
    // Obtener pacientes básicos
    let cared_persons = await this.patientRepository.findByCaregiverId(userId);

    if (!cared_persons || cared_persons.length === 0) {
      return [];
    }

    // Enriquecer datos si se solicita
    if (includeHealthData || includeMedicalInfo) {
      const enrichedPatients = await Promise.all(
        cared_persons.map(async (patient) => {
          const { ...patientWithoutImage } = patient;
          
          // Preparar promesas para datos adicionales
          const promises: Promise<any>[] = [];
          
          if (includeHealthData) {
            promises.push(this.healthRepository.getLatestVitals(patient.id));
          }
          
          if (includeMedicalInfo) {
            promises.push(this.medicalInfoRepository.getAllMedicalInfo(patient.id));
          }

          // Ejecutar consultas en paralelo
          const results = await Promise.all(promises);
          
          let latestVitals = null;
          let medicalInfo = null;
          
          if (includeHealthData) {
            latestVitals = results[0];
          }
          
          if (includeMedicalInfo) {
            const index = includeHealthData ? 1 : 0;
            medicalInfo = results[index];
          }

          // Obtener información de ubicación
          let cityName = patient.ciudad || "";
          let departmentName = patient.departamento || "";

          if (patient.city_id) {
            try {
              const locationRepository = AppDataSource.getRepository('townships');
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
            } catch (error) {
              logger.error('Error al obtener información de localización:', error);
            }
          }

          // Construir objeto de respuesta
          const enrichedPatient: any = {
            ...patientWithoutImage,
            ciudad: cityName,
            department_name: departmentName,
          };

          // Añadir datos de salud si se solicitaron
          if (includeHealthData || includeMedicalInfo) {
            enrichedPatient.health_data = {};
            
            if (includeHealthData) {
              enrichedPatient.health_data.vitals = latestVitals;
            }
            
            if (includeMedicalInfo) {
              enrichedPatient.health_data.medical_info = medicalInfo;
            }
          }

          return enrichedPatient;
        })
      );

      return enrichedPatients;
    }

    // Retornar solo datos básicos
    return cared_persons;
  }

  /**
   * Refrescar token de acceso usando un refresh token
   * @param refreshTokenData Datos del refresh token
   * @returns Nuevo token de acceso
   */
  async refreshToken(refreshTokenData: IRefreshTokenData): Promise<IAuthResponse> {
    const { refresh_token } = refreshTokenData;
    
    try {
      // Buscar sesión por refresh token
      const session = await this.userSessionRepository.findByRefreshToken(refresh_token);
      
      if (!session) {
        throw new UnauthorizedError('Refresh token inválido o expirado');
      }
      
      // Verificar que la sesión no haya expirado
      if (session.refresh_expires_at < new Date()) {
        // Desactivar sesión expirada
        await this.userSessionRepository.deactivateSession(session.id);
        throw new UnauthorizedError('Refresh token expirado');
      }
      
      // Verificar refresh token JWT
      const decoded = jwt.verify(refresh_token, config.jwt.secret) as RefreshTokenPayload;
      
      // Validar que sea un refresh token
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Token inválido');
      }
      
      // Generar nuevos tokens
      const newAccessToken = await this.generateToken(session.user);
      const newRefreshToken = this.generateRefreshToken(session.user);
      
      // Calcular nuevas fechas de expiración
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(config.jwt.expiresIn));
      
      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 días
      
      // Actualizar tokens en la sesión
      await this.userSessionRepository.updateTokens(
        session.id,
        newAccessToken,
        newRefreshToken,
        expiresAt,
        refreshExpiresAt
      );
      
      // Actualizar última vez usado
      await this.userSessionRepository.updateLastUsed(session.id);
      
      // Obtener el rol del usuario para incluirlo en la respuesta
      const userRoleRepository = AppDataSource.getRepository(UserRole);
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
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Refresh token inválido o expirado');
      }
      throw error;
    }
  }

  /**
   * Generar refresh token JWT
   * @param user Usuario
   * @returns Refresh token JWT
   */
  private generateRefreshToken(user: User): string {
    const payload: RefreshTokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'refresh',
      token_version: 1, // Versión del token para invalidación masiva si es necesario
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '30d', // El refresh token dura más tiempo
    });
  }

  /**
   * Registrar un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Respuesta de autenticación
   */
  async register(userData: IRegisterData): Promise<IAuthResponse> {

    const normalizedUserData = {
      ...userData,
      email: userData.email.toLowerCase()
    };

    const { email, password } = normalizedUserData;
  
    // Verificar si el email ya está registrado
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('No logramos registrar tu correo electrónico.');
    }
    
    // Verificar si el numero de identificación ya está registrado
    const existingUserIdentification = await this.userRepository.findByIdentification(normalizedUserData.numberid);
    if (existingUserIdentification) {
      throw new BadRequestError('No logramos registrar tu número de documento.');
    }
  
    // Generar hash de la contraseña
    const hashedPassword = PasswordService.hashPasswordMD5(password);
  
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
        const userRoleRepository = AppDataSource.getRepository(UserRole);
        const userRole = userRoleRepository.create({
          user_id: newUser.id,
          role_id: defaultRole.id
        });
        
        await userRoleRepository.save(userRole);
      } else {
        logger.warn(`No se pudo asignar rol por defecto al usuario ${newUser.id} porque no existe el rol 'usuario'`);
      }
    } catch (error) {
      logger.error(`Error al asignar rol al usuario ${newUser.id}:`, error);
      // No fallamos el proceso completo si hay error en la asignación de rol
    }
  
    // Si hay imagen, guardarla y actualizar la URL de la foto
    let photoUrl = '';
    if (imageBase64) {
      try {
        // Guardar imagen usando el servicio de utilidad
        photoUrl = await FileUploadService.saveBase64Image(
          imageBase64,
          'users',
          'profile'
        );
  
        if (photoUrl) {
          // Actualizar la URL en la base de datos
          await this.userRepository.update(
            newUser.id,
            {
              path: photoUrl,
              updated_at: new Date(),
            },
            'User'
          );
  
          // Actualizar el objeto del paciente antes de devolverlo
          newUser.path = photoUrl;
        }
      } catch (error) {
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
  async forgotPassword(email: string): Promise<IAuthResponse> {
    // Verificar si el usuario existe
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Por seguridad, no informar si el email existe o no
      return {
        success: true,
        message:
          'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
      };
    }

    // Generar token de restablecimiento
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // Actualizar token en la base de datos
    await this.userRepository.updateSessionToken(user.id, resetToken);

    // Construir la URL de restablecimiento
    const resetUrl = `https://${config.server.production_url}/reset-password?token=${resetToken}`;
    
    // Enviar email con instrucciones
    try {
      // Intentar usar la plantilla desde archivo
      let emailHtml = '';
      let emailSubject = 'Restablecimiento de contraseña';
      
      try {
        // Intentar obtener la plantilla desde archivo
        emailHtml = await this.templateFileService.renderTemplate(
          'password_reset', 
          {
            userName: user.name,
            resetUrl: resetUrl,
            expirationTime: '1 hora'
          }
        );
      } catch (templateError) {
        // Si no se puede leer la plantilla desde archivo, intentar usar la plantilla de la base de datos
        logger.warn('No se pudo leer la plantilla desde archivo, intentando usar plantilla de la base de datos');
        
        try {
          // Intentar obtener la plantilla por código desde la base de datos
          const { subject, body } = await this.notificationTemplateService.renderTemplate(
            'password_reset', 
            {
              userName: user.name,
              resetUrl: resetUrl,
              expirationTime: '1 hora'
            }
          );
          emailHtml = body;
          emailSubject = subject;
        } catch (dbTemplateError) {
          // Si no existe la plantilla en la base de datos, usar la plantilla en línea
          logger.warn('Plantilla de restablecimiento de contraseña no encontrada, usando plantilla por defecto');
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
      
      logger.info(`Email de restablecimiento enviado a ${user.email}`);
    } catch (error) {
      logger.error('Error al enviar email de restablecimiento:', error);
      // No devolvemos el error al usuario por seguridad
    }

    return {
      success: true,
      message:
        'Se han enviado instrucciones para restablecer tu contraseña a tu correo.',
    };
  }

  /**
   * Restablecer contraseña de usuario
   * @param token Token de restablecimiento
   * @param newPassword Nueva contraseña
   * @returns Respuesta de autenticación
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<IAuthResponse> {
    try {
      // Verificar token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      // Buscar usuario
      const user = await this.userRepository.findById(decoded.id);
      if (!user || user.session_token !== token) {
        throw new UnauthorizedError('Token inválido o expirado');
      }

      // Generar hash de la nueva contraseña
      const hashedPassword = PasswordService.hashPasswordMD5(newPassword);

      // Actualizar contraseña y limpiar token
      await this.userRepository.update(
        user.id,
        {
          password: hashedPassword,
          session_token: null as any,
        },
        'Usuario'
      );

      return {
        success: true,
        message: 'Contraseña actualizada correctamente',
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token inválido o expirado');
      }
      throw error;
    }
  }

  /**
   * Verificar email de usuario
   * @param token Token de verificación
   * @returns Respuesta de autenticación
   */
  async verifyEmail(token: string): Promise<IAuthResponse> {
    try {
      // Verificar token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      // Buscar usuario
      const user = await this.userRepository.findById(decoded.id);
      if (!user || user.session_token !== token) {
        throw new UnauthorizedError('Token inválido o expirado');
      }

      // Actualizar estado de verificación y limpiar token
      await this.userRepository.updateVerificationStatus(user.id, true);
      await this.userRepository.updateSessionToken(user.id, null);

      return {
        success: true,
        message: 'Correo electrónico verificado correctamente',
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token inválido o expirado');
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
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<IAuthResponse> {
    // Buscar usuario por ID
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Buscar usuario por email para incluir la contraseña
    const userWithPassword = await this.userRepository.findByEmail(user.email, true);
    
    if (!userWithPassword || !userWithPassword.password) {
      throw new UnauthorizedError('Este usuario no tiene contraseña configurada');
    }

    // Verificar contraseña actual (compatible con MD5 y PBKDF2)
    const isPasswordValid = PasswordService.verifyPassword(
      currentPassword,
      userWithPassword.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('La contraseña actual es incorrecta');
    }

    // Generar hash de la nueva contraseña
    const hashedPassword = PasswordService.hashPasswordMD5(newPassword);

    // Actualizar contraseña
    await this.userRepository.update(
      user.id,
      {
        password: hashedPassword,
        updated_at: new Date(),
      },
      'Usuario'
    );

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
  async logout(userId: number): Promise<IAuthResponse> {
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
  private async generateToken(user: User): Promise<string> {
    // Obtener el rol del usuario
    const userRoleRepository = AppDataSource.getRepository(UserRole);
    const userRole = await userRoleRepository.findOne({
      where: { user_id: user.id },
      relations: ['role']
    });

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: userRole?.role?.name || 'User'
    };

    // @ts-ignore - Forzar a TypeScript a ignorar este error específico
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verificar contraseña del usuario para eliminación de cuenta
   * @param userId ID del usuario
   * @param password Contraseña a verificar
   * @returns Respuesta de autenticación
   */
  async verifyPasswordForDeletion(userId: number, password: string): Promise<IAuthResponse> {
    // Buscar usuario por ID
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Buscar usuario por email para incluir la contraseña
    const userWithPassword = await this.userRepository.findByEmail(user.email, true);
    
    if (!userWithPassword || !userWithPassword.password) {
      throw new UnauthorizedError('Este usuario no tiene contraseña configurada');
    }

    // Verificar contraseña (compatible con MD5 y PBKDF2)
    const isPasswordValid = PasswordService.verifyPassword(
      password,
      userWithPassword.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Contraseña incorrecta');
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
  async getAccountDeletionInfo(): Promise<IAccountDeletionInfo> {
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
  async deleteAccount(userId: number, deleteData: IDeleteAccountData): Promise<IAuthResponse> {
    const { password, confirmation, reason, otherReason } = deleteData;

    // Verificar que la confirmación sea correcta
    const accountInfo = await this.getAccountDeletionInfo();
    if (confirmation !== accountInfo.confirmationText) {
      throw new BadRequestError('El texto de confirmación no es correcto');
    }

    // Verificar contraseña y obtener usuario
    await this.verifyPasswordForDeletion(userId, password);

    // Registrar la razón de eliminación (esto podría guardarse en una tabla de auditoría)
    logger.info(`Usuario ${userId} eliminó su cuenta. Razón: ${reason || 'No especificada'} ${otherReason ? `- ${otherReason}` : ''}`);

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
  async createUserSession(userId: number, deviceInfo?: IDeviceInfo): Promise<ISessionResponse> {
    const startTime = Date.now();
    logger.info(`🔐 [SESSION] Iniciando creación de sesión para usuario ${userId}`);
    
    // Generar tokens
    const userFindStart = Date.now();
    const user = await this.userRepository.findById(userId);
    const userFindEnd = Date.now();
    
    logger.info(`🔐 [SESSION] Búsqueda de usuario completada en ${userFindEnd - userFindStart}ms`);
    
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
    }

    // Generar token JWT
    const tokenGenStart = Date.now();
    const accessToken = await this.generateToken(user);
    const tokenGenEnd = Date.now();
    
    logger.info(`🔐 [SESSION] Generación de token completada en ${tokenGenEnd - tokenGenStart}ms`);
    
    // Generar refresh token
    const refreshTokenGenStart = Date.now();
    const refreshToken = this.generateRefreshToken(user);
    const refreshTokenGenEnd = Date.now();
    
    logger.info(`🔐 [SESSION] Generación de refresh token completada en ${refreshTokenGenEnd - refreshTokenGenStart}ms`);

    // Calcular fechas de expiración
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(config.jwt.expiresIn));
    
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 días

    // Formatear información del dispositivo
    let deviceInfoStr = null;
    if (deviceInfo) {
      deviceInfoStr = JSON.stringify(deviceInfo);
    }

    // Crear nueva sesión
    const sessionCreateStart = Date.now();
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
    const sessionCreateEnd = Date.now();
    
    const totalTime = Date.now() - startTime;
    logger.info(`🔐 [SESSION] Sesión creada exitosamente en ${totalTime}ms - ID: ${session.id}`);
    logger.info(`🔐 [SESSION] Tiempo en DB: ${sessionCreateEnd - sessionCreateStart}ms`);

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
  async getActiveSessions(userId: number, currentSessionId?: number): Promise<IActiveSession[]> {
    const sessions = await this.userSessionRepository.findActiveSessionsByUserId(userId);
    
    return sessions.map((session: any) => {
      let deviceInfo = null;
      try {
        if (session.device_info) {
          deviceInfo = JSON.parse(session.device_info);
        }
      } catch (error) {
        logger.error('Error al parsear información del dispositivo', error);
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
  async logoutSession(logoutData: ILogoutSessionData): Promise<IAuthResponse> {
    const { sessionId, accessToken, logoutAll } = logoutData;
    
    if (logoutAll) {
      // Si se solicita cerrar todas las sesiones, necesitamos el ID de usuario
      if (!accessToken && !sessionId) {
        throw new BadRequestError('Se requiere un token de acceso o ID de sesión para cerrar todas las sesiones');
      }
      
      let userId: number;
      
      if (sessionId) {
        // Obtener sesión por ID
        const session = await this.userSessionRepository.findById(sessionId);
        if (!session) {
          throw new NotFoundError(`Sesión con ID ${sessionId} no encontrada`);
        }
        userId = session.user_id;
      } else {
        // Obtener sesión por token de acceso
        const session = await this.userSessionRepository.findByAccessToken(accessToken!);
        if (!session) {
          throw new UnauthorizedError('Token de acceso inválido');
        }
        userId = session.user_id;
      }
      
      // Desactivar todas las sesiones del usuario
      await this.userSessionRepository.deactivateAllUserSessions(userId);
      
      return {
        success: true,
        message: 'Todas las sesiones han sido cerradas correctamente'
      };
    } else if (sessionId) {
      // Cerrar sesión específica por ID
      await this.userSessionRepository.deactivateSession(sessionId);
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      };
    } else if (accessToken) {
      // Cerrar sesión específica por token de acceso
      await this.userSessionRepository.deactivateByAccessToken(accessToken);
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      };
    } else {
      throw new BadRequestError('Se requiere un ID de sesión o token de acceso para cerrar sesión');
    }
  }

  /**
   * Limpiar sesiones expiradas y antiguas
   * @returns Número de sesiones limpiadas
   */
  async cleanupSessions(): Promise<{ expired: number, inactive: number }> {
    const expired = await this.userSessionRepository.cleanExpiredSessions();
    const inactive = await this.userSessionRepository.cleanInactiveSessions(30); // Limpiar sesiones inactivas de más de 30 días
    
    return { expired, inactive };
  }
}
