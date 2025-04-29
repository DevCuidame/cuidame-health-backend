// src/modules/appointment/controllers/time-block.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TimeBlockService } from '../services/time-block.service';
import { ApiResponse } from '../../../core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';

export class TimeBlockController {
  private timeBlockService: TimeBlockService;

  constructor() {
    this.timeBlockService = new TimeBlockService();
  }

  /**
   * Crear un nuevo bloque de tiempo
   * @route POST /api/time-blocks
   */
  createTimeBlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const userId = req.user?.id;
      
      // Convertir las fechas de string a Date si es necesario
      if (typeof data.start_time === 'string') {
        data.start_time = new Date(data.start_time);
      }
      
      if (typeof data.end_time === 'string') {
        data.end_time = new Date(data.end_time);
      }
      
      const timeBlock = await this.timeBlockService.createTimeBlock(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Bloque de tiempo creado correctamente',
        data: timeBlock,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener bloque de tiempo por ID
   * @route GET /api/time-blocks/:id
   */
  getTimeBlockById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de bloque de tiempo inválido');
      }
      
      const timeBlock = await this.timeBlockService.getTimeBlockById(id);
      
      const response: ApiResponse = {
        success: true,
        data: timeBlock,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener bloques de tiempo por profesional
   * @route GET /api/time-blocks/professional/:id
   */
  getTimeBlocksByProfessional = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.id);
      
      if (isNaN(professionalId)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      const timeBlocks = await this.timeBlockService.getTimeBlocksByProfessional(professionalId);
      
      const response: ApiResponse = {
        success: true,
        data: timeBlocks,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un bloque de tiempo
   * @route PUT /api/time-blocks/:id
   */
  updateTimeBlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de bloque de tiempo inválido');
      }
      
      const data = req.body;
      const userId = req.user?.id;
      
      // Convertir las fechas de string a Date si es necesario
      if (typeof data.start_time === 'string') {
        data.start_time = new Date(data.start_time);
      }
      
      if (typeof data.end_time === 'string') {
        data.end_time = new Date(data.end_time);
      }
      
      const timeBlock = await this.timeBlockService.updateTimeBlock(id, data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Bloque de tiempo actualizado correctamente',
        data: timeBlock,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un bloque de tiempo
   * @route DELETE /api/time-blocks/:id
   */
  deleteTimeBlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de bloque de tiempo inválido');
      }
      
      const result = await this.timeBlockService.deleteTimeBlock(id);
      
      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}