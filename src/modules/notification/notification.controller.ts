// src/modules/notification/controllers/notification.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { BadRequestError } from '../../utils/error-handler';
import { ApiResponse } from 'src/core/interfaces/response.interface';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Obtener notificaciones del usuario actual
   * @route GET /api/notifications
   */
  getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const notifications = await this.notificationService.getUserNotifications(userId);
      
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
   * Marcar notificación como leída
   * @route PATCH /api/notifications/:id/read
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de notificación inválido');
      }
      
      const notification = await this.notificationService.markAsRead(id);
      
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
}