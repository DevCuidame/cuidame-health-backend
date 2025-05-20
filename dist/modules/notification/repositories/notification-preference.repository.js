"use strict";
// src/modules/notification/repositories/notification-preference.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreferenceRepository = void 0;
const notification_extended_model_1 = require("../../../models/notification-extended.model");
const base_repository_1 = require("../../../core/repositories/base.repository");
class NotificationPreferenceRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_extended_model_1.NotificationPreference);
    }
    /**
     * Encuentra preferencias de notificación para un usuario
     * @param userId ID del usuario
     * @returns Lista de preferencias
     */
    async findByUserId(userId) {
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
    async findByUserAndType(userId, type) {
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
    async getOrCreate(userId, type) {
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
exports.NotificationPreferenceRepository = NotificationPreferenceRepository;
