// src/modules/medical-info/batch-medical-info.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BatchMedicalInfoService } from './batch-medical-info.service';
import { ApiResponse } from '../../core/interfaces/response.interface';
import { BatchVaccinesDto, BatchAllergiesDto, BatchBackgroundsDto, BatchFamilyBackgroundsDto } from '../health/batch-health.dto';

export class BatchMedicalInfoController {
  private batchMedicalInfoService: BatchMedicalInfoService;

  constructor() {
    this.batchMedicalInfoService = new BatchMedicalInfoService();
  }

  /**
   * Crea múltiples vacunas para un paciente
   * @route POST /api/medical-info/batch/vaccines
   */
  createBatchVaccines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchVaccinesDto = req.body;
      
      const vaccines = await this.batchMedicalInfoService.createBatchVaccines(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `${vaccines.length} vacunas creadas correctamente`,
        data: vaccines,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea múltiples alergias para un paciente
   * @route POST /api/medical-info/batch/allergies
   */
  createBatchAllergies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchAllergiesDto = req.body;
      
      const allergies = await this.batchMedicalInfoService.createBatchAllergies(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `${allergies.length} alergias creadas correctamente`,
        data: allergies,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea múltiples antecedentes para un paciente
   * @route POST /api/medical-info/batch/backgrounds
   */
  createBatchBackgrounds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchBackgroundsDto = req.body;
      
      const backgrounds = await this.batchMedicalInfoService.createBatchBackgrounds(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `${backgrounds.length} antecedentes creados correctamente`,
        data: backgrounds,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea múltiples antecedentes familiares para un paciente
   * @route POST /api/medical-info/batch/family-backgrounds
   */
  createBatchFamilyBackgrounds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchFamilyBackgroundsDto = req.body;
      
      const familyBackgrounds = await this.batchMedicalInfoService.createBatchFamilyBackgrounds(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `${familyBackgrounds.length} antecedentes familiares creados correctamente`,
        data: familyBackgrounds,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}