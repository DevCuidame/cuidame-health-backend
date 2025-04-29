// src/modules/notification/notification.service.ts
import { Notification } from '../../models/notification.model';
import { NotificationRepository } from './notification.repository';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  /**
   * Crear una nueva notificación
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    return await this.notificationRepository.create(data);
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.findByUser(userId);
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    return await this.notificationRepository.markAsRead(notificationId);
  }
}