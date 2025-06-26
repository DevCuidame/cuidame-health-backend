import * as admin from 'firebase-admin';
import FirebaseConfig from '../../../core/config/firebase.config';
import { DeviceTokenRepository } from '../repositories/device-token.repository';
import { DevicePlatform } from '../../../models/device-token.model';
import logger from '../../../utils/logger';

export interface PushNotificationData {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
  clickAction?: string;
}

export interface SendPushOptions {
  userId?: number;
  tokens?: string[];
  topic?: string;
  condition?: string;
}

export class FirebasePushService {
  private messaging: admin.messaging.Messaging;
  private deviceTokenRepository: DeviceTokenRepository;

  constructor() {
    this.messaging = FirebaseConfig.getInstance().getMessaging();
    this.deviceTokenRepository = new DeviceTokenRepository();
  }

  /**
   * Envía push notification a un usuario específico
   */
  async sendToUser(userId: number, notification: PushNotificationData): Promise<boolean> {
    try {
      const deviceTokens = await this.deviceTokenRepository.findActiveTokensByUserId(userId);
      
      if (deviceTokens.length === 0) {
        logger.warn(`No se encontraron tokens activos para el usuario ${userId}`);
        return false;
      }

      const tokens = deviceTokens.map(dt => dt.token);
      return await this.sendToTokens(tokens, notification);
    } catch (error) {
      logger.error('Error enviando push notification a usuario:', error);
      return false;
    }
  }

  /**
   * Envía push notification a tokens específicos
   */
  async sendToTokens(tokens: string[], notification: PushNotificationData): Promise<boolean> {
    try {
      // Para Angular/Ionic, optimizamos la configuración de notificaciones
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data || {},
        tokens: tokens,
        android: {
          notification: {
            clickAction: notification.clickAction || 'FCM_PLUGIN_ACTIVITY',
            channelId: 'cuidame_health_notifications',
            sound: 'default',
            priority: 'high' as const
          },
          data: {
            ...notification.data,
            click_action: notification.clickAction || 'FCM_PLUGIN_ACTIVITY'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: 'default',
              badge: 1,
              category: notification.clickAction || 'GENERAL'
            }
          }
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge-72x72.png',
            requireInteraction: true,
            actions: [
              {
                action: 'open',
                title: 'Abrir App'
              }
            ]
          },
          fcmOptions: {
            link: notification.clickAction || '/'
          }
        }
      };

      // Usar sendEachForMulticast en lugar de sendMulticast para mejor compatibilidad
      const response = await this.messaging.sendEachForMulticast(message);
      
      // Manejar tokens inválidos
      if (response.failureCount > 0) {
        await this.handleFailedTokens(tokens, response.responses);
      }

      logger.info(`Push notifications enviadas: ${response.successCount}/${tokens.length}`);
      return response.successCount > 0;
    } catch (error) {
      logger.error('Error enviando push notifications:', error);
      return false;
    }
  }

  /**
   * Envía push notification a un topic
   */
  async sendToTopic(topic: string, notification: PushNotificationData): Promise<boolean> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data || {},
        topic: topic
      };

      const response = await this.messaging.send(message);
      logger.info(`Push notification enviada al topic ${topic}: ${response}`);
      return true;
    } catch (error) {
      logger.error(`Error enviando push notification al topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Registra un token de dispositivo
   */
  async registerDeviceToken(userId: number, token: string, platform: DevicePlatform, deviceInfo?: string): Promise<void> {
    try {
      await this.deviceTokenRepository.upsertToken(userId, token, platform, deviceInfo);
      logger.info(`Token de dispositivo registrado para usuario ${userId}`);
    } catch (error) {
      logger.error('Error registrando token de dispositivo:', error);
      throw error;
    }
  }

  /**
   * Desregistra un token de dispositivo
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    try {
      await this.deviceTokenRepository.deactivateToken(token);
      logger.info(`Token de dispositivo desregistrado: ${token}`);
    } catch (error) {
      logger.error('Error desregistrando token de dispositivo:', error);
      throw error;
    }
  }

  /**
   * Suscribe tokens a un topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await this.messaging.subscribeToTopic(tokens, topic);
      logger.info(`${tokens.length} tokens suscritos al topic ${topic}`);
    } catch (error) {
      logger.error(`Error suscribiendo al topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Maneja tokens que fallaron en el envío
   */
  private async handleFailedTokens(tokens: string[], responses: admin.messaging.SendResponse[]): Promise<void> {
    const failedTokens: string[] = [];
    
    responses.forEach((response, index) => {
      if (!response.success) {
        const error = response.error;
        if (error?.code === 'messaging/invalid-registration-token' || 
            error?.code === 'messaging/registration-token-not-registered') {
          failedTokens.push(tokens[index]);
        }
      }
    });

    // Desactivar tokens inválidos
    for (const token of failedTokens) {
      await this.deviceTokenRepository.deactivateToken(token);
    }

    if (failedTokens.length > 0) {
      logger.info(`${failedTokens.length} tokens inválidos desactivados`);
    }
  }
}