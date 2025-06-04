"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
// src/modules/notification/notification.service.ts
const notification_repository_1 = require("./repositories/notification.repository");
const notification_queue_service_1 = require("./services/notification-queue.service");
const notification_template_service_1 = require("./services/notification-template.service");
const email_service_1 = require("./services/email.service");
const notification_preference_service_1 = require("./services/notification-preference.service");
const notification_model_1 = require("../../models/notification.model");
const user_repository_1 = require("../user/user.repository");
const error_handler_1 = require("../../utils/error-handler");
const logger_1 = __importDefault(require("../../utils/logger"));
const typeorm_1 = require("typeorm");
/**
 * Servicio principal para la gestión de notificaciones
 */
class NotificationService {
    notificationRepository;
    userRepository;
    queueService;
    templateService;
    emailService;
    preferenceService;
    constructor() {
        this.notificationRepository = new notification_repository_1.NotificationRepository();
        this.userRepository = new user_repository_1.UserRepository();
        this.queueService = new notification_queue_service_1.NotificationQueueService();
        this.templateService = new notification_template_service_1.NotificationTemplateService();
        this.emailService = email_service_1.EmailService.getInstance();
        this.preferenceService = new notification_preference_service_1.NotificationPreferenceService();
    }
    /**
     * Crea una nueva notificación y la envía a través de los canales configurados
     * @param data Datos de la notificación
     * @returns Notificación creada
     */
    async createNotification(data) {
        try {
            // Verificar que el usuario existe
            const user = await this.userRepository.findById(data.user_id);
            if (!user) {
                throw new error_handler_1.NotFoundError(`Usuario con ID ${data.user_id} no encontrado`);
            }
            // Crear la notificación
            const notification = await this.notificationRepository.create({
                user_id: data.user_id,
                appointment_id: data.appointment_id,
                type: data.type,
                title: data.title,
                message: data.message,
                status: data.scheduled_for ? notification_model_1.NotificationStatus.PENDING : notification_model_1.NotificationStatus.SENT,
                scheduled_for: data.scheduled_for,
                created_at: new Date()
            });
            // Si está programada para el futuro, no enviar ahora
            // if (data.scheduled_for && data.scheduled_for > new Date()) {
            //   return notification;
            // }
            // Enviar la notificación a través de los canales correspondientes
            await this.sendNotificationThroughChannels(notification);
            return notification;
        }
        catch (error) {
            logger_1.default.error('Error al crear notificación:', error);
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
    async getUserNotifications(userId, includeRead = false, limit = 50) {
        // Verificar que el usuario existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError(`Usuario con ID ${userId} no encontrado`);
        }
        // Construir condiciones de búsqueda
        const conditions = {
            where: { user_id: userId }
        };
        // Si no se incluyen leídas, filtrar por status
        if (!includeRead) {
            conditions.where.status = notification_model_1.NotificationStatus.SENT;
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
    async markAsRead(notificationId, userId) {
        // Buscar la notificación
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification) {
            throw new error_handler_1.NotFoundError(`Notificación con ID ${notificationId} no encontrada`);
        }
        // Verificar que la notificación pertenece al usuario
        if (notification.user_id !== userId) {
            throw new error_handler_1.BadRequestError('No tiene permiso para modificar esta notificación');
        }
        // Si ya está leída, devolver sin cambios
        if (notification.read_at) {
            return notification;
        }
        // Actualizar la notificación
        return await this.notificationRepository.update(notificationId, {
            read_at: new Date(),
            status: notification_model_1.NotificationStatus.READ
        }, 'Notificación');
    }
    /**
     * Marca todas las notificaciones de un usuario como leídas
     * @param userId ID del usuario
     * @returns Número de notificaciones actualizadas
     */
    async markAllAsRead(userId) {
        // Buscar notificaciones no leídas
        const unreadNotifications = await this.notificationRepository.findAll({
            where: {
                user_id: userId,
                status: notification_model_1.NotificationStatus.SENT,
                read_at: (0, typeorm_1.IsNull)()
            }
        });
        if (unreadNotifications.length === 0) {
            return 0;
        }
        // Actualizar todas las notificaciones
        const now = new Date();
        let updatedCount = 0;
        for (const notification of unreadNotifications) {
            await this.notificationRepository.update(notification.id, {
                read_at: now,
                status: notification_model_1.NotificationStatus.READ
            }, 'Notificación');
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
    async deleteNotification(notificationId, userId) {
        // Buscar la notificación
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification) {
            throw new error_handler_1.NotFoundError(`Notificación con ID ${notificationId} no encontrada`);
        }
        // Verificar que la notificación pertenece al usuario
        if (notification.user_id !== userId) {
            throw new error_handler_1.BadRequestError('No tiene permiso para eliminar esta notificación');
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
    async sendTemplatedNotification(userId, templateCode, data, appointmentId, scheduledFor) {
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
        }
        catch (error) {
            logger_1.default.error(`Error al enviar notificación templated (${templateCode}):`, error);
            throw error;
        }
    }
    /**
     * Envía una notificación a través de todos los canales habilitados
     * @param notification Notificación a enviar
     */
    async sendNotificationThroughChannels(notification) {
        try {
            // Obtener el usuario
            const user = await this.userRepository.findById(notification.user_id);
            if (!user) {
                throw new error_handler_1.NotFoundError(`Usuario con ID ${notification.user_id} no encontrado`);
            }
            // Verificar preferencias del usuario para este tipo de notificación
            // const preferences = await this.preferenceService.getUserPreferenceByType(
            //   notification.user_id,
            //   notification.type
            // );
            // Agregar a la cola para envío en la app (siempre)
            await this.queueService.enqueueNotification(notification.id, 'inapp', { recipient: user.email });
            // Enviar por email si está habilitado
            if (user.email) {
                await this.queueService.enqueueNotification(notification.id, 'email', {
                    to: user.email,
                    subject: notification.title,
                    text: notification.message,
                    recipient: user.email
                });
            }
            // Enviar por push si está habilitado y hay ID de notificación
            if (user.notificationid) {
                await this.queueService.enqueueNotification(notification.id, 'push', {
                    deviceToken: user.notificationid,
                    title: notification.title,
                    body: notification.message,
                    data: {
                        notificationId: notification.id,
                        type: notification.type,
                        appointmentId: notification.appointment_id
                    },
                    recipient: user.notificationid
                });
            }
            // Actualizar la notificación como enviada
            await this.notificationRepository.update(notification.id, {
                status: notification_model_1.NotificationStatus.SENT,
                sent_at: new Date()
            }, 'Notificación');
        }
        catch (error) {
            logger_1.default.error(`Error al enviar notificación ${notification.id} por canales:`, error);
            // Registrar el error pero no fallar el flujo completo
        }
    }
    /**
     * Procesa las notificaciones programadas que están pendientes
     * @returns Número de notificaciones procesadas
     */
    async processScheduledNotifications() {
        try {
            const now = new Date();
            // Buscar notificaciones programadas cuyo tiempo ha llegado
            const pendingNotifications = await this.notificationRepository.findAll({
                where: {
                    status: notification_model_1.NotificationStatus.PENDING,
                    scheduled_for: (0, typeorm_1.LessThanOrEqual)(now) // Menor o igual a ahora
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
                }
                catch (error) {
                    logger_1.default.error(`Error al procesar notificación programada ${notification.id}:`, error);
                    // Continuar con la siguiente notificación
                }
            }
            return processedCount;
        }
        catch (error) {
            logger_1.default.error('Error al procesar notificaciones programadas:', error);
            throw error;
        }
    }
    /**
     * Envía la cola de notificaciones pendientes
     * @param limit Límite de elementos a procesar
     * @returns Número de elementos procesados
     */
    async processNotificationQueue(limit = 10) {
        return await this.queueService.processQueue(limit);
    }
}
exports.NotificationService = NotificationService;
