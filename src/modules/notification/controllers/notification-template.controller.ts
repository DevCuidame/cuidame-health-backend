// src/modules/notification/controllers/notification-template.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationTemplateService } from '../services/notification-template.service';
import { ApiResponse } from '../../../core/interfaces/response.interface';
import { NotificationType } from '../../../models/notification.model';
import { BadRequestError } from '../../../utils/error-handler';

export class NotificationTemplateController {
  private notificationTemplateService: NotificationTemplateService;

  constructor() {
    this.notificationTemplateService = new NotificationTemplateService();
  }

  /**
   * Obtener todas las plantillas de notificación
   * @route GET /api/notifications/templates
   */
  getAllTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await this.notificationTemplateService.getAllTemplates();
      
      const response: ApiResponse = {
        success: true,
        data: templates,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener una plantilla por ID
   * @route GET /api/notifications/templates/:id
   */
  getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de plantilla inválido');
      }
      
      const template = await this.notificationTemplateService.getTemplateById(id);
      
      const response: ApiResponse = {
        success: true,
        data: template,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener una plantilla por código
   * @route GET /api/notifications/templates/code/:code
   */
  getTemplateByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = req.params.code;
      
      if (!code) {
        throw new BadRequestError('Código de plantilla requerido');
      }
      
      const template = await this.notificationTemplateService.getTemplateByCode(code);
      
      const response: ApiResponse = {
        success: true,
        data: template,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener plantillas por tipo
   * @route GET /api/notifications/templates/type/:type
   */
  getTemplatesByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const type = req.params.type as NotificationType;
      
      if (!Object.values(NotificationType).includes(type)) {
        throw new BadRequestError('Tipo de notificación inválido');
      }
      
      const templates = await this.notificationTemplateService.getTemplatesByType(type);
      
      const response: ApiResponse = {
        success: true,
        data: templates,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear una nueva plantilla
   * @route POST /api/notifications/templates
   */
  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      
      // Verificar tipo de notificación válido
      if (data.type && !Object.values(NotificationType).includes(data.type)) {
        throw new BadRequestError('Tipo de notificación inválido');
      }
      
      const template = await this.notificationTemplateService.createTemplate(data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Plantilla creada correctamente',
        data: template,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar una plantilla existente
   * @route PUT /api/notifications/templates/:id
   */
  updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de plantilla inválido');
      }
      
      const data = req.body;
      
      // Verificar tipo de notificación válido
      if (data.type && !Object.values(NotificationType).includes(data.type)) {
        throw new BadRequestError('Tipo de notificación inválido');
      }
      
      const template = await this.notificationTemplateService.updateTemplate(id, data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Plantilla actualizada correctamente',
        data: template,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar una plantilla
   * @route DELETE /api/notifications/templates/:id
   */
  deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de plantilla inválido');
      }
      
      const result = await this.notificationTemplateService.deleteTemplate(id);
      
      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Renderizar una plantilla con datos de prueba
   * @route POST /api/notifications/templates/preview/:code
   */
  previewTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = req.params.code;
      const testData = req.body;
      
      if (!code) {
        throw new BadRequestError('Código de plantilla requerido');
      }
      
      const rendered = await this.notificationTemplateService.renderTemplate(code, testData);
      
      const response: ApiResponse = {
        success: true,
        data: rendered,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}