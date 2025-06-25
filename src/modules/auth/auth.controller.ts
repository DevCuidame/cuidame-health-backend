import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth/auth.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../auth/auth.dto';
import { ApiResponse } from '../../core/interfaces/response.interface';
import { validateDto } from '../../middlewares/validator.middleware';
import { IDeviceInfo } from '../auth/auth.interface';
import  logger  from '../../utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Iniciar sesión de usuario
   * @route POST /api/auth/login
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      logger.info(`🔐 [LOGIN-${requestId}] Iniciando proceso de login para: ${req.body.email}`);
      
      const credentials: LoginDto = req.body;

      // Extraer información del dispositivo del request
      const deviceInfo = {
        deviceName: req.body.deviceName || 'Dispositivo desconocido',
        deviceType: req.body.deviceType || 'unknown',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
      };

      logger.info(`🔐 [LOGIN-${requestId}] Información del dispositivo preparada - IP: ${deviceInfo.ipAddress}`);
      
      const authStartTime = Date.now();
      const result = await this.authService.login(credentials, deviceInfo);
      const authEndTime = Date.now();
      
      logger.info(`🔐 [LOGIN-${requestId}] Servicio de autenticación completado en ${authEndTime - authStartTime}ms`);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      };

      const totalTime = Date.now() - startTime;
      logger.info(`🔐 [LOGIN-${requestId}] Login completado exitosamente en ${totalTime}ms`);
      
      res.status(200).json(response);
    } catch (error) {
      const totalTime = Date.now() - startTime;
      logger.error(`🔐 [LOGIN-${requestId}] Error en login después de ${totalTime}ms:`, error);
      next(error);
    }
  };

  /**
   * Obtener datos de pacientes a cargo del usuario autenticado
   * @route GET /api/auth/cared-patients
   */
  getCaredPatients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Obtener el usuario del middleware de autenticación
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          timestamp: new Date().toISOString(),
        });
      }

      // Obtener parámetros de consulta
      const includeHealthData = req.query.includeHealth !== 'false'; // Por defecto true
      const includeMedicalInfo = req.query.includeMedical !== 'false'; // Por defecto true

      const caredPatients = await this.authService.getCaredPatientsData(
        userId,
        includeHealthData,
        includeMedicalInfo
      );

      const response: ApiResponse = {
        success: true,
        message: 'Datos de pacientes obtenidos exitosamente',
        data: {
          patients: caredPatients,
          count: caredPatients.length,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener datos básicos de pacientes (sin información médica)
   * @route GET /api/auth/cared-patients/basic
   */
  getCaredPatientsBasic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          timestamp: new Date().toISOString(),
        });
      }

      const caredPatients = await this.authService.getCaredPatientsData(
        userId,
        false, // Sin datos de salud
        false // Sin información médica
      );

      const response: ApiResponse = {
        success: true,
        message: 'Datos básicos de pacientes obtenidos exitosamente',
        data: {
          patients: caredPatients,
          count: caredPatients.length,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refrescar token de acceso
   * @route POST /api/auth/refresh-token
   */
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({
          success: false,
          message: 'Refresh token no proporcionado',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.authService.refreshToken({ refresh_token });

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Registrar un nuevo usuario
   * @route POST /api/auth/register
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: RegisterDto = req.body;
      const result = await this.authService.register(userData);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Solicitar restablecimiento de contraseña
   * @route POST /api/auth/forgot-password
   */
  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email }: ForgotPasswordDto = req.body;
      const result = await this.authService.forgotPassword(email);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Restablecer contraseña
   * @route POST /api/auth/reset-password
   */
  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, password, confirmPassword }: ResetPasswordDto = req.body;

      // Verificar que las contraseñas coincidan
      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await this.authService.resetPassword(token, password);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verificar correo electrónico
   * @route GET /api/auth/verify-email/:token
   */
  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.params;
      const result = await this.authService.verifyEmail(token);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cerrar sesión
   * @route POST /api/auth/logout
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(200).json({
          success: true,
          message: 'No hay sesión activa',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await this.authService.logout(userId);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verificar contraseña para eliminación de cuenta
   * @route POST /api/auth/verify-password
   */
  verifyPasswordForDeletion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { password } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'No autorizado',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.authService.verifyPasswordForDeletion(
        userId,
        password
      );

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener información para eliminación de cuenta
   * @route GET /api/auth/account-deletion-info
   */
  getAccountDeletionInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.getAccountDeletionInfo();

      const response: ApiResponse = {
        success: true,
        message: 'Información obtenida correctamente',
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar cuenta de usuario
   * @route DELETE /api/auth/delete-account
   */
  deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deleteData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'No autorizado',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.authService.deleteAccount(userId, deleteData);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cambiar contraseña de usuario
   * @route PUT /api/auth/change-password
   */
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'No autorizado',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener sesiones activas del usuario
   * @route GET /api/auth/sessions
   */
  getActiveSessions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'No autorizado',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const sessions = await this.authService.getActiveSessions(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Sesiones activas obtenidas correctamente',
        data: sessions,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cerrar sesión específica o todas las sesiones
   * @route POST /api/auth/logout-session
   */
  logoutSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sessionId, logoutAll } = req.body;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');

      if (!accessToken) {
        res.status(401).json({
          success: false,
          message: 'Token de acceso requerido',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const logoutData = {
        sessionId,
        accessToken,
        logoutAll: logoutAll || false,
      };

      const result = await this.authService.logoutSession(logoutData);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Limpiar sesiones expiradas
   * @route POST /api/auth/cleanup-sessions
   */
  cleanupSessions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.cleanupSessions();

      const response: ApiResponse = {
        success: true,
        message: `Limpieza completada: ${result.expired} sesiones expiradas y ${result.inactive} sesiones inactivas eliminadas`,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
