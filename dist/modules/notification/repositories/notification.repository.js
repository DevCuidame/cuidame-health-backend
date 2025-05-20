"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
// src/modules/notification/notification.repository.ts
const base_repository_1 = require("../../../core/repositories/base.repository");
const notification_model_1 = require("../../../models/notification.model");
class NotificationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_model_1.Notification);
    }
    /**
     * Buscar notificaciones por usuario
     */
    async findByUser(userId) {
        return await this.repository.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' }
        });
    }
    /**
     * Marcar una notificación como leída
     */
    async markAsRead(id) {
        await this.repository.update(id, {
            status: notification_model_1.NotificationStatus.READ,
            read_at: new Date()
        });
        return await this.findById(id);
    }
}
exports.NotificationRepository = NotificationRepository;
