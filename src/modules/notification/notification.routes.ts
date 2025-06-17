// src/modules/notification/notification.routes.ts
import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { NotificationTemplateController } from './controllers/notification-template.controller';
import { NotificationPreferenceController } from './controllers/notification-preference.controller';
import { authMiddleware, restrictTo } from '../../middlewares/auth.middleware';
import twilioRoutes from './routes/twilio.routes';

const router = Router();
const notificationController = new NotificationController();
const templateController = new NotificationTemplateController();
const preferenceController = new NotificationPreferenceController();

// Rutas públicas - Ninguna

// Rutas que requieren autenticación
router.use(authMiddleware);

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
router.use('/', twilioRoutes);

// Rutas para administradores
const adminRouter = Router();
adminRouter.use(authMiddleware);
adminRouter.use(restrictTo('admin'));

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

export { router as notificationRoutes, adminRouter as adminNotificationRoutes };