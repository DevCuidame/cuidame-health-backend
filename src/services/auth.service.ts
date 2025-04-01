import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/environment';
import { UserRepository } from '../repositories/user.repository';
import { ILoginCredentials, JwtPayload, IRegisterData } from '../interfaces/auth.interface';
import { User } from '../models/user.model';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/error-handler';
import { IAuthResponse } from '../interfaces/auth.interface';
import logger from '../utils/logger';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
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
      throw new UnauthorizedError('Este usuario no tiene contraseña configurada');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar si el usuario está verificado
    let message = 'Sesión iniciada exitosamente';
    if (!user.verificado) {
      message = 'emailnoverificado';
    }

    // Generar token JWT
    const token = this.generateToken(user);

    // Actualizar token de sesión en la base de datos
    await this.userRepository.updateSessionToken(user.id, token);

    // Crear objeto de respuesta
    const userData = {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      verificado: user.verificado,
      // Agregar roles si están disponibles
      roles: user.userRoles?.map(ur => ur.role.name) || [],
      session_token: token
    };

    return {
      success: true,
      message,
      data: userData,
      token
    };
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
      throw new BadRequestError('El correo electrónico ya está registrado');
    }

    // Generar hash de la contraseña
    const hashedPassword = await this.hashPassword(password);

    // Generar código único para el usuario
    const code = `USR-${uuidv4().substring(0, 8)}`;
    const hashcode = uuidv4();

    // Crear usuario en la base de datos
    const newUser = await this.userRepository.create({
      ...userData,
      code,
      hashcode,
      password: hashedPassword,
      verificado: false, // Por defecto no verificado
      created_at: new Date(),
      updated_at: new Date()
    });

    // Asignar rol por defecto (usuario normal)
    await this.userRepository.assignRole(newUser.id, 2); // Asumiendo que el ID 2 es para usuarios normales

    // TODO: Enviar email de verificación (implementar en un servicio de email)

    return {
      success: true,
      message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.',
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        lastname: newUser.lastname
      }
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
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.'
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
      message: 'Se han enviado instrucciones para restablecer tu contraseña a tu correo.'
    };
  }

  /**
   * Restablecer contraseña de usuario
   * @param token Token de restablecimiento
   * @param newPassword Nueva contraseña
   * @returns Respuesta de autenticación
   */
  async resetPassword(token: string, newPassword: string): Promise<IAuthResponse> {
    try {
      // Verificar token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      // Buscar usuario
      const user = await this.userRepository.findById(decoded.id);
      if (!user || user.session_token !== token) {
        throw new UnauthorizedError('Token inválido o expirado');
      }
      
      // Generar hash de la nueva contraseña
      const hashedPassword = await this.hashPassword(newPassword);
      
      // Actualizar contraseña y limpiar token
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        session_token: null
      }, 'Usuario');
      
      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
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
        message: 'Correo electrónico verificado correctamente'
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
      message: 'Sesión cerrada correctamente'
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
      role: user.userRoles?.[0]?.role.name || 'user'
    };
    
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Generar hash de contraseña
   * @param password Contraseña en texto plano
   * @returns Hash de la contraseña
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}