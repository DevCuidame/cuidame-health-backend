import { AppDataSource } from '../core/config/database';
import { UserSessionRepository } from '../modules/auth/user-session.repository';
import logger from '../utils/logger';

/**
 * Script para limpiar sesiones inactivas
 * Puede ejecutarse como tarea programada o manualmente
 */
class SessionCleanupScript {
  private userSessionRepository: UserSessionRepository;

  constructor() {
    this.userSessionRepository = new UserSessionRepository();
  }

  /**
   * Ejecutar limpieza completa de sesiones
   */
  async runCleanup(): Promise<void> {
    try {
      logger.info('Iniciando limpieza programada de sesiones...');
      
      // Inicializar conexión a la base de datos si no está inicializada
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        logger.info('Conexión a base de datos inicializada');
      }

      // Ejecutar limpieza completa
      const result = await this.userSessionRepository.performFullCleanup();
      
      logger.info(`Limpieza completada exitosamente:`);
      logger.info(`- Total de sesiones eliminadas: ${result.total}`);
      logger.info(`- Sesiones expiradas: ${result.details.expired}`);
      logger.info(`- Sesiones inactivas: ${result.details.inactive}`);
      logger.info(`- Sesiones no usadas: ${result.details.unused}`);
      logger.info(`- Sesiones antiguas: ${result.details.oldSessions}`);
      
      if (result.total > 0) {
        logger.info(`Se liberó espacio eliminando ${result.total} sesiones obsoletas`);
      } else {
        logger.info('No se encontraron sesiones para eliminar');
      }
      
    } catch (error) {
      logger.error('Error durante la limpieza de sesiones:', error);
      throw error;
    }
  }

  /**
   * Ejecutar limpieza ligera (solo sesiones expiradas)
   */
  async runLightCleanup(): Promise<void> {
    try {
      logger.info('Iniciando limpieza ligera de sesiones...');
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const expiredCount = await this.userSessionRepository.cleanExpiredSessions();
      
      logger.info(`Limpieza ligera completada: ${expiredCount} sesiones expiradas eliminadas`);
      
    } catch (error) {
      logger.error('Error durante la limpieza ligera de sesiones:', error);
      throw error;
    }
  }
}

// Función para ejecutar desde línea de comandos
async function main() {
  const cleanup = new SessionCleanupScript();
  
  const args = process.argv.slice(2);
  const mode = args[0] || 'full'; // 'full' o 'light'
  
  try {
    if (mode === 'light') {
      await cleanup.runLightCleanup();
    } else {
      await cleanup.runCleanup();
    }
    
    logger.info('Script de limpieza finalizado exitosamente');
    process.exit(0);
    
  } catch (error) {
    logger.error('Error en script de limpieza:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

export { SessionCleanupScript };