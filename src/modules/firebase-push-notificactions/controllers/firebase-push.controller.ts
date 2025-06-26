import { Request, Response, NextFunction } from 'express';
import { FirebasePushService } from '../services/firebase-push.service';
import { ApiResponse } from '../../../core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';
import { DevicePlatform } from '../../../models/device-token.model';
import {
  RegisterTokenDto,
  SendPushNotificationDto,
  BulkNotificationDto,
  TopicNotificationDto,
  SubscribeTopicDto,
  NotificationResponseDto
} from '../dto/firebase-push.dto';

export class FirebasePushController {
  private firebasePushService: FirebasePushService;

  constructor() {
    this.firebasePushService = new FirebasePushService();
  }

  /**
   * Registra un token de dispositivo
   */
  registerToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, platform, deviceInfo } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }

      if (!token || !platform) {
        throw new BadRequestError('Token y plataforma son requeridos');
      }

      if (!Object.values(DevicePlatform).includes(platform)) {
        throw new BadRequestError('Plataforma inválida');
      }

      await this.firebasePushService.registerDeviceToken(userId, token, platform, deviceInfo);

      const response: ApiResponse = {
        success: true,
        message: 'Token de dispositivo registrado exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Desregistra un token de dispositivo
   */
  unregisterToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new BadRequestError('Token es requerido');
      }

      await this.firebasePushService.unregisterDeviceToken(token);

      const response: ApiResponse = {
        success: true,
        message: 'Token de dispositivo desregistrado exitosamente'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Envía push notification de prueba
   */
  sendTestNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, body, data } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }

      if (!title || !body) {
        throw new BadRequestError('Título y cuerpo son requeridos');
      }

      const success = await this.firebasePushService.sendToUser(userId, {
        title,
        body,
        data
      });

      const response: ApiResponse = {
        success,
        message: success ? 'Notificación enviada exitosamente' : 'No se pudo enviar la notificación'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Registra token con información adicional para Angular/Ionic
   */
  registerTokenEnhanced = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, platform, deviceInfo, appVersion, osVersion } = req.body as RegisterTokenDto;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }

      if (!token || !platform) {
        throw new BadRequestError('Token y plataforma son requeridos');
      }

      const enhancedDeviceInfo = {
        deviceInfo: deviceInfo || 'Unknown',
        appVersion: appVersion || '1.0.0',
        osVersion: osVersion || 'Unknown',
        registeredAt: new Date().toISOString()
      };

      await this.firebasePushService.registerDeviceToken(
        userId,
        token,
        platform,
        JSON.stringify(enhancedDeviceInfo)
      );

      const response: NotificationResponseDto = {
        success: true,
        message: 'Token registrado exitosamente con información extendida'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Envía notificación masiva optimizada para Angular/Ionic
   */
  sendBulkNotificationEnhanced = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userIds, title, body, data, imageUrl, clickAction, icon, sound, badge } = req.body as BulkNotificationDto;

      if (!userIds || userIds.length === 0) {
        throw new BadRequestError('Lista de usuarios requerida');
      }

      if (!title || !body) {
        throw new BadRequestError('Título y cuerpo son requeridos');
      }

      const notification = {
        title,
        body,
        data: {
          ...data,
          type: 'bulk_notification',
          timestamp: Date.now().toString()
        },
        imageUrl,
        clickAction: clickAction || '/tabs/home'
      };

      let successCount = 0;
      let failureCount = 0;
      const invalidTokens: string[] = [];

      for (const userId of userIds) {
        try {
          const success = await this.firebasePushService.sendToUser(userId, notification);
          if (success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          failureCount++;
        }
      }

      const response: NotificationResponseDto = {
        success: successCount > 0,
        message: `Notificaciones enviadas: ${successCount}/${userIds.length}`,
        successCount,
        failureCount
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Suscribe dispositivos a topics para Angular/Ionic
   */
  subscribeToTopicEnhanced = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topic, tokens } = req.body as SubscribeTopicDto;
      const userId = req.user?.id;

      if (!topic) {
        throw new BadRequestError('Topic es requerido');
      }

      let tokensToSubscribe: string[] = [];

      if (tokens && tokens.length > 0) {
        tokensToSubscribe = tokens;
      } else if (userId) {
        // Si no se proporcionan tokens, usar los del usuario actual
        const deviceTokens = await this.firebasePushService['deviceTokenRepository'].findActiveTokensByUserId(userId);
        tokensToSubscribe = deviceTokens.map(dt => dt.token);
      }

      if (tokensToSubscribe.length === 0) {
        throw new BadRequestError('No se encontraron tokens para suscribir');
      }

      await this.firebasePushService.subscribeToTopic(tokensToSubscribe, topic);

      const response: NotificationResponseDto = {
        success: true,
        message: `${tokensToSubscribe.length} dispositivos suscritos al topic ${topic}`
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene estadísticas de notificaciones para dashboard Angular/Ionic
   */
  getNotificationStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }

      const deviceTokens = await this.firebasePushService['deviceTokenRepository'].findActiveTokensByUserId(userId);
      
      const stats = {
        activeDevices: deviceTokens.length,
        platforms: deviceTokens.reduce((acc, token) => {
          acc[token.platform] = (acc[token.platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        lastRegistered: deviceTokens.length > 0 
          ? Math.max(...deviceTokens.map(t => new Date(t.created_at).getTime()))
          : null
      };

      const response: ApiResponse = {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}