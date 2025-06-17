import { UserSessionRepository } from '../modules/auth/user-session.repository';
import logger from './logger';

/**
 * Servicio para manejar la limpieza automática de sesiones
 * Se ejecuta en intervalos regulares en segundo plano
 */
export class SessionCleanupService {
  private userSessionRepository: UserSessionRepository;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.userSessionRepository = new UserSessionRepository();
  }

  /**
   * Iniciar el servicio de limpieza automática
   * @param intervalHours Intervalo en horas para ejecutar la limpieza (por defecto 24 horas)
   */
  start(intervalHours: number = 24): void {
    if (this.isRunning) {
      logger.warn('El servicio de limpieza de sesiones ya está ejecutándose');
      return;
    }

    const intervalMs = intervalHours * 60 * 60 * 1000; // Convertir horas a milisegundos
    
    logger.info(`Iniciando servicio de limpieza automática de sesiones cada ${intervalHours} horas`);
    
    // Ejecutar limpieza inmediatamente al iniciar
    this.performCleanup();
    
    // Programar ejecuciones periódicas
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMs);
    
    this.isRunning = true;
  }

  /**
   * Detener el servicio de limpieza automática
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.isRunning = false;
    logger.info('Servicio de limpieza automática de sesiones detenido');
  }

  /**
   * Verificar si el servicio está ejecutándose
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Ejecutar limpieza manual
   */
  async performManualCleanup(): Promise<{ total: number, details: any }> {
    return await this.performCleanup();
  }

  /**
   * Ejecutar la limpieza de sesiones
   */
  private async performCleanup(): Promise<{ total: number, details: any }> {
    try {
      logger.info('Ejecutando limpieza automática de sesiones...');
      
      const result = await this.userSessionRepository.performFullCleanup();
      
      if (result.total > 0) {
        logger.info(`Limpieza automática completada: ${result.total} sesiones eliminadas`);
        logger.debug('Detalles de limpieza:', result.details);
      } else {
        logger.debug('Limpieza automática: No se encontraron sesiones para eliminar');
      }
      
      return result;
      
    } catch (error) {
      logger.error('Error durante la limpieza automática de sesiones:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del servicio
   */
  getServiceStats(): { isRunning: boolean, nextCleanup?: Date } {
    return {
      isRunning: this.isRunning,
      // Nota: Para obtener el próximo tiempo de ejecución necesitaríamos
      // almacenar más información sobre el intervalo
    };
  }
}

// Instancia singleton del servicio
let sessionCleanupServiceInstance: SessionCleanupService | null = null;

/**
 * Obtener la instancia singleton del servicio de limpieza
 */
export function getSessionCleanupService(): SessionCleanupService {
  if (!sessionCleanupServiceInstance) {
    sessionCleanupServiceInstance = new SessionCleanupService();
  }
  return sessionCleanupServiceInstance;
}

/**
 * Inicializar el servicio de limpieza automática
 * Llamar esta función al iniciar la aplicación
 */
export function initializeSessionCleanup(intervalHours: number = 24): void {
  const service = getSessionCleanupService();
  service.start(intervalHours);
}

/**
 * Detener el servicio de limpieza automática
 * Llamar esta función al cerrar la aplicación
 */
export function stopSessionCleanup(): void {
  if (sessionCleanupServiceInstance) {
    sessionCleanupServiceInstance.stop();
  }
}