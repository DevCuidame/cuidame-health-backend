// src/modules/appointment/availability.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AvailabilityService } from '../services/availability.service';
import { BadRequestError } from '../../../utils/error-handler';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { DayOfWeek } from '../../../models/availability.model';

export class AvailabilityController {
  private availabilityService: AvailabilityService;

  constructor() {
    this.availabilityService = new AvailabilityService();
  }

  /**
   * Obtener disponibilidad de un profesional
   * @route GET /api/availability/professional/:id
   */
  getProfessionalAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.id);
      
      if (isNaN(professionalId)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      const availability = await this.availabilityService.getProfessionalAvailability(professionalId);
      
      const response: ApiResponse = {
        success: true,
        data: availability,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Añadir nuevo horario de disponibilidad
   * @route POST /api/availability
   */
  addAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      
      // Validar que el día de la semana sea válido
      if (data.day_of_week && !Object.values(DayOfWeek).includes(data.day_of_week)) {
        throw new BadRequestError('Día de la semana inválido');
      }
      
      const availability = await this.availabilityService.addAvailability(data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Horario de disponibilidad añadido correctamente',
        data: availability,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar horario de disponibilidad
   * @route PUT /api/availability/:id
   */
  updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de disponibilidad inválido');
      }
      
      const data = req.body;
      
      // Validar que el día de la semana sea válido
      if (data.day_of_week && !Object.values(DayOfWeek).includes(data.day_of_week)) {
        throw new BadRequestError('Día de la semana inválido');
      }
      
      const availability = await this.availabilityService.updateAvailability(id, data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Horario de disponibilidad actualizado correctamente',
        data: availability,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar horario de disponibilidad
   * @route DELETE /api/availability/:id
   */
  deleteAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de disponibilidad inválido');
      }
      
      const result = await this.availabilityService.deleteAvailability(id);
      
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