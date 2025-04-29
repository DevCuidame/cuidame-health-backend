// src/modules/notification/notification.repository.ts
import { BaseRepository } from '../../core/repositories/base.repository';
import { Notification, NotificationStatus } from '../../models/notification.model';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(Notification);
  }

  /**
   * Buscar notificaciones por usuario
   */
  async findByUser(userId: number): Promise<Notification[]> {
    return await this.repository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(id: number): Promise<Notification> {
    await this.repository.update(id, {
      status: NotificationStatus.READ,
      read_at: new Date()
    });
    
    return await this.findById(id) as Notification;
  }
}