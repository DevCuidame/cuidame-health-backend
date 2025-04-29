// src/modules/appointment/controllers/professional-stats.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProfessionalStatsService } from '../services/professional-stats.service';
import { ApiResponse } from '../../../core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';

export class ProfessionalStatsController {
  private professionalStatsService: ProfessionalStatsService;

  constructor() {
    this.professionalStatsService = new ProfessionalStatsService();
  }

  /**
   * Obtener estadísticas detalladas de un profesional
   * @route GET /api/admin/professionals/:id/stats
   */
  getProfessionalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.id);
      
      if (isNaN(professionalId)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      // Procesamiento de fechas
      let startDate = new Date();
      let endDate = new Date();
      
      // Por defecto, último mes
      startDate.setMonth(startDate.getMonth() - 1);
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const stats = await this.professionalStatsService.getProfessionalStats(
        professionalId,
        startDate,
        endDate
      );
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener ranking de profesionales
   * @route GET /api/admin/professionals/ranking
   */
  getProfessionalsRanking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Procesamiento de fechas
      let startDate = new Date();
      let endDate = new Date();
      
      // Por defecto, último mes
      startDate.setMonth(startDate.getMonth() - 1);
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      // Límite de resultados
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const ranking = await this.professionalStatsService.getProfessionalsRanking(
        startDate,
        endDate,
        limit
      );
      
      const response: ApiResponse = {
        success: true,
        data: ranking,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener estadísticas comparativas
   * @route GET /api/admin/professionals/comparative-stats
   */
  getComparativeStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Procesamiento de fechas
      let startDate = new Date();
      let endDate = new Date();
      
      // Por defecto, último mes
      startDate.setMonth(startDate.getMonth() - 1);
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const stats = await this.professionalStatsService.getComparativeStats(
        startDate,
        endDate
      );
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}