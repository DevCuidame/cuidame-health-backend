"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTemplateController = void 0;
const notification_template_service_1 = require("../services/notification-template.service");
const notification_model_1 = require("../../../models/notification.model");
const error_handler_1 = require("../../../utils/error-handler");
class NotificationTemplateController {
    notificationTemplateService;
    constructor() {
        this.notificationTemplateService = new notification_template_service_1.NotificationTemplateService();
    }
    /**
     * Obtener todas las plantillas de notificación
     * @route GET /api/notifications/templates
     */
    getAllTemplates = async (req, res, next) => {
        try {
            const templates = await this.notificationTemplateService.getAllTemplates();
            const response = {
                success: true,
                data: templates,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener una plantilla por ID
     * @route GET /api/notifications/templates/:id
     */
    getTemplateById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de plantilla inválido');
            }
            const template = await this.notificationTemplateService.getTemplateById(id);
            const response = {
                success: true,
                data: template,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener una plantilla por código
     * @route GET /api/notifications/templates/code/:code
     */
    getTemplateByCode = async (req, res, next) => {
        try {
            const code = req.params.code;
            if (!code) {
                throw new error_handler_1.BadRequestError('Código de plantilla requerido');
            }
            const template = await this.notificationTemplateService.getTemplateByCode(code);
            const response = {
                success: true,
                data: template,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener plantillas por tipo
     * @route GET /api/notifications/templates/type/:type
     */
    getTemplatesByType = async (req, res, next) => {
        try {
            const type = req.params.type;
            if (!Object.values(notification_model_1.NotificationType).includes(type)) {
                throw new error_handler_1.BadRequestError('Tipo de notificación inválido');
            }
            const templates = await this.notificationTemplateService.getTemplatesByType(type);
            const response = {
                success: true,
                data: templates,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crear una nueva plantilla
     * @route POST /api/notifications/templates
     */
    createTemplate = async (req, res, next) => {
        try {
            const data = req.body;
            // Verificar tipo de notificación válido
            if (data.type && !Object.values(notification_model_1.NotificationType).includes(data.type)) {
                throw new error_handler_1.BadRequestError('Tipo de notificación inválido');
            }
            const template = await this.notificationTemplateService.createTemplate(data);
            const response = {
                success: true,
                message: 'Plantilla creada correctamente',
                data: template,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar una plantilla existente
     * @route PUT /api/notifications/templates/:id
     */
    updateTemplate = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de plantilla inválido');
            }
            const data = req.body;
            // Verificar tipo de notificación válido
            if (data.type && !Object.values(notification_model_1.NotificationType).includes(data.type)) {
                throw new error_handler_1.BadRequestError('Tipo de notificación inválido');
            }
            const template = await this.notificationTemplateService.updateTemplate(id, data);
            const response = {
                success: true,
                message: 'Plantilla actualizada correctamente',
                data: template,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar una plantilla
     * @route DELETE /api/notifications/templates/:id
     */
    deleteTemplate = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de plantilla inválido');
            }
            const result = await this.notificationTemplateService.deleteTemplate(id);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Renderizar una plantilla con datos de prueba
     * @route POST /api/notifications/templates/preview/:code
     */
    previewTemplate = async (req, res, next) => {
        try {
            const code = req.params.code;
            const testData = req.body;
            if (!code) {
                throw new error_handler_1.BadRequestError('Código de plantilla requerido');
            }
            const rendered = await this.notificationTemplateService.renderTemplate(code, testData);
            const response = {
                success: true,
                data: rendered,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.NotificationTemplateController = NotificationTemplateController;
