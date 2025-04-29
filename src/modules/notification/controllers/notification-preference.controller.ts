// src/modules/notification/controllers/notification-preference.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { ApiResponse } from '../../../core/interfaces/response.interface';
import { NotificationType } from '../../../models/notification.model';
import { BadRequestError } from '../../../utils/error-handler';

export class NotificationPreferenceController {
  private notificationPreferenceService: NotificationPreferenceService;

  constructor() {
    this.notificationPreferenceService = new NotificationPreferenceService();
  }

  /**
   * Obtener preferencias de notificación del usuario autenticado
   * @route GET /api/notifications/preferences
   */
  getUserPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const preferences = await this.notificationPreferenceService.getUserPreferences(userId);
      
      const response: ApiResponse = {
        success: true,
        data: preferences,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener una preferencia específica del usuario autenticado
   * @route GET /api/notifications/preferences/:type
   */
  getUserPreferenceByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const type = req.params.type as NotificationType;
      
      if (!Object.values(NotificationType).includes(type)) {
        throw new BadRequestError('Tipo de notificación inválido');
      }
      
      const preference = await this.notificationPreferenceService.getUserPreferenceByType(userId, type);
      
      const response: ApiResponse = {
        success: true,
        data: preference,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar una preferencia específica del usuario autenticado
   * @route PUT /api/notifications/preferences/:type
   */
  updatePreference = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const type = req.params.type as NotificationType;
      
      if (!Object.values(NotificationType).includes(type)) {
        throw new BadRequestError('Tipo de notificación inválido');
      }
      
      const { emailEnabled, pushEnabled, inappEnabled } = req.body;
      
      // Verificar que al menos un canal está habilitado
      if (emailEnabled === false && pushEnabled === false && inappEnabled === false) {
        throw new BadRequestError('Debe habilitar al menos un canal de notificación');
      }
      
      const preference = await this.notificationPreferenceService.updatePreference(
        userId,
        type,
        {
          emailEnabled,
          pushEnabled,
          inappEnabled
        }
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Preferencia actualizada correctamente',
        data: preference,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Inicializar todas las preferencias de notificación para el usuario autenticado
   * @route POST /api/notifications/preferences/initialize
   */
  initializePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const preferences = await this.notificationPreferenceService.initializeUserPreferences(userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Preferencias inicializadas correctamente',
        data: preferences,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener preferencias de notificación de un usuario específico (admin)
   * @route GET /api/admin/notifications/preferences/:userId
   */
  getAnyUserPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        throw new BadRequestError('ID de usuario inválido');
      }
      
      const preferences = await this.notificationPreferenceService.getUserPreferences(userId);
      
      const response: ApiResponse = {
        success: true,
        data: preferences,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar preferencia de un usuario específico (admin)
   * @route PUT /api/admin/notifications/preferences/:userId/:type
   */
  updateAnyUserPreference = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        throw new BadRequestError('ID de usuario inválido');
      }
      
      const type = req.params.type as NotificationType;
      
      if (!Object.values(NotificationType).includes(type)) {
        throw new BadRequestError('Tipo de notificación inválido');
      }
      
      const { emailEnabled, pushEnabled, inappEnabled } = req.body;
      
      const preference = await this.notificationPreferenceService.updatePreference(
        userId,
        type,
        {
          emailEnabled,
          pushEnabled,
          inappEnabled
        }
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Preferencia actualizada correctamente',
        data: preference,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}