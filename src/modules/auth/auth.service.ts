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
  IDeleteAccountData
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
import { User } from '@models/user.model';

import { HealthRepository } from '../../modules/health/health.repository';
import { MedicalInfoRepository } from '../../modules/medical-info/medical-info.repository';
import { FileUploadService } from '../../utils/file-upload.util';
import { AppDataSource } from '../../core/config/database';
import { RoleRepository } from '../role/role.repository';
import { UserRole } from '../../models/user-role.model';


export class AuthService {
  private userRepository: UserRepository;
  private patientRepository: PatientRepository;
  private healthRepository: HealthRepository;
  private medicalInfoRepository: MedicalInfoRepository;
  private roleRepository: RoleRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.patientRepository = new PatientRepository(); 
    this.healthRepository = new HealthRepository();
    this.medicalInfoRepository = new MedicalInfoRepository();
    this.roleRepository = new RoleRepository();
  }

  /**
   * Iniciar sesión de usuario
   * @param credentials Credenciales de inicio de sesión
   * @returns Respuesta de autenticación con token y datos de usuario
   */

async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
  const { email, password } = credentials;

  const normalizedEmail = email.toLowerCase();

  // Buscar usuario por email incluyendo el campo password
  const user = await this.userRepository.findByEmail(normalizedEmail, true);
  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // Verificar contraseña
  if (!user.password) {
    throw new UnauthorizedError(
      'Este usuario no tiene contraseña configurada'
    );
  }

  // Verificar contraseña (compatible con MD5 y PBKDF2)
  const isPasswordValid = PasswordService.verifyPassword(
    password,
    user.password
  );
  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // Si la verificación fue exitosa, verificar si necesitamos actualizar el hash
  // if (PasswordService.needsUpgrade(user.password)) {
  //   // Migrar la contraseña al nuevo formato de manera silenciosa
  //   const newHash = PasswordService.hashPassword(password);
  //   await this.userRepository.update(
  //     user.id,
  //     {
  //       password: newHash,
  //       updated_at: new Date(),
  //     },
  //     'Usuario'
  //   );
  // }

  let message = 'Sesión iniciada exitosamente';
  if (!user.verificado) {
    message = 'emailnoverificado';
  }

  // Generar token JWT
  const token = await this.generateToken(user);
  
  // Generar refresh token
  const refreshToken = this.generateRefreshToken(user);

  // Actualizar token de sesión en la base de datos
  await this.userRepository.updateSessionToken(user.id, token);

  // Obtener el conteo de pacientes a cargo
  const patientCount = await this.patientRepository.count({
    where: { a_cargo_id: user.id }
  });

  // Obtener pacientes a cargo del usuario
  let cared_persons = await this.patientRepository.findByCaregiverId(user.id);

  // Añadir datos de salud y localización para cada paciente a cargo
  if (cared_persons && cared_persons.length > 0) {
    const enrichedPatients = await Promise.all(
      cared_persons.map(async (patient) => {
        // Remove imagebs64 from patient object to reduce size
        // const { imagebs64, ...patientWithoutImage } = patient;
        const { ...patientWithoutImage } = patient;
        
        // Obtener datos de salud para el paciente
        const [
          latestVitals,
          medicalInfo
        ] = await Promise.all([
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
      })
    );

    // Reemplazar la lista original con la enriquecida
    cared_persons = enrichedPatients;
  }

  // Obtener el rol del usuario para incluirlo en la respuesta
  const userRoleRepository = AppDataSource.getRepository(UserRole);
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
      city_id: user.city_id,
      pubname: user.pubname,
      privname: user.privname,
      imagebs64: user.imagebs64,
      path: user.path,
      role: roleName, 
    },
    access_token: token,
    refresh_token: refreshToken,
    patientCount: patientCount,
    cared_persons: cared_persons,
  };

  return {
    success: true,
    message,
    data: userData,
    token,
    refresh_token: refreshToken
  };
}

  /**
   * Refrescar token de acceso usando un refresh token
   * @param refreshTokenData Datos del refresh token
   * @returns Nuevo token de acceso
   */
  async refreshToken(refreshTokenData: IRefreshTokenData): Promise<IAuthResponse> {
    const { refresh_token } = refreshTokenData;
    
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refresh_token, config.jwt.secret) as RefreshTokenPayload;
      
      // Validar que sea un refresh token
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Token inválido');
      }
      
      // Buscar usuario
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }
      
      // Generar nuevo token de acceso
      const newAccessToken = await this.generateToken(user);
      
      // Generar nuevo refresh token (opcional, para implementar rotación de tokens)
      const newRefreshToken = this.generateRefreshToken(user);
      
      // Actualizar token de sesión en la base de datos (opcional)
      await this.userRepository.updateSessionToken(user.id, newAccessToken);
      
      // Obtener el rol del usuario para incluirlo en la respuesta
      const userRoleRepository = AppDataSource.getRepository(UserRole);
      const userRole = await userRoleRepository.findOne({
        where: { user_id: user.id },
        relations: ['role']
      });
      const roleName = userRole?.role?.name || 'User';
      
      return {
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          role: roleName // Incluir el rol del usuario en la respuesta
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

    // TODO: Enviar email con instrucciones (implementar en un servicio de email)

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
   * Cerrar sesión de usuario
   * @param userId ID del usuario
   * @returns Respuesta de autenticación
   */
  async logout(userId: number): Promise<IAuthResponse> {
    // Limpiar token de sesión
    await this.userRepository.updateSessionToken(userId, null);

    return {
      success: true,
      message: 'Sesión cerrada correctamente',
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
}
