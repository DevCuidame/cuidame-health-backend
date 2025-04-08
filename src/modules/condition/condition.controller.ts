import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../core/interfaces/response.interface';
import { ConditionDto } from './condition.dto';
import { ConditionService } from './condition.service';

export class ConditionController {
  private conditionService: ConditionService;

  constructor() {
    this.conditionService = new ConditionService();
  }

  /**
   * Crea o actualiza la condición de un paciente
   * @route POST /api/medical-info/condition
   */
  saveCondition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: ConditionDto = req.body;
      
      const condition = await this.conditionService.saveCondition(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Condición guardada correctamente',
        data: condition,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene la condición de un paciente
   * @route GET /api/medical-info/condition/:patientId
   */
  getConditionByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const patientId = parseInt(req.params.patientId);
      
      const condition = await this.conditionService.getConditionByPatient(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: condition,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}