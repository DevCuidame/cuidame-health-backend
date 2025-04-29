// src/modules/appointment/controllers/recurring-appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { RecurringAppointmentService } from '../services/recurring-appointment.service';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';

export class RecurringAppointmentController {
  private recurringAppointmentService: RecurringAppointmentService;

  constructor() {
    this.recurringAppointmentService = new RecurringAppointmentService();
  }

  /**
   * Obtener todas las citas recurrentes
   * @route GET /api/recurring-appointments
   */
  getAllRecurringAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recurringAppointments = await this.recurringAppointmentService.getAllRecurringAppointments();
      
      const response: ApiResponse = {
        success: true,
        data: recurringAppointments,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener una cita recurrente por ID
   * @route GET /api/recurring-appointments/:id
   */
  getRecurringAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cita recurrente inválido');
      }
      
      const recurringAppointment = await this.recurringAppointmentService.getRecurringAppointmentById(id);
      
      const response: ApiResponse = {
        success: true,
        data: recurringAppointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener citas recurrentes por paciente
   * @route GET /api/recurring-appointments/patient/:id
   */
  getRecurringAppointmentsByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        throw new BadRequestError('ID de paciente inválido');
      }
      
      const recurringAppointments = await this.recurringAppointmentService.getRecurringAppointmentsByPatient(patientId);
      
      const response: ApiResponse = {
        success: true,
        data: recurringAppointments,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener citas recurrentes por profesional
   * @route GET /api/recurring-appointments/professional/:id
   */
  getRecurringAppointmentsByProfessional = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.id);
      
      if (isNaN(professionalId)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      const recurringAppointments = await this.recurringAppointmentService.getRecurringAppointmentsByProfessional(professionalId);
      
      const response: ApiResponse = {
        success: true,
        data: recurringAppointments,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear una nueva cita recurrente
   * @route POST /api/recurring-appointments
   */
  createRecurringAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      if (typeof data.end_date === 'string') {
        data.end_date = new Date(data.end_date);
      }
      
      const result = await this.recurringAppointmentService.createRecurringAppointment(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Cita recurrente creada correctamente',
        data: {
          recurringAppointment: result.recurringAppointment,
          appointmentsGenerated: result.generatedAppointments.length
        },
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar una cita recurrente
   * @route PUT /api/recurring-appointments/:id
   */
  updateRecurringAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cita recurrente inválido');
      }
      
      const data = req.body;
      const userId = req.user?.id;
      const regenerateAppointments = req.query.regenerate === 'true';
      
      // Convertir las fechas de string a Date si es necesario
      if (typeof data.start_time === 'string') {
        data.start_time = new Date(data.start_time);
      }
      
      if (typeof data.end_time === 'string') {
        data.end_time = new Date(data.end_time);
      }
      
      if (typeof data.end_date === 'string') {
        data.end_date = new Date(data.end_date);
      }
      
      const result = await this.recurringAppointmentService.updateRecurringAppointment(
        id, 
        data, 
        regenerateAppointments,
        userId
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Cita recurrente actualizada correctamente',
        data: {
          recurringAppointment: result.recurringAppointment,
          appointmentsGenerated: result.generatedAppointments ? result.generatedAppointments.length : 0
        },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Desactivar una cita recurrente
   * @route DELETE /api/recurring-appointments/:id
   */
  deactivateRecurringAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cita recurrente inválido');
      }
      
      const { cancelFuture, reason } = req.body;
      const userId = req.user?.id;
      
      const result = await this.recurringAppointmentService.deactivateRecurringAppointment(
        id,
        cancelFuture !== false, // Por defecto, cancelar citas futuras
        reason,
        userId
      );
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}