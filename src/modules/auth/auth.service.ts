import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../core/config/environment';
import {
  ILoginCredentials,
  JwtPayload,
  IRegisterData,
  RefreshTokenPayload,
  IRefreshTokenData
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


export class AuthService {
  private userRepository: UserRepository;
  private patientRepository: PatientRepository;
  private healthRepository: HealthRepository;
  private medicalInfoRepository: MedicalInfoRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.patientRepository = new PatientRepository(); 
    this.healthRepository = new HealthRepository();
    this.medicalInfoRepository = new MedicalInfoRepository();
  }

  /**
   * Iniciar sesión de usuario
   * @param credentials Credenciales de inicio de sesión
   * @returns Respuesta de autenticación con token y datos de usuario
   */
  async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    const { email, password } = credentials;

    // Buscar usuario por email incluyendo el campo password
    const user = await this.userRepository.findByEmail(email, true);
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
    if (PasswordService.needsUpgrade(user.password)) {
      // Migrar la contraseña al nuevo formato de manera silenciosa
      const newHash = PasswordService.hashPassword(password);
      await this.userRepository.update(
        user.id,
        {
          password: newHash,
          updated_at: new Date(),
        },
        'Usuario'
      );
    }

    let message = 'Sesión iniciada exitosamente';
    if (!user.verificado) {
      message = 'emailnoverificado';
    }

    // Generar token JWT
    const token = this.generateToken(user);
    
    // Generar refresh token
    const refreshToken = this.generateRefreshToken(user);

    // Actualizar token de sesión en la base de datos
    await this.userRepository.updateSessionToken(user.id, token);

    // Obtener el conteo de pacientes a cargo
    const patientCount = await this.patientRepository.count({
      where: { a_cargo_id: user.id }
    });

    // Obtener pacientes a cargo del usuario
    let cared_persons = await this.patientRepository.findAll({
      where: { a_cargo_id: user.id }
    });

    // Añadir datos de salud para cada paciente a cargo
    if (cared_persons && cared_persons.length > 0) {
      const enrichedPatients = await Promise.all(
        cared_persons.map(async (patient) => {
          // Obtener datos de salud para el paciente
          const [
            latestVitals,
            medicalInfo
          ] = await Promise.all([
            this.healthRepository.getLatestVitals(patient.id),
            this.medicalInfoRepository.getAllMedicalInfo(patient.id)
          ]);

          // Crear un objeto que combine el paciente con sus datos de salud
          return {
            ...patient,
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

    // Crear objeto de respuesta
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
      },
      roles: user.userRoles?.map((ur) => ur.role.name) || [],
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
      const newAccessToken = this.generateToken(user);
      
      // Generar nuevo refresh token (opcional, para implementar rotación de tokens)
      const newRefreshToken = this.generateRefreshToken(user);
      
      // Actualizar token de sesión en la base de datos (opcional)
      await this.userRepository.updateSessionToken(user.id, newAccessToken);
      
      return {
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken
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
      role: user.userRoles?.[0]?.role.name || 'user',
      type: 'refresh',
      token_version: 1, // Versión del token para invalidación masiva si es necesario
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '7d', // El refresh token dura más tiempo
    });
  }

  /**
   * Registrar un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Respuesta de autenticación
   */
  async register(userData: IRegisterData): Promise<IAuthResponse> {
    const { email, password } = userData;
  
    // Verificar si el email ya está registrado
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('No logramos registrar tu correo electrónico.');
    }
    
    // Verificar si el numero de identificación ya está registrado
    const existingUserIdentification = await this.userRepository.findByIdentification(userData.numberid);
    if (existingUserIdentification) {
      throw new BadRequestError('No logramos registrar tu número de documento.');
    }
  
    // Generar hash de la contraseña
    const hashedPassword = PasswordService.hashPassword(password);
  
    const imageBase64 = userData.imagebs64;
    
    const userDataToSave = { ...userData };
    delete userDataToSave.imagebs64;
  
    const newUser = await this.userRepository.create({
      ...userDataToSave,
      password: hashedPassword,
      verificado: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
  
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
      const hashedPassword = PasswordService.hashPassword(newPassword);

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
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.userRoles?.[0]?.role.name || 'user',
    };

    // @ts-ignore - Forzar a TypeScript a ignorar este error específico
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }
}
