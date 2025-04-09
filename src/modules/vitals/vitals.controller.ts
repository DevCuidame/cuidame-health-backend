import { Request, Response, NextFunction } from 'express';
import { VitalsService } from './vitals.service';
import { ApiResponse } from '../../core/interfaces/response.interface';
import {
  CreateHeartRateDto,
  CreateBloodPressureDto,
  CreateBloodGlucoseDto,
  CreateBloodOxygenDto,
  CreateRespiratoryRateDto
} from '../health/health.dto';

export class VitalsController {
  private vitalsService: VitalsService;

  constructor() {
    this.vitalsService = new VitalsService();
  }

  /**
   * Obtener registros de frecuencia cardíaca de un paciente
   * @route GET /api/heart-rate/patient/:patientId
   */
  getHeartRatesByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId);
      const userId = req.user?.id;
      
      const heartRates = await this.vitalsService.getHeartRatesByPatient(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { heartRateMetrics: heartRates },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo registro de frecuencia cardíaca
   * @route POST /api/heart-rate
   */
  createHeartRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: CreateHeartRateDto = req.body;
      
      const heartRate = await this.vitalsService.createHeartRate(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Frecuencia cardíaca registrada correctamente',
        data: heartRate,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un registro de frecuencia cardíaca
   * @route PUT /api/heart-rate/:id
   */
  updateHeartRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const data = req.body;
      
      const heartRate = await this.vitalsService.updateHeartRate(id, data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Frecuencia cardíaca actualizada correctamente',
        data: heartRate,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un registro de frecuencia cardíaca
   * @route DELETE /api/heart-rate/:id
   */
  deleteHeartRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      await this.vitalsService.deleteHeartRate(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Frecuencia cardíaca eliminada correctamente',
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener registros de presión arterial de un paciente
   * @route GET /api/blood-pressure/patient/:patientId
   */
  getBloodPressuresByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId);
      const userId = req.user?.id;
      
      const bloodPressures = await this.vitalsService.getBloodPressuresByPatient(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { bloodPressureMetrics: bloodPressures },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo registro de presión arterial
   * @route POST /api/blood-pressure
   */
  createBloodPressure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: CreateBloodPressureDto = req.body;
      
      const bloodPressure = await this.vitalsService.createBloodPressure(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Presión arterial registrada correctamente',
        data: bloodPressure,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un registro de presión arterial
   * @route PUT /api/blood-pressure/:id
   */
  updateBloodPressure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const data = req.body;
      
      const bloodPressure = await this.vitalsService.updateBloodPressure(id, data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Presión arterial actualizada correctamente',
        data: bloodPressure,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un registro de presión arterial
   * @route DELETE /api/blood-pressure/:id
   */
  deleteBloodPressure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      await this.vitalsService.deleteBloodPressure(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Presión arterial eliminada correctamente',
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener registros de glucosa en sangre de un paciente
   * @route GET /api/blood-glucose/patient/:patientId
   */
  getBloodGlucosesByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId);
      const userId = req.user?.id;
      
      const bloodGlucoses = await this.vitalsService.getBloodGlucosesByPatient(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { bloodGlucoseMetrics: bloodGlucoses },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo registro de glucosa en sangre
   * @route POST /api/blood-glucose
   */
  createBloodGlucose = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: CreateBloodGlucoseDto = req.body;
      
      const bloodGlucose = await this.vitalsService.createBloodGlucose(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Glucosa en sangre registrada correctamente',
        data: bloodGlucose,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un registro de glucosa en sangre
   * @route PUT /api/blood-glucose/:id
   */
  updateBloodGlucose = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const data = req.body;
      
      const bloodGlucose = await this.vitalsService.updateBloodGlucose(id, data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Glucosa en sangre actualizada correctamente',
        data: bloodGlucose,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un registro de glucosa en sangre
   * @route DELETE /api/blood-glucose/:id
   */
  deleteBloodGlucose = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      await this.vitalsService.deleteBloodGlucose(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Glucosa en sangre eliminada correctamente',
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener registros de oxígeno en sangre de un paciente
   * @route GET /api/blood-oxygen/patient/:patientId
   */
  getBloodOxygensByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId);
      const userId = req.user?.id;
      
      const bloodOxygens = await this.vitalsService.getBloodOxygensByPatient(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { bloodOxygenMetrics: bloodOxygens },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo registro de oxígeno en sangre
   * @route POST /api/blood-oxygen
   */
  createBloodOxygen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: CreateBloodOxygenDto = req.body;
      
      const bloodOxygen = await this.vitalsService.createBloodOxygen(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Oxígeno en sangre registrado correctamente',
        data: bloodOxygen,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un registro de oxígeno en sangre
   * @route PUT /api/blood-oxygen/:id
   */
  updateBloodOxygen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const data = req.body;
      
      const bloodOxygen = await this.vitalsService.updateBloodOxygen(id, data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Oxígeno en sangre actualizado correctamente',
        data: bloodOxygen,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un registro de oxígeno en sangre
   * @route DELETE /api/blood-oxygen/:id
   */
  deleteBloodOxygen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      await this.vitalsService.deleteBloodOxygen(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Oxígeno en sangre eliminado correctamente',
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener registros de frecuencia respiratoria de un paciente
   * @route GET /api/respiratory-rate/patient/:patientId
   */
  getRespiratoryRatesByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId);
      const userId = req.user?.id;
      
      const respiratoryRates = await this.vitalsService.getRespiratoryRatesByPatient(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { respiratoryRateMetrics: respiratoryRates },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo registro de frecuencia respiratoria
   * @route POST /api/respiratory-rate
   */
  createRespiratoryRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const data: CreateRespiratoryRateDto = req.body;
      
      const respiratoryRate = await this.vitalsService.createRespiratoryRate(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Frecuencia respiratoria registrada correctamente',
        data: respiratoryRate,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un registro de frecuencia respiratoria
   * @route PUT /api/respiratory-rate/:id
   */
  updateRespiratoryRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const data = req.body;
      
      const respiratoryRate = await this.vitalsService.updateRespiratoryRate(id, data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Frecuencia respiratoria actualizada correctamente',
        data: respiratoryRate,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un registro de frecuencia respiratoria
   * @route DELETE /api/respiratory-rate/:id
   */
  deleteRespiratoryRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      
      await this.vitalsService.deleteRespiratoryRate(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Frecuencia respiratoria eliminada correctamente',
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}