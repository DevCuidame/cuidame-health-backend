// src/modules/notification/services/notification-preference.service.ts
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { NotificationPreference } from '../../../models/notification-extended.model';
import { NotificationType } from '../../../models/notification.model';
import { BadRequestError, NotFoundError } from '../../../utils/error-handler';
import { UserRepository } from '../../user/user.repository';

/**
 * Servicio para la gestión de preferencias de notificaciones de usuarios
 */
export class NotificationPreferenceService {
  private preferenceRepository: NotificationPreferenceRepository;
  private userRepository: UserRepository;

  constructor() {
    this.preferenceRepository = new NotificationPreferenceRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Obtiene las preferencias de notificación de un usuario
   * @param userId ID del usuario
   * @returns Lista de preferencias
   */
  async getUserPreferences(userId: number): Promise<NotificationPreference[]> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
    }
    
    return await this.preferenceRepository.findByUserId(userId);
  }

  /**
   * Obtiene una preferencia específica de un usuario
   * @param userId ID del usuario
   * @param type Tipo de notificación
   * @returns Preferencia encontrada o creada
   */
  async getUserPreferenceByType(userId: number, type: NotificationType): Promise<NotificationPreference> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
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
  async updatePreference(
    userId: number, 
    type: NotificationType,
    preferences: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      inappEnabled?: boolean;
    }
  ): Promise<NotificationPreference> {
    // Obtener la preferencia actual
    const preference = await this.getUserPreferenceByType(userId, type);
    
    // Preparar datos para actualizar
    const updateData: Partial<NotificationPreference> = {};
    
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
    return await this.preferenceRepository.update(
      preference.id,
      updateData,
      'Preferencia de notificación'
    );
  }

  /**
   * Inicializa todas las preferencias de notificación para un usuario
   * @param userId ID del usuario
   * @returns Lista de preferencias creadas
   */
  async initializeUserPreferences(userId: number): Promise<NotificationPreference[]> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Crear preferencias para todos los tipos de notificación
    const preferences: NotificationPreference[] = [];
    
    for (const type of Object.values(NotificationType)) {
      const preference = await this.preferenceRepository.getOrCreate(userId, type as NotificationType);
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
  async isChannelEnabled(userId: number, type: NotificationType, channel: 'email' | 'push' | 'inapp'): Promise<boolean> {
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