import { UserSession } from '../../models/user-session.model';
import { BaseRepository } from '../../core/repositories/base.repository';
import { LessThan } from 'typeorm';

export class UserSessionRepository extends BaseRepository<UserSession> {
  constructor() {
    super(UserSession);
  }

  /**
   * Crear una nueva sesión
   */
  async createSession(sessionData: Partial<UserSession>): Promise<UserSession> {
    const session = this.repository.create(sessionData);
    return await this.repository.save(session);
  }

  /**
   * Buscar sesión por access token
   */
  async findByAccessToken(accessToken: string): Promise<UserSession | null> {
    return await this.repository.findOne({
      where: { 
        access_token: accessToken,
        is_active: true
      },
      relations: ['user']
    });
  }

  /**
   * Buscar sesión por refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return await this.repository.findOne({
      where: { 
        refresh_token: refreshToken,
        is_active: true
      },
      relations: ['user']
    });
  }

  /**
   * Obtener todas las sesiones activas de un usuario
   */
  async findActiveSessionsByUserId(userId: number): Promise<UserSession[]> {
    return await this.repository.find({
      where: { 
        user_id: userId,
        is_active: true
      },
      order: { last_used_at: 'DESC' }
    });
  }

  /**
   * Desactivar una sesión específica
   */
  async deactivateSession(sessionId: number): Promise<void> {
    await this.repository.update(sessionId, { 
      is_active: false,
      updated_at: new Date()
    });
  }

  /**
   * Desactivar sesión por access token
   */
  async deactivateByAccessToken(accessToken: string): Promise<void> {
    await this.repository.update(
      { access_token: accessToken },
      { 
        is_active: false,
        updated_at: new Date()
      }
    );
  }

  /**
   * Desactivar todas las sesiones de un usuario
   */
  async deactivateAllUserSessions(userId: number): Promise<void> {
    await this.repository.update(
      { user_id: userId, is_active: true },
      { 
        is_active: false,
        updated_at: new Date()
      }
    );
  }

  /**
   * Actualizar última vez usado
   */
  async updateLastUsed(sessionId: number): Promise<void> {
    await this.repository.update(sessionId, {
      last_used_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Actualizar tokens de una sesión
   */
  async updateTokens(sessionId: number, accessToken: string, refreshToken: string, expiresAt: Date, refreshExpiresAt: Date): Promise<void> {
    await this.repository.update(sessionId, {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      refresh_expires_at: refreshExpiresAt,
      updated_at: new Date()
    });
  }

  /**
   * Limpiar sesiones expiradas
   */
  async cleanExpiredSessions(): Promise<number> {
    const result = await this.repository.delete({
      refresh_expires_at: LessThan(new Date())
    });
    return result.affected || 0;
  }

  /**
   * Limpiar sesiones inactivas más antiguas que X días
   */
  async cleanInactiveSessions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await this.repository.delete({
      is_active: false,
      updated_at: LessThan(cutoffDate)
    });
    return result.affected || 0;
  }

  /**
   * Limpiar sesiones inactivas automáticamente
   * Este método elimina:
   * 1. Sesiones expiradas (refresh_expires_at < now)
   * 2. Sesiones inactivas por más de X días
   * 3. Sesiones que no han sido usadas recientemente
   */
  async cleanInactiveSessionsAutomatically(inactiveDays: number = 30, unusedDays: number = 7): Promise<{ expired: number, inactive: number, unused: number }> {
    const now = new Date();
    const inactiveCutoff = new Date();
    const unusedCutoff = new Date();
    
    inactiveCutoff.setDate(now.getDate() - inactiveDays);
    unusedCutoff.setDate(now.getDate() - unusedDays);

    // 1. Eliminar sesiones expiradas
    const expiredResult = await this.repository.delete({
      refresh_expires_at: LessThan(now)
    });

    // 2. Eliminar sesiones inactivas por más de X días
    const inactiveResult = await this.repository.delete({
      is_active: false,
      updated_at: LessThan(inactiveCutoff)
    });

    // 3. Eliminar sesiones que no han sido usadas recientemente
    const unusedResult = await this.repository.delete({
      is_active: true,
      last_used_at: LessThan(unusedCutoff)
    });

    return {
      expired: expiredResult.affected || 0,
      inactive: inactiveResult.affected || 0,
      unused: unusedResult.affected || 0
    };
  }

  /**
   * Limpiar sesiones basándose en el último uso
   * Elimina sesiones que no han sido usadas en los últimos X días
   */
  async cleanSessionsByLastUsed(daysUnused: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysUnused);
    
    const result = await this.repository.delete({
      last_used_at: LessThan(cutoffDate)
    });
    return result.affected || 0;
  }

  /**
   * Método de limpieza completa para ejecutar periódicamente
   * Combina todas las estrategias de limpieza
   */
  async performFullCleanup(): Promise<{ total: number, details: { expired: number, inactive: number, unused: number, oldSessions: number } }> {
    const automaticCleanup = await this.cleanInactiveSessionsAutomatically();
    const oldSessionsCleanup = await this.cleanSessionsByLastUsed(14); // Sesiones no usadas en 14 días
    
    const total = automaticCleanup.expired + automaticCleanup.inactive + automaticCleanup.unused + oldSessionsCleanup;
    
    return {
      total,
      details: {
        expired: automaticCleanup.expired,
        inactive: automaticCleanup.inactive,
        unused: automaticCleanup.unused,
        oldSessions: oldSessionsCleanup
      }
    };
  }

  /**
   * Contar sesiones activas por usuario
   */
  async countActiveSessionsByUserId(userId: number): Promise<number> {
    return await this.repository.count({
      where: {
        user_id: userId,
        is_active: true
      }
    });
  }

  /**
   * Limitar número de sesiones por usuario (mantener solo las N más recientes)
   */
  async limitUserSessions(userId: number, maxSessions: number = 5): Promise<void> {
    const sessions = await this.repository.find({
      where: {
        user_id: userId,
        is_active: true
      },
      order: { last_used_at: 'DESC' }
    });

    if (sessions.length > maxSessions) {
      const sessionsToDeactivate = sessions.slice(maxSessions);
      const sessionIds = sessionsToDeactivate.map(s => s.id);
      
      await this.repository.update(
        sessionIds,
        { 
          is_active: false,
          updated_at: new Date()
        }
      );
    }
  }
}