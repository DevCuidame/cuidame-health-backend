// src/modules/health-data/health-data.controller.ts
import { Request, Response, NextFunction } from 'express';
import { HealthDataService } from './health-data.service';
import { ApiResponse } from '../../core/interfaces/response.interface';

export class HealthDataController {
  private healthDataService: HealthDataService;

  constructor() {
    this.healthDataService = new HealthDataService();
  }

  /**
   * Obtiene todos los datos de salud de un paciente por su ID
   * @route GET /api/health-data/:id
   */
  getHealthDataById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id, 10);
      const caregiverId = req.user?.id;
      
      const healthData = await this.healthDataService.getHealthDataById(patientId, caregiverId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Datos de salud obtenidos correctamente',
        data: healthData,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}