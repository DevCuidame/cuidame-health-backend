import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto, UpdatePatientDto } from '../dto/patient.dto';
import { ApiResponse, PaginationParams } from '../interfaces/response.interface';
import { BadRequestError } from '../utils/error-handler';

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  /**
   * Crear un nuevo paciente
   * @route POST /api/patients
   */
  createPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const patientData: CreatePatientDto = req.body;
      const patient = await this.patientService.createPatient(patientData, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Paciente creado correctamente',
        data: patient,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener un paciente por ID
   * @route GET /api/patients/:id
   */
  getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const patient = await this.patientService.getPatientById(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: patient,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener detalles completos de un paciente
   * @route GET /api/patients/:id/details
   */
  getPatientFullDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const patientDetails = await this.patientService.getPatientFullDetails(patientId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: patientDetails,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener pacientes del usuario autenticado
   * @route GET /api/patients/my-patients
   */
  getMyPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const patients = await this.patientService.getPatientsByCaregiver(userId);
      
      const response: ApiResponse = {
        success: true,
        data: patients,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Buscar pacientes
   * @route GET /api/patients/search
   */
  searchPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const search = req.query.q as string || '';
      
      const patients = await this.patientService.searchPatients(search, userId);
      
      const response: ApiResponse = {
        success: true,
        data: patients,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener todos los pacientes (con paginación - solo para administradores)
   * @route GET /api/patients
   */
  getAllPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sort: req.query.sort as string || 'id',
        order: (req.query.order as 'ASC' | 'DESC') || 'ASC'
      };
      
      const result = await this.patientService.getPatientsWithPagination(params);
      
      const response: ApiResponse = {
        success: true,
        data: result.items,
        metadata: {
          totalItems: result.metadata.totalItems,
          itemCount: result.metadata.itemCount,
          totalPages: result.metadata.totalPages,
          currentPage: result.metadata.currentPage
        },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un paciente
   * @route PUT /api/patients/:id
   */
  updatePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const patientData: UpdatePatientDto = req.body;
      const updatedPatient = await this.patientService.updatePatient(patientId, patientData, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Paciente actualizado correctamente',
        data: updatedPatient,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar imagen de un paciente
   * @route PUT /api/patients/:id/image
   */
  updatePatientImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      const userId = req.user?.id;
      const { imageData } = req.body;
      
      if (!imageData) {
        throw new BadRequestError('No se proporcionó imagen');
      }
      
      const updatedPatient = await this.patientService.updatePatientImage(patientId, imageData, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Imagen de paciente actualizada correctamente',
        data: { imageUrl: updatedPatient.imagebs64 },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un paciente
   * @route DELETE /api/patients/:id
   */
  deletePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const result = await this.patientService.deletePatient(patientId, userId);
      
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