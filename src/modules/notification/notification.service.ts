// src/modules/notification/notification.service.ts
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { EmailService } from './services/email.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { Notification, NotificationType, NotificationStatus } from '../../models/notification.model';
import { CreateNotificationDto, TemplateData } from './notification.interface';
import { UserRepository } from '../user/user.repository';
import { BadRequestError, NotFoundError } from '../../utils/error-handler';
import logger from '../../utils/logger';
import { IsNull, LessThanOrEqual } from 'typeorm';

/**
 * Servicio principal para la gestión de notificaciones
 */
export class NotificationService {
  private notificationRepository: NotificationRepository;
  private userRepository: UserRepository;
  private queueService: NotificationQueueService;
  private templateService: NotificationTemplateService;
  private emailService: EmailService;
  private preferenceService: NotificationPreferenceService;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.userRepository = new UserRepository();
    this.queueService = new NotificationQueueService();
    this.templateService = new NotificationTemplateService();
    this.emailService = EmailService.getInstance();
    this.preferenceService = new NotificationPreferenceService();
  }

  /**
   * Crea una nueva notificación y la envía a través de los canales configurados
   * @param data Datos de la notificación
   * @returns Notificación creada
   */
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    try {
      // Verificar que el usuario existe
      const user = await this.userRepository.findById(data.user_id);
      if (!user) {
        throw new NotFoundError(`Usuario con ID ${data.user_id} no encontrado`);
      }
      
      // Crear la notificación
      const notification = await this.notificationRepository.create({
        user_id: data.user_id,
        appointment_id: data.appointment_id,
        type: data.type,
        title: data.title,
        message: data.message,
        status: data.scheduled_for ? NotificationStatus.PENDING : NotificationStatus.SENT,
        scheduled_for: data.scheduled_for,
        created_at: new Date()
      });
      
      // Si está programada para el futuro, no enviar ahora
      if (data.scheduled_for && data.scheduled_for > new Date()) {
        return notification;
      }
      
      // Enviar la notificación a través de los canales correspondientes
      await this.sendNotificationThroughChannels(notification);
      
      return notification;
    } catch (error) {
      logger.error('Error al crear notificación:', error);
      throw error;
    }
  }

  /**
   * Obtiene notificaciones de un usuario
   * @param userId ID del usuario
   * @param includeRead Incluir notificaciones leídas
   * @param limit Límite de resultados
   * @returns Lista de notificaciones
   */
  async getUserNotifications(userId: number, includeRead: boolean = false, limit: number = 50): Promise<Notification[]> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Construir condiciones de búsqueda
    const conditions: any = {
      where: { user_id: userId }
    };
    
    // Si no se incluyen leídas, filtrar por status
    if (!includeRead) {
      conditions.where.status = NotificationStatus.SENT;
      conditions.where.read_at = null;
    }
    
    // Ordenar por fecha de creación descendente y limitar resultados
    conditions.order = { created_at: 'DESC' };
    conditions.take = limit;
    
    return await this.notificationRepository.findAll(conditions);
  }

  /**
   * Marca una notificación como leída
   * @param notificationId ID de la notificación
   * @param userId ID del usuario (para verificación)
   * @returns Notificación actualizada
   */
  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    // Buscar la notificación
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new NotFoundError(`Notificación con ID ${notificationId} no encontrada`);
    }
    
    // Verificar que la notificación pertenece al usuario
    if (notification.user_id !== userId) {
      throw new BadRequestError('No tiene permiso para modificar esta notificación');
    }
    
    // Si ya está leída, devolver sin cambios
    if (notification.read_at) {
      return notification;
    }
    
    // Actualizar la notificación
    return await this.notificationRepository.update(
      notificationId,
      {
        read_at: new Date(),
        status: NotificationStatus.READ
      },
      'Notificación'
    );
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   * @param userId ID del usuario
   * @returns Número de notificaciones actualizadas
   */
  async markAllAsRead(userId: number): Promise<number> {
    // Buscar notificaciones no leídas
    const unreadNotifications = await this.notificationRepository.findAll({
      where: {
        user_id: userId,
        status: NotificationStatus.SENT,
        read_at: IsNull()
      }
    });
    
    if (unreadNotifications.length === 0) {
      return 0;
    }
    
    // Actualizar todas las notificaciones
    const now = new Date();
    let updatedCount = 0;
    
    for (const notification of unreadNotifications) {
      await this.notificationRepository.update(
        notification.id,
        {
          read_at: now,
          status: NotificationStatus.READ
        },
        'Notificación'
      );
      updatedCount++;
    }
    
    return updatedCount;
  }

  /**
   * Elimina una notificación
   * @param notificationId ID de la notificación
   * @param userId ID del usuario (para verificación)
   * @returns true si se eliminó correctamente
   */
  async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
    // Buscar la notificación
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new NotFoundError(`Notificación con ID ${notificationId} no encontrada`);
    }
    
    // Verificar que la notificación pertenece al usuario
    if (notification.user_id !== userId) {
      throw new BadRequestError('No tiene permiso para eliminar esta notificación');
    }
    
    // Eliminar la notificación
    return await this.notificationRepository.delete(notificationId, 'Notificación');
  }

  /**
   * Envía una notificación utilizando una plantilla
   * @param userId ID del usuario destinatario
   * @param templateCode Código de la plantilla
   * @param data Datos para la plantilla
   * @param appointmentId ID de la cita relacionada (opcional)
   * @param scheduledFor Fecha programada (opcional)
   * @returns Notificación creada
   */
  async sendTemplatedNotification(
    userId: number,
    templateCode: string,
    data: TemplateData,
    appointmentId?: number,
    scheduledFor?: Date
  ): Promise<Notification> {
    try {
      // Obtener la plantilla
      const template = await this.templateService.getTemplateByCode(templateCode);
      
      // Renderizar la plantilla
      const { subject, body } = await this.templateService.renderTemplate(templateCode, data);
      
      // Crear la notificación
      return await this.createNotification({
        user_id: userId,
        appointment_id: appointmentId,
        type: template.type,
        title: subject,
        message: body,
        scheduled_for: scheduledFor
      });
    } catch (error) {
      logger.error(`Error al enviar notificación templated (${templateCode}):`, error);
      throw error;
    }
  }

  /**
   * Envía una notificación a través de todos los canales habilitados
   * @param notification Notificación a enviar
   */
  private async sendNotificationThroughChannels(notification: Notification): Promise<void> {
    try {
      // Obtener el usuario
      const user = await this.userRepository.findById(notification.user_id);
      if (!user) {
        throw new NotFoundError(`Usuario con ID ${notification.user_id} no encontrado`);
      }
      
      // Verificar preferencias del usuario para este tipo de notificación
      const preferences = await this.preferenceService.getUserPreferenceByType(
        notification.user_id,
        notification.type
      );
      
      // Agregar a la cola para envío en la app (siempre)
      await this.queueService.enqueueNotification(
        notification.id,
        'inapp',
        { recipient: user.email }
      );
      
      // Enviar por email si está habilitado
      if (preferences.email_enabled && user.email) {
        await this.queueService.enqueueNotification(
          notification.id,
          'email',
          {
            to: user.email,
            subject: notification.title,
            text: notification.message,
            recipient: user.email
          }
        );
      }
      
      // Enviar por push si está habilitado y hay ID de notificación
      if (preferences.push_enabled && user.notificationid) {
        await this.queueService.enqueueNotification(
          notification.id,
          'push',
          {
            deviceToken: user.notificationid,
            title: notification.title,
            body: notification.message,
            data: {
              notificationId: notification.id,
              type: notification.type,
              appointmentId: notification.appointment_id
            },
            recipient: user.notificationid
          }
        );
      }
      
      // Actualizar la notificación como enviada
      await this.notificationRepository.update(
        notification.id,
        {
          status: NotificationStatus.SENT,
          sent_at: new Date()
        },
        'Notificación'
      );
    } catch (error) {
      logger.error(`Error al enviar notificación ${notification.id} por canales:`, error);
      // Registrar el error pero no fallar el flujo completo
    }
  }

  /**
   * Procesa las notificaciones programadas que están pendientes
   * @returns Número de notificaciones procesadas
   */
  async processScheduledNotifications(): Promise<number> {
    try {
      const now = new Date();
      
      // Buscar notificaciones programadas cuyo tiempo ha llegado
      const pendingNotifications = await this.notificationRepository.findAll({
        where: {
          status: NotificationStatus.PENDING,
          scheduled_for: LessThanOrEqual(now) // Menor o igual a ahora
        }
      });
      
      if (pendingNotifications.length === 0) {
        return 0;
      }
      
      let processedCount = 0;
      
      // Procesar cada notificación
      for (const notification of pendingNotifications) {
        try {
          await this.sendNotificationThroughChannels(notification);
          processedCount++;
        } catch (error) {
          logger.error(`Error al procesar notificación programada ${notification.id}:`, error);
          // Continuar con la siguiente notificación
        }
      }
      
      return processedCount;
    } catch (error) {
      logger.error('Error al procesar notificaciones programadas:', error);
      throw error;
    }
  }

  /**
   * Envía la cola de notificaciones pendientes
   * @param limit Límite de elementos a procesar
   * @returns Número de elementos procesados
   */
  async processNotificationQueue(limit: number = 10): Promise<number> {
    return await this.queueService.processQueue(limit);
  }
}