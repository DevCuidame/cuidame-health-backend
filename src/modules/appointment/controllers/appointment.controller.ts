// src/modules/appointment/appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';
import { AppointmentStatus } from '../../../models/appointment.model';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  /**
   * Obtener todas las citas
   * @route GET /api/appointments
   */
  getAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await this.appointmentService.getAllAppointments();
      
      const response: ApiResponse = {
        success: true,
        data: appointments,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener una cita por ID
   * @route GET /api/appointments/:id
   */
  getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      const appointment = await this.appointmentService.getAppointmentById(id);
      
      const response: ApiResponse = {
        success: true,
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener citas por paciente
   * @route GET /api/appointments/patient/:id
   */
  getAppointmentsByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        throw new BadRequestError('ID de paciente inválido');
      }
      
      const appointments = await this.appointmentService.getAppointmentsByPatient(patientId);
      
      const response: ApiResponse = {
        success: true,
        data: appointments,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener citas por profesional
   * @route GET /api/appointments/professional/:id
   */
  getAppointmentsByProfessional = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.id);
      
      if (isNaN(professionalId)) {
        throw new BadRequestError('ID de profesional inválido');
      }
      
      const appointments = await this.appointmentService.getAppointmentsByProfessional(professionalId);
      
      const response: ApiResponse = {
        success: true,
        data: appointments,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear una nueva cita
   * @route POST /api/appointments
   */
  createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      const appointment = await this.appointmentService.createAppointment(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Cita creada correctamente',
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar una cita
   * @route PUT /api/appointments/:id
   */
  updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cita inválido');
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
      
      const appointment = await this.appointmentService.updateAppointment(id, data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Cita actualizada correctamente',
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cambiar el estado de una cita
   * @route PATCH /api/appointments/:id/status
   */
  changeAppointmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      const { status, reason } = req.body;
      const userId = req.user?.id;
      
      // Validar que el estado sea válido
      if (!Object.values(AppointmentStatus).includes(status)) {
        throw new BadRequestError('Estado de cita inválido');
      }
      
      const appointment = await this.appointmentService.changeAppointmentStatus(id, status, reason, userId);
      
      const response: ApiResponse = {
        success: true,
        message: `Estado de cita actualizado a "${status}"`,
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}