// src/modules/notification/controllers/notification.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { ReminderService } from './services/reminder.service';
import { BadRequestError } from '../../utils/error-handler';
import { ApiResponse } from '../../core/interfaces/response.interface';
import { NotificationType } from '../../models/notification.model';

export class NotificationController {
  private notificationService: NotificationService;
  private reminderService: ReminderService;

  constructor() {
    this.notificationService = new NotificationService();
    this.reminderService = new ReminderService();
  }

  /**
   * Obtener notificaciones del usuario autenticado
   * @route GET /api/notifications
   */
  getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      // Obtener parámetros de consulta
      const includeRead = req.query.includeRead === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const notifications = await this.notificationService.getUserNotifications(
        userId, 
        includeRead, 
        limit
      );
      
      const response: ApiResponse = {
        success: true,
        data: notifications,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marcar una notificación como leída
   * @route PUT /api/notifications/:id/read
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      if (isNaN(notificationId)) {
        throw new BadRequestError('ID de notificación inválido');
      }
      
      const notification = await this.notificationService.markAsRead(notificationId, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Notificación marcada como leída',
        data: notification,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marcar todas las notificaciones como leídas
   * @route PUT /api/notifications/read-all
   */
  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const count = await this.notificationService.markAllAsRead(userId);
      
      const response: ApiResponse = {
        success: true,
        message: `${count} notificaciones marcadas como leídas`,
        data: { count },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar una notificación
   * @route DELETE /api/notifications/:id
   */
  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      if (isNaN(notificationId)) {
        throw new BadRequestError('ID de notificación inválido');
      }
      
      const result = await this.notificationService.deleteNotification(notificationId, userId);
      
      const response: ApiResponse = {
        success: result,
        message: result ? 'Notificación eliminada correctamente' : 'No se pudo eliminar la notificación',
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enviar una notificación a un usuario (admin)
   * @route POST /api/admin/notifications/send
   */
  sendNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, appointmentId, type, title, message, scheduledFor } = req.body;
      
      if (!userId || !title || !message || !type) {
        throw new BadRequestError('Faltan datos obligatorios');
      }
      
      if (!Object.values(NotificationType).includes(type)) {
        throw new BadRequestError('Tipo de notificación inválido');
      }
      
      // Convertir fecha programada si se proporciona
      let scheduledDate: Date | undefined = undefined;
      if (scheduledFor) {
        scheduledDate = new Date(scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
          throw new BadRequestError('Formato de fecha programada inválido');
        }
      }
      
      const notification = await this.notificationService.createNotification({
        user_id: userId,
        appointment_id: appointmentId,
        type,
        title,
        message,
        scheduled_for: scheduledDate
      });
      
      const response: ApiResponse = {
        success: true,
        message: scheduledDate 
          ? `Notificación programada para ${scheduledDate.toLocaleString()}` 
          : 'Notificación enviada correctamente',
        data: notification,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enviar notificación templated (admin)
   * @route POST /api/admin/notifications/send-templated
   */
  sendTemplatedNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, templateCode, data, appointmentId, scheduledFor } = req.body;
      
      if (!userId || !templateCode || !data) {
        throw new BadRequestError('Faltan datos obligatorios');
      }
      
      // Convertir fecha programada si se proporciona
      let scheduledDate: Date | undefined = undefined;
      if (scheduledFor) {
        scheduledDate = new Date(scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
          throw new BadRequestError('Formato de fecha programada inválido');
        }
      }
      
      const notification = await this.notificationService.sendTemplatedNotification(
        userId,
        templateCode,
        data,
        appointmentId,
        scheduledDate
      );
      
      const response: ApiResponse = {
        success: true,
        message: scheduledDate 
          ? `Notificación templated programada para ${scheduledDate.toLocaleString()}` 
          : 'Notificación templated enviada correctamente',
        data: notification,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enviar recordatorios de cita manualmente (admin)
   * @route POST /api/admin/notifications/send-reminders
   */
  sendAppointmentReminders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days, hours, minutes, includeCancelled } = req.body;
      
      const count = await this.reminderService.sendAppointmentReminders({
        days: days !== undefined ? parseInt(days) : undefined,
        hours: hours !== undefined ? parseInt(hours) : undefined,
        minutes: minutes !== undefined ? parseInt(minutes) : undefined,
        includeCancelled
      });
      
      const response: ApiResponse = {
        success: true,
        message: `${count} recordatorios enviados`,
        data: { count },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enviar resúmenes semanales de citas (admin)
   * @route POST /api/admin/notifications/send-summaries
   */
  sendWeeklySummaries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.reminderService.sendWeeklySummaries();
      
      const response: ApiResponse = {
        success: true,
        message: `${count} resúmenes semanales enviados`,
        data: { count },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Procesar notificaciones programadas (admin/cron)
   * @route POST /api/admin/notifications/process-scheduled
   */
  processScheduledNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.notificationService.processScheduledNotifications();
      
      const response: ApiResponse = {
        success: true,
        message: `${count} notificaciones programadas procesadas`,
        data: { count },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Procesar cola de notificaciones (admin/cron)
   * @route POST /api/admin/notifications/process-queue
   */
  processNotificationQueue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const count = await this.notificationService.processNotificationQueue(limit);
      
      const response: ApiResponse = {
        success: true,
        message: `${count} elementos de la cola procesados`,
        data: { count },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}