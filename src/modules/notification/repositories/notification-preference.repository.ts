// src/modules/notification/repositories/notification-preference.repository.ts

import { NotificationPreference } from "../../../models/notification-extended.model";
import { NotificationType } from "../../../models/notification.model";
import { BaseRepository } from "../../../core/repositories/base.repository";

export class NotificationPreferenceRepository extends BaseRepository<NotificationPreference> {
  constructor() {
    super(NotificationPreference);
  }

  /**
   * Encuentra preferencias de notificación para un usuario
   * @param userId ID del usuario
   * @returns Lista de preferencias
   */
  async findByUserId(userId: number): Promise<NotificationPreference[]> {
    return await this.repository.find({
      where: { user_id: userId }
    });
  }

  /**
   * Encuentra una preferencia específica para un usuario y tipo
   * @param userId ID del usuario
   * @param type Tipo de notificación
   * @returns Preferencia encontrada o null
   */
  async findByUserAndType(userId: number, type: NotificationType): Promise<NotificationPreference | null> {
    return await this.repository.findOne({
      where: { user_id: userId, notification_type: type }
    });
  }

  /**
   * Obtiene o crea una preferencia con valores por defecto
   * @param userId ID del usuario
   * @param type Tipo de notificación
   * @returns Preferencia creada o encontrada
   */
  async getOrCreate(userId: number, type: NotificationType): Promise<NotificationPreference> {
    let preference = await this.findByUserAndType(userId, type);
    
    if (!preference) {
      // Crear con valores por defecto
      preference = await this.create({
        user_id: userId,
        notification_type: type,
        email_enabled: true,
        push_enabled: true,
        inapp_enabled: true
      });
    }
    
    return preference;
  }
}
