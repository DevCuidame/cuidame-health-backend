import { NotificationDeliveryLog } from "../../../models/notification-extended.model";
import { BaseRepository } from "../../../core/repositories/base.repository";

// src/modules/notification/repositories/notification-delivery-log.repository.ts
export class NotificationDeliveryLogRepository extends BaseRepository<NotificationDeliveryLog> {
  constructor() {
    super(NotificationDeliveryLog);
  }

  /**
   * Encuentra logs de entrega para una notificación
   * @param notificationId ID de la notificación
   * @returns Lista de logs de entrega
   */
  async findByNotificationId(notificationId: number): Promise<NotificationDeliveryLog[]> {
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
  async logSuccess(notificationId: number, deliveryType: string, recipient?: string): Promise<NotificationDeliveryLog> {
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
  async logFailure(notificationId: number, deliveryType: string, error: string, recipient?: string): Promise<NotificationDeliveryLog> {
    return await this.create({
      notification_id: notificationId,
      delivery_type: deliveryType,
      status: 'failure',
      recipient,
      details: error
    });
  }
}