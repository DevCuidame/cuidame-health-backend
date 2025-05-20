"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreferenceController = void 0;
const notification_preference_service_1 = require("../services/notification-preference.service");
const notification_model_1 = require("../../../models/notification.model");
const error_handler_1 = require("../../../utils/error-handler");
class NotificationPreferenceController {
    notificationPreferenceService;
    constructor() {
        this.notificationPreferenceService = new notification_preference_service_1.NotificationPreferenceService();
    }
    /**
     * Obtener preferencias de notificación del usuario autenticado
     * @route GET /api/notifications/preferences
     */
    getUserPreferences = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const preferences = await this.notificationPreferenceService.getUserPreferences(userId);
            const response = {
                success: true,
                data: preferences,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener una preferencia específica del usuario autenticado
     * @route GET /api/notifications/preferences/:type
     */
    getUserPreferenceByType = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const type = req.params.type;
            if (!Object.values(notification_model_1.NotificationType).includes(type)) {
                throw new error_handler_1.BadRequestError('Tipo de notificación inválido');
            }
            const preference = await this.notificationPreferenceService.getUserPreferenceByType(userId, type);
            const response = {
                success: true,
                data: preference,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar una preferencia específica del usuario autenticado
     * @route PUT /api/notifications/preferences/:type
     */
    updatePreference = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const type = req.params.type;
            if (!Object.values(notification_model_1.NotificationType).includes(type)) {
                throw new error_handler_1.BadRequestError('Tipo de notificación inválido');
            }
            const { emailEnabled, pushEnabled, inappEnabled } = req.body;
            // Verificar que al menos un canal está habilitado
            if (emailEnabled === false && pushEnabled === false && inappEnabled === false) {
                throw new error_handler_1.BadRequestError('Debe habilitar al menos un canal de notificación');
            }
            const preference = await this.notificationPreferenceService.updatePreference(userId, type, {
                emailEnabled,
                pushEnabled,
                inappEnabled
            });
            const response = {
                success: true,
                message: 'Preferencia actualizada correctamente',
                data: preference,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Inicializar todas las preferencias de notificación para el usuario autenticado
     * @route POST /api/notifications/preferences/initialize
     */
    initializePreferences = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const preferences = await this.notificationPreferenceService.initializeUserPreferences(userId);
            const response = {
                success: true,
                message: 'Preferencias inicializadas correctamente',
                data: preferences,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener preferencias de notificación de un usuario específico (admin)
     * @route GET /api/admin/notifications/preferences/:userId
     */
    getAnyUserPreferences = async (req, res, next) => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                throw new error_handler_1.BadRequestError('ID de usuario inválido');
            }
            const preferences = await this.notificationPreferenceService.getUserPreferences(userId);
            const response = {
                success: true,
                data: preferences,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar preferencia de un usuario específico (admin)
     * @route PUT /api/admin/notifications/preferences/:userId/:type
     */
    updateAnyUserPreference = async (req, res, next) => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                throw new error_handler_1.BadRequestError('ID de usuario inválido');
            }
            const type = req.params.type;
            if (!Object.values(notification_model_1.NotificationType).includes(type)) {
                throw new error_handler_1.BadRequestError('Tipo de notificación inválido');
            }
            const { emailEnabled, pushEnabled, inappEnabled } = req.body;
            const preference = await this.notificationPreferenceService.updatePreference(userId, type, {
                emailEnabled,
                pushEnabled,
                inappEnabled
            });
            const response = {
                success: true,
                message: 'Preferencia actualizada correctamente',
                data: preference,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.NotificationPreferenceController = NotificationPreferenceController;
