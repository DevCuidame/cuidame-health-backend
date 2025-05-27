import { Request, Response, NextFunction } from 'express';

import { MedicalSpecialtyService } from './medical-specialty.service';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { MedicalSpecialties } from '../../models/medical-specialties.model';

export class MedicalSpecialtyController {
  private medicalSpecialtyService: MedicalSpecialtyService;

  constructor() {
    this.medicalSpecialtyService = new MedicalSpecialtyService();
  }

  /**
   * Obtener todas las especialidades médicas
   * @returns Lista de especialidades médicas
   */
  getAllSpecialties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const specialties = await this.medicalSpecialtyService.getAllSpecialties();

      const response: ApiResponse = {
        success: true,
        message: 'Especialidades médicas obtenidas correctamente',
        data: specialties,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener una especialidad médica por su ID
   * @param id ID de la especialidad médica
   * @returns Especialidad médica
   */
  getSpecialtyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const specialtyId = parseInt(req.params.id);

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const specialty = await this.medicalSpecialtyService.getSpecialtyById(specialtyId);

      const response: ApiResponse = {
        success: true,
        message: 'Especialidad médica obtenida correctamente',
        data: specialty,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear una nueva especialidad médica
   * @param name Nombre de la especialidad médica
   * @returns Especialidad médica creada
   */
  createSpecialty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const { name } = req.body;

      if (!name) {
        throw new Error('El nombre de la especialidad es requerido');
      }

      const specialty = await this.medicalSpecialtyService.createSpecialty(name);

      const response: ApiResponse = {
        success: true,
        message: 'Especialidad médica creada correctamente',
        data: specialty,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar una especialidad médica existente
   * @param id ID de la especialidad médica
   * @param name Nuevo nombre de la especialidad médica
   * @returns Especialidad médica actualizada
   */
  updateSpecialty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const specialtyId = parseInt(req.params.id);

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const { name } = req.body;

      if (!name) {
        throw new Error('El nombre de la especialidad es requerido');
      }

      const specialty = await this.medicalSpecialtyService.updateSpecialty(specialtyId, name);

      const response: ApiResponse = {
        success: true,
        message: 'Especialidad médica actualizada correctamente',
        data: specialty,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar una especialidad médica
   * @param id ID de la especialidad médica
   * @returns Mensaje de confirmación
   */
  deleteSpecialty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const specialtyId = parseInt(req.params.id);

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      await this.medicalSpecialtyService.deleteSpecialty(specialtyId);

      const response: ApiResponse = {
        success: true,
        message: 'Especialidad médica eliminada correctamente',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
