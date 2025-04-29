// src/modules/appointment/health-professional.controller.ts
import { Request, Response, NextFunction } from 'express';
import { HealthProfessionalService } from '../services/health-professional.service';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';

export class HealthProfessionalController {
  private healthProfessionalService: HealthProfessionalService;

  constructor() {
    this.healthProfessionalService = new HealthProfessionalService();
  }

  /**
   * Obtener todos los profesionales de salud
   * @route GET /api/professionals
   */
  getAllProfessionals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionals = await this.healthProfessionalService.getAllProfessionals();
      
      const response: ApiResponse = {
        success: true,
        data: professionals,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener un profesional por ID
   * @route GET /api/professionals/:id
   */
  getProfessionalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      const professional = await this.healthProfessionalService.getProfessionalById(id);
      
      const response: ApiResponse = {
        success: true,
        data: professional,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo profesional de salud
   * @route POST /api/professionals
   */
  createProfessional = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      
      const professional = await this.healthProfessionalService.createProfessional(data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Profesional creado correctamente',
        data: professional,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un profesional de salud
   * @route PUT /api/professionals/:id
   */
  updateProfessional = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      const data = req.body;
      
      const professional = await this.healthProfessionalService.updateProfessional(id, data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Profesional actualizado correctamente',
        data: professional,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar/desactivar un profesional de salud
   * @route DELETE /api/professionals/:id
   */
  deleteProfessional = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      const result = await this.healthProfessionalService.deleteProfessional(id);
      
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

  /**
   * Buscar profesionales por especialidad
   * @route GET /api/professionals/specialty/:specialty
   */
  findBySpecialty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const specialty = req.params.specialty;
      
      const professionals = await this.healthProfessionalService.findBySpecialty(specialty);
      
      const response: ApiResponse = {
        success: true,
        data: professionals,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}