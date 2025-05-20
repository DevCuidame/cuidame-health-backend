"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDeliveryLogRepository = void 0;
const notification_extended_model_1 = require("../../../models/notification-extended.model");
const base_repository_1 = require("../../../core/repositories/base.repository");
// src/modules/notification/repositories/notification-delivery-log.repository.ts
class NotificationDeliveryLogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_extended_model_1.NotificationDeliveryLog);
    }
    /**
     * Encuentra logs de entrega para una notificación
     * @param notificationId ID de la notificación
     * @returns Lista de logs de entrega
     */
    async findByNotificationId(notificationId) {
        return await this.repository.find({
            where: { notification_id: notificationId },
            order: { created_at: 'DESC' }
        });
    }
    /**
     * Crea un log de entrega exitosa
     * @param notificationId ID de la notificación
     * @param deliveryType Tipo de entrega
     * @param recipient Destinatario
     * @returns Log creado
     */
    async logSuccess(notificationId, deliveryType, recipient) {
        return await this.create({
            notification_id: notificationId,
            delivery_type: deliveryType,
            status: 'success',
            recipient,
            details: 'Entrega exitosa'
        });
    }
    /**
     * Crea un log de entrega fallida
     * @param notificationId ID de la notificación
     * @param deliveryType Tipo de entrega
     * @param error Detalles del error
     * @param recipient Destinatario
     * @returns Log creado
     */
    async logFailure(notificationId, deliveryType, error, recipient) {
        return await this.create({
            notification_id: notificationId,
            delivery_type: deliveryType,
            status: 'failure',
            recipient,
            details: error
        });
    }
}
exports.NotificationDeliveryLogRepository = NotificationDeliveryLogRepository;
