"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminNotificationRoutes = exports.notificationRoutes = void 0;
// src/modules/notification/notification.routes.ts
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const notification_template_controller_1 = require("./controllers/notification-template.controller");
const notification_preference_controller_1 = require("./controllers/notification-preference.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const twilio_routes_1 = __importDefault(require("./routes/twilio.routes"));
const router = (0, express_1.Router)();
exports.notificationRoutes = router;
const notificationController = new notification_controller_1.NotificationController();
const templateController = new notification_template_controller_1.NotificationTemplateController();
const preferenceController = new notification_preference_controller_1.NotificationPreferenceController();
// Rutas públicas - Ninguna
// Rutas que requieren autenticación
router.use(auth_middleware_1.authMiddleware);
/**
 * @route GET /api/notifications
 * @desc Obtener notificaciones del usuario autenticado
 * @access Private
 */
router.get('/', notificationController.getUserNotifications);
/**
 * @route PUT /api/notifications/:id/read
 * @desc Marcar una notificación como leída
 * @access Private
 */
router.put('/:id/read', notificationController.markAsRead);
/**
 * @route PUT /api/notifications/read-all
 * @desc Marcar todas las notificaciones como leídas
 * @access Private
 */
router.put('/read-all', notificationController.markAllAsRead);
/**
 * @route DELETE /api/notifications/:id
 * @desc Eliminar una notificación
 * @access Private
 */
router.delete('/:id', notificationController.deleteNotification);
/**
 * @route GET /api/notifications/preferences
 * @desc Obtener preferencias de notificación del usuario
 * @access Private
 */
router.get('/preferences', preferenceController.getUserPreferences);
/**
 * @route GET /api/notifications/preferences/:type
 * @desc Obtener una preferencia específica
 * @access Private
 */
router.get('/preferences/:type', preferenceController.getUserPreferenceByType);
/**
 * @route PUT /api/notifications/preferences/:type
 * @desc Actualizar una preferencia específica
 * @access Private
 */
router.put('/preferences/:type', preferenceController.updatePreference);
/**
 * @route POST /api/notifications/preferences/initialize
 * @desc Inicializar todas las preferencias
 * @access Private
 */
router.post('/preferences/initialize', preferenceController.initializePreferences);
// Rutas de Twilio (SMS, WhatsApp, notificaciones multicanal)
router.use('/', twilio_routes_1.default);
// Rutas para administradores
const adminRouter = (0, express_1.Router)();
exports.adminNotificationRoutes = adminRouter;
adminRouter.use(auth_middleware_1.authMiddleware);
adminRouter.use((0, auth_middleware_1.restrictTo)('admin'));
/**
 * @route GET /api/admin/notifications/templates
 * @desc Obtener todas las plantillas de notificación
 * @access Private (Admin)
 */
adminRouter.get('/templates', templateController.getAllTemplates);
/**
 * @route GET /api/admin/notifications/templates/:id
 * @desc Obtener una plantilla por ID
 * @access Private (Admin)
 */
adminRouter.get('/templates/:id', templateController.getTemplateById);
/**
 * @route GET /api/admin/notifications/templates/code/:code
 * @desc Obtener una plantilla por código
 * @access Private (Admin)
 */
adminRouter.get('/templates/code/:code', templateController.getTemplateByCode);
/**
 * @route GET /api/admin/notifications/templates/type/:type
 * @desc Obtener plantillas por tipo
 * @access Private (Admin)
 */
adminRouter.get('/templates/type/:type', templateController.getTemplatesByType);
/**
 * @route POST /api/admin/notifications/templates
 * @desc Crear una nueva plantilla
 * @access Private (Admin)
 */
adminRouter.post('/templates', templateController.createTemplate);
/**
 * @route PUT /api/admin/notifications/templates/:id
 * @desc Actualizar una plantilla
 * @access Private (Admin)
 */
adminRouter.put('/templates/:id', templateController.updateTemplate);
/**
 * @route DELETE /api/admin/notifications/templates/:id
 * @desc Eliminar una plantilla
 * @access Private (Admin)
 */
adminRouter.delete('/templates/:id', templateController.deleteTemplate);
/**
 * @route POST /api/admin/notifications/templates/preview/:code
 * @desc Previsualizar una plantilla con datos de prueba
 * @access Private (Admin)
 */
adminRouter.post('/templates/preview/:code', templateController.previewTemplate);
/**
 * @route GET /api/admin/notifications/preferences/:userId
 * @desc Obtener preferencias de notificación de un usuario
 * @access Private (Admin)
 */
adminRouter.get('/preferences/:userId', preferenceController.getAnyUserPreferences);
/**
 * @route PUT /api/admin/notifications/preferences/:userId/:type
 * @desc Actualizar preferencia de un usuario
 * @access Private (Admin)
 */
adminRouter.put('/preferences/:userId/:type', preferenceController.updateAnyUserPreference);
/**
 * @route POST /api/admin/notifications/send
 * @desc Enviar una notificación a un usuario
 * @access Private (Admin)
 */
adminRouter.post('/send', notificationController.sendNotification);
/**
 * @route POST /api/admin/notifications/send-templated
 * @desc Enviar notificación usando una plantilla
 * @access Private (Admin)
 */
adminRouter.post('/send-templated', notificationController.sendTemplatedNotification);
/**
 * @route POST /api/admin/notifications/send-reminders
 * @desc Enviar recordatorios de citas
 * @access Private (Admin)
 */
adminRouter.post('/send-reminders', notificationController.sendAppointmentReminders);
/**
 * @route POST /api/admin/notifications/send-summaries
 * @desc Enviar resúmenes semanales
 * @access Private (Admin)
 */
adminRouter.post('/send-summaries', notificationController.sendWeeklySummaries);
/**
 * @route POST /api/admin/notifications/process-scheduled
 * @desc Procesar notificaciones programadas
 * @access Private (Admin)
 */
adminRouter.post('/process-scheduled', notificationController.processScheduledNotifications);
/**
 * @route POST /api/admin/notifications/process-queue
 * @desc Procesar cola de notificaciones
 * @access Private (Admin)
 */
adminRouter.post('/process-queue', notificationController.processNotificationQueue);
