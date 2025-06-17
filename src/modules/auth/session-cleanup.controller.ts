import { Request, Response } from 'express';
import { UserSessionRepository } from './user-session.repository';
import { getSessionCleanupService } from '../../utils/session-cleanup.service';
import logger from '../../utils/logger';
import { BadRequestError } from '../../utils/error-handler';

/**
 * Controlador para manejar operaciones de limpieza de sesiones
 */
export class SessionCleanupController {
  private userSessionRepository: UserSessionRepository;

  constructor() {
    this.userSessionRepository = new UserSessionRepository();
  }

  /**
   * Ejecutar limpieza manual de sesiones
   */
  async manualCleanup(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Ejecutando limpieza manual de sesiones...');
      
      const result = await this.userSessionRepository.performFullCleanup();
      
      res.status(200).json({
        success: true,
        message: 'Limpieza de sesiones ejecutada exitosamente',
        data: {
          totalCleaned: result.total,
          details: result.details,
          timestamp: new Date().toISOString()
        }
      });
      
      logger.info(`Limpieza manual completada: ${result.total} sesiones eliminadas`);
      
    } catch (error) {
      logger.error('Error en limpieza manual de sesiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al ejecutar limpieza de sesiones',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Ejecutar limpieza ligera (solo sesiones expiradas)
   */
  async lightCleanup(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Ejecutando limpieza ligera de sesiones...');
      
      const expiredCount = await this.userSessionRepository.cleanExpiredSessions();
      
      res.status(200).json({
        success: true,
        message: 'Limpieza ligera ejecutada exitosamente',
        data: {
          expiredSessionsCleaned: expiredCount,
          timestamp: new Date().toISOString()
        }
      });
      
      logger.info(`Limpieza ligera completada: ${expiredCount} sesiones expiradas eliminadas`);
      
    } catch (error) {
      logger.error('Error en limpieza ligera de sesiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al ejecutar limpieza ligera',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtener estadísticas del servicio de limpieza
   */
  async getCleanupStats(req: Request, res: Response): Promise<void> {
    try {
      const cleanupService = getSessionCleanupService();
      const serviceStats = cleanupService.getServiceStats();
      
      // Obtener estadísticas de sesiones activas
      const activeSessions = await this.userSessionRepository.count({
        where: { is_active: true }
      });
      
      const totalSessions = await this.userSessionRepository.count();
      
      res.status(200).json({
        success: true,
        message: 'Estadísticas de limpieza obtenidas exitosamente',
        data: {
          service: serviceStats,
          sessions: {
            active: activeSessions,
            total: totalSessions,
            inactive: totalSessions - activeSessions
          },
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener estadísticas de limpieza:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Configurar parámetros de limpieza automática
   */
  async configureCleanup(req: Request, res: Response): Promise<void> {
    try {
      const { inactiveDays, unusedDays } = req.body;
      
      // Validar parámetros
      if (inactiveDays && (inactiveDays < 1 || inactiveDays > 365)) {
        throw new BadRequestError('inactiveDays debe estar entre 1 y 365');
      }
      
      if (unusedDays && (unusedDays < 1 || unusedDays > 90)) {
        throw new BadRequestError('unusedDays debe estar entre 1 y 90');
      }
      
      // Ejecutar limpieza con parámetros personalizados
      const result = await this.userSessionRepository.cleanInactiveSessionsAutomatically(
        inactiveDays || 30,
        unusedDays || 7
      );
      
      res.status(200).json({
        success: true,
        message: 'Limpieza personalizada ejecutada exitosamente',
        data: {
          parameters: {
            inactiveDays: inactiveDays || 30,
            unusedDays: unusedDays || 7
          },
          result,
          timestamp: new Date().toISOString()
        }
      });
      
      logger.info(`Limpieza personalizada completada con parámetros: inactiveDays=${inactiveDays || 30}, unusedDays=${unusedDays || 7}`);
      
    } catch (error) {
      logger.error('Error en limpieza personalizada:', error);
      
      if (error instanceof BadRequestError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al ejecutar limpieza personalizada',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  }
}