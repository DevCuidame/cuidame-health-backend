// src/modules/medical-info/sync-medical-info.controller.ts
import { Request, Response, NextFunction } from 'express';
import { SyncMedicalInfoService } from './sync-medical-info.service';
import { ApiResponse } from '../../core/interfaces/response.interface';
import { BatchVaccinesDto, BatchAllergiesDto, BatchBackgroundsDto, BatchFamilyBackgroundsDto, BatchDiseasesDto } from '../health/batch-health.dto';

export class SyncMedicalInfoController {
  private syncMedicalInfoService: SyncMedicalInfoService;

  constructor() {
    this.syncMedicalInfoService = new SyncMedicalInfoService();
  }

  /**
   * Sincroniza las vacunas de un paciente
   * @route POST /api/medical-info/sync/vaccines
   */
  syncVaccines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchVaccinesDto = req.body;
      
      const result = await this.syncMedicalInfoService.syncVaccines(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `Sincronización completa: ${result.created.length} vacunas creadas, ${result.maintained.length} mantenidas, ${result.deleted.length} eliminadas`,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sincroniza las alergias de un paciente
   * @route POST /api/medical-info/sync/allergies
   */
  syncAllergies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchAllergiesDto = req.body;
      
      const result = await this.syncMedicalInfoService.syncAllergies(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `Sincronización completa: ${result.created.length} alergias creadas, ${result.maintained.length} mantenidas, ${result.deleted.length} eliminadas`,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sincroniza los antecedentes médicos de un paciente
   * @route POST /api/medical-info/sync/backgrounds
   */
  syncBackgrounds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchBackgroundsDto = req.body;
      
      const result = await this.syncMedicalInfoService.syncBackgrounds(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `Sincronización completa: ${result.created.length} antecedentes creados, ${result.maintained.length} mantenidos, ${result.deleted.length} eliminados`,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sincroniza los antecedentes familiares de un paciente
   * @route POST /api/medical-info/sync/family-backgrounds
   */
  syncFamilyBackgrounds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchFamilyBackgroundsDto = req.body;
      
      const result = await this.syncMedicalInfoService.syncFamilyBackgrounds(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `Sincronización completa: ${result.created.length} antecedentes familiares creados, ${result.maintained.length} mantenidos, ${result.deleted.length} eliminados`,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  syncDiseases = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: BatchDiseasesDto = req.body;
      
      const result = await this.syncMedicalInfoService.syncDiseases(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `Sincronización completa: ${result.created.length} enfermedades creadas, ${result.maintained.length} mantenidas, ${result.deleted.length} eliminadas`,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

}