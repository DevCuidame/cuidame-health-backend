"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueService = void 0;
// src/modules/notification/services/notification-queue.service.ts
const notification_queue_repository_1 = require("../repositories/notification-queue.repository");
const notification_delivery_log_repository_1 = require("../repositories/notification-delivery-log.repository");
const notification_repository_1 = require("../repositories/notification.repository");
const email_service_1 = require("./email.service");
const error_handler_1 = require("../../../utils/error-handler");
const user_repository_1 = require("../../user/user.repository");
const logger_1 = __importDefault(require("../../../utils/logger"));
const notification_model_1 = require("../../../models/notification.model");
const typeorm_1 = require("typeorm");
/**
 * Servicio para la gestión de la cola de notificaciones
 */
class NotificationQueueService {
    queueRepository;
    deliveryLogRepository;
    notificationRepository;
    userRepository;
    emailService;
    constructor() {
        this.queueRepository = new notification_queue_repository_1.NotificationQueueRepository();
        this.deliveryLogRepository = new notification_delivery_log_repository_1.NotificationDeliveryLogRepository();
        this.notificationRepository = new notification_repository_1.NotificationRepository();
        this.userRepository = new user_repository_1.UserRepository();
        this.emailService = email_service_1.EmailService.getInstance();
    }
    /**
     * Añade una notificación a la cola de envío
     * @param notificationId ID de la notificación
     * @param deliveryType Tipo de entrega ('email', 'push', 'inapp')
     * @param payload Datos específicos para la entrega
     * @returns Elemento añadido a la cola
     */
    async enqueueNotification(notificationId, deliveryType, payload) {
        // Verificar que la notificación existe
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification) {
            throw new error_handler_1.NotFoundError(`Notificación con ID ${notificationId} no encontrada`);
        }
        // Crear elemento en la cola
        return await this.queueRepository.create({
            notification_id: notificationId,
            delivery_type: deliveryType,
            payload,
            status: 'pending',
            retries: 0,
            max_retries: 3,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    /**
     * Procesa elementos pendientes en la cola
     * @param limit Número máximo de elementos a procesar
     * @returns Número de elementos procesados
     */
    async processQueue(limit = 10) {
        // Obtener elementos pendientes
        const pendingItems = await this.queueRepository.findPending(limit);
        if (pendingItems.length === 0) {
            return 0;
        }
        let processedCount = 0;
        // Procesar cada elemento
        for (const item of pendingItems) {
            try {
                // Marcar como en procesamiento
                await this.queueRepository.updateStatus(item.id, 'processing');
                // Procesar según el tipo de entrega
                let success = false;
                let error = '';
                switch (item.delivery_type) {
                    case 'email':
                        const result = await this.processEmailDelivery(item);
                        success = result.success;
                        error = result.error || '';
                        break;
                    case 'push':
                        // Implementar procesamiento de notificaciones push
                        // Por ahora, simular éxito
                        success = true;
                        break;
                    case 'inapp':
                        // Para notificaciones in-app, simplemente marcar como entregada
                        // ya que se mostrarán cuando el usuario consulte sus notificaciones
                        success = true;
                        break;
                    default:
                        error = `Tipo de entrega desconocido: ${item.delivery_type}`;
                        success = false;
                }
                // Actualizar estado del elemento en la cola
                if (success) {
                    await this.queueRepository.updateStatus(item.id, 'completed');
                    await this.deliveryLogRepository.logSuccess(item.notification_id, item.delivery_type, item.payload.recipient);
                    // Actualizar estado de la notificación si corresponde
                    await this.notificationRepository.update(item.notification_id, { status: notification_model_1.NotificationStatus.SENT, sent_at: new Date() }, 'Notificación');
                }
                else {
                    await this.queueRepository.updateStatus(item.id, 'failed', error);
                    await this.deliveryLogRepository.logFailure(item.notification_id, item.delivery_type, error, item.payload.recipient);
                }
                processedCount++;
            }
            catch (error) {
                logger_1.default.error(`Error al procesar elemento de cola ${item.id}:`, error);
                // Registrar el error y continuar con el siguiente elemento
                await this.queueRepository.updateStatus(item.id, 'failed', error instanceof Error ? error.message : 'Error desconocido');
                await this.deliveryLogRepository.logFailure(item.notification_id, item.delivery_type, error instanceof Error ? error.message : 'Error desconocido', item.payload?.recipient);
            }
        }
        return processedCount;
    }
    /**
     * Procesa la entrega de una notificación por email
     * @param queueItem Elemento de la cola
     * @returns Resultado del envío
     */
    async processEmailDelivery(queueItem) {
        try {
            const { payload } = queueItem;
            // Verificar datos mínimos
            if (!payload || !payload.to || !payload.subject) {
                return {
                    success: false,
                    error: 'Datos insuficientes para enviar email'
                };
            }
            // Enviar email
            const result = await this.emailService.sendEmail({
                to: payload.to,
                cc: payload.cc,
                subject: payload.subject,
                text: payload.text,
                html: payload.html,
                attachments: payload.attachments
            });
            return {
                success: result.success,
                error: result.error ? (result.error.message || 'Error al enviar email') : undefined
            };
        }
        catch (error) {
            logger_1.default.error('Error al procesar entrega de email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }
    /**
     * Reintentar elementos fallidos en la cola
     * @param limit Número máximo de elementos a reintentar
     * @returns Número de elementos reintentados
     */
    async retryFailedItems(limit = 10) {
        // Buscar elementos fallidos que puedan reintentarse
        const failedItems = await this.queueRepository.findAll({
            where: {
                status: 'failed',
                retries: (0, typeorm_1.LessThan)(3) // Menos de 3 intentos
            },
            order: { created_at: 'ASC' },
            take: limit
        });
        if (failedItems.length === 0) {
            return 0;
        }
        // Marcar elementos como pendientes para que sean procesados nuevamente
        let retriedCount = 0;
        for (const item of failedItems) {
            await this.queueRepository.update(item.id, { status: 'pending', updated_at: new Date() }, 'Cola de notificación');
            retriedCount++;
        }
        return retriedCount;
    }
    /**
     * Limpia elementos completados antiguos de la cola
     * @param daysOld Eliminar elementos más antiguos que estos días
     * @returns Número de elementos eliminados
     */
    async cleanupCompletedItems(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        // Encontrar elementos completados antiguos
        const oldItems = await this.queueRepository.findAll({
            where: {
                status: 'completed',
                updated_at: (0, typeorm_1.LessThan)(cutoffDate)
            }
        });
        if (oldItems.length === 0) {
            return 0;
        }
        // Eliminar elementos
        let deletedCount = 0;
        for (const item of oldItems) {
            await this.queueRepository.delete(item.id, 'Cola de notificación');
            deletedCount++;
        }
        return deletedCount;
    }
}
exports.NotificationQueueService = NotificationQueueService;
