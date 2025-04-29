// src/modules/appointment/appointment-type.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppointmentTypeService } from '../services/appointment-type.service';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';

export class AppointmentTypeController {
  private appointmentTypeService: AppointmentTypeService;

  constructor() {
    this.appointmentTypeService = new AppointmentTypeService();
  }

  /**
   * Obtener todos los tipos de cita
   * @route GET /api/appointment-types
   */
  getAllTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Si se solicita solo los activos
      const onlyActive = req.query.active === 'true';
      
      const types = onlyActive 
        ? await this.appointmentTypeService.getActiveTypes()
        : await this.appointmentTypeService.getAllTypes();
      
      const response: ApiResponse = {
        success: true,
        data: types,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener un tipo de cita por ID
   * @route GET /api/appointment-types/:id
   */
  getTypeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de tipo de cita inválido');
      }
      
      const type = await this.appointmentTypeService.getTypeById(id);
      
      const response: ApiResponse = {
        success: true,
        data: type,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo tipo de cita
   * @route POST /api/appointment-types
   */
  createType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      
      const type = await this.appointmentTypeService.createType(data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Tipo de cita creado correctamente',
        data: type,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un tipo de cita
   * @route PUT /api/appointment-types/:id
   */
  updateType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de tipo de cita inválido');
      }
      
      const data = req.body;
      
      const type = await this.appointmentTypeService.updateType(id, data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Tipo de cita actualizado correctamente',
        data: type,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar/desactivar un tipo de cita
   * @route DELETE /api/appointment-types/:id
   */
  deleteType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de tipo de cita inválido');
      }
      
      const result = await this.appointmentTypeService.deleteType(id);
      
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