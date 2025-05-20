"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreferenceService = void 0;
// src/modules/notification/services/notification-preference.service.ts
const notification_preference_repository_1 = require("../repositories/notification-preference.repository");
const notification_model_1 = require("../../../models/notification.model");
const error_handler_1 = require("../../../utils/error-handler");
const user_repository_1 = require("../../user/user.repository");
/**
 * Servicio para la gestión de preferencias de notificaciones de usuarios
 */
class NotificationPreferenceService {
    preferenceRepository;
    userRepository;
    constructor() {
        this.preferenceRepository = new notification_preference_repository_1.NotificationPreferenceRepository();
        this.userRepository = new user_repository_1.UserRepository();
    }
    /**
     * Obtiene las preferencias de notificación de un usuario
     * @param userId ID del usuario
     * @returns Lista de preferencias
     */
    async getUserPreferences(userId) {
        // Verificar que el usuario existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError(`Usuario con ID ${userId} no encontrado`);
        }
        return await this.preferenceRepository.findByUserId(userId);
    }
    /**
     * Obtiene una preferencia específica de un usuario
     * @param userId ID del usuario
     * @param type Tipo de notificación
     * @returns Preferencia encontrada o creada
     */
    async getUserPreferenceByType(userId, type) {
        // Verificar que el usuario existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError(`Usuario con ID ${userId} no encontrado`);
        }
        // Obtener o crear la preferencia
        return await this.preferenceRepository.getOrCreate(userId, type);
    }
    /**
     * Actualiza las preferencias de un usuario para un tipo de notificación
     * @param userId ID del usuario
     * @param type Tipo de notificación
     * @param preferences Preferencias a actualizar
     * @returns Preferencia actualizada
     */
    async updatePreference(userId, type, preferences) {
        // Obtener la preferencia actual
        const preference = await this.getUserPreferenceByType(userId, type);
        // Preparar datos para actualizar
        const updateData = {};
        if (preferences.emailEnabled !== undefined) {
            updateData.email_enabled = preferences.emailEnabled;
        }
        if (preferences.pushEnabled !== undefined) {
            updateData.push_enabled = preferences.pushEnabled;
        }
        if (preferences.inappEnabled !== undefined) {
            updateData.inapp_enabled = preferences.inappEnabled;
        }
        // Si no hay cambios, devolver la preferencia actual
        if (Object.keys(updateData).length === 0) {
            return preference;
        }
        // Actualizar la preferencia
        return await this.preferenceRepository.update(preference.id, updateData, 'Preferencia de notificación');
    }
    /**
     * Inicializa todas las preferencias de notificación para un usuario
     * @param userId ID del usuario
     * @returns Lista de preferencias creadas
     */
    async initializeUserPreferences(userId) {
        // Verificar que el usuario existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError(`Usuario con ID ${userId} no encontrado`);
        }
        // Crear preferencias para todos los tipos de notificación
        const preferences = [];
        for (const type of Object.values(notification_model_1.NotificationType)) {
            const preference = await this.preferenceRepository.getOrCreate(userId, type);
            preferences.push(preference);
        }
        return preferences;
    }
    /**
     * Verifica si un usuario tiene habilitada una preferencia específica
     * @param userId ID del usuario
     * @param type Tipo de notificación
     * @param channel Canal de notificación ('email', 'push', 'inapp')
     * @returns true si está habilitada
     */
    async isChannelEnabled(userId, type, channel) {
        const preference = await this.getUserPreferenceByType(userId, type);
        switch (channel) {
            case 'email':
                return preference.email_enabled;
            case 'push':
                return preference.push_enabled;
            case 'inapp':
                return preference.inapp_enabled;
            default:
                return false;
        }
    }
}
exports.NotificationPreferenceService = NotificationPreferenceService;
