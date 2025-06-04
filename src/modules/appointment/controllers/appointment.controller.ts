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
  getAllAppointments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const appointments = await this.appointmentService.getAllAppointments();

      const response: ApiResponse = {
        success: true,
        data: appointments,
        timestamp: new Date().toISOString(),
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
  getAppointmentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        throw new BadRequestError('ID de cita inválido');
      }

      const appointment = await this.appointmentService.getAppointmentById(id);

      const response: ApiResponse = {
        success: true,
        data: appointment,
        timestamp: new Date().toISOString(),
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
  getAppointmentsByPatient = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);

      if (isNaN(patientId)) {
        throw new BadRequestError('ID de paciente inválido');
      }

      const appointments =
        await this.appointmentService.getAppointmentsByPatient(patientId);

      const response: ApiResponse = {
        success: true,
        data: appointments,
        timestamp: new Date().toISOString(),
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
  getAppointmentsByProfessional = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.id);

      if (isNaN(professionalId)) {
        throw new BadRequestError('ID de profesional inválido');
      }

      const appointments =
        await this.appointmentService.getAppointmentsByProfessional(
          professionalId
        );

      const response: ApiResponse = {
        success: true,
        data: appointments,
        timestamp: new Date().toISOString(),
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
  createAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = req.body;
      delete data.id;
      const userId = req.user?.id;

      // Convertir las fechas de string a Date si es necesario
      if (typeof data.start_time === 'string') {
        data.start_time = new Date(data.start_time);
      }

      if (typeof data.end_time === 'string') {
        data.end_time = new Date(data.end_time);
      }

      data.patient_id = parseInt(data.patient_id);

      data.created_at = new Date();
      data.updated_at = new Date();

      if (data.professional) {
        // Check if all required properties exist before setting location
        if (
          data.professional.attention_township_name &&
          data.professional.user &&
          data.professional.user.first_name
        ) {
          // Use empty string as fallback for missing city name
          const cityName = data.professional.consultation_address || '';

          data.location =
            data.professional.attention_township_name +
            '_' +
            cityName +
            '_' +
            data.professional.user.first_name;
        }

        // Set professional_id from professional object if it exists
        if (data.professional.id) {
          data.professional_id = data.professional.id;
        }

        // Remove the professional object to prevent conflicts
        delete data.professional;
      }
      const appointment = await this.appointmentService.createAppointment(
        data,
        userId
      );

      const response: ApiResponse = {
        success: true,
        message: 'Cita creada correctamente',
        data: appointment,
        timestamp: new Date().toISOString(),
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
  updateAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

      data.location =
        data.professional.attention_township_name +
        '_' +
        data.professional.attention_city_name +
        '_' +
        data.professional.user.first_name;

      const appointment = await this.appointmentService.updateAppointment(
        id,
        data,
        userId
      );

      const response: ApiResponse = {
        success: true,
        message: 'Cita actualizada correctamente',
        data: appointment,
        timestamp: new Date().toISOString(),
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
  changeAppointmentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

      const appointment = await this.appointmentService.changeAppointmentStatus(
        id,
        status,
        reason,
        userId
      );

      const response: ApiResponse = {
        success: true,
        message: `Estado de cita actualizado a "${status}"`,
        data: appointment,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Buscar citas con filtros
   * @route GET /api/appointments/search
   */
  searchAppointments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const searchTerm = req.query.search as string;
      
      // Extraer filtros de la query
      const filters: any = {};
      
      // Procesar filtros desde la query
      if (req.query.professionalId) {
        filters.professionalId = parseInt(req.query.professionalId as string);
      }

      if (req.query.patientId) {
        filters.patientId = parseInt(req.query.patientId as string);
      }

      if (req.query.appointmentTypeId) {
        filters.appointmentTypeId = parseInt(req.query.appointmentTypeId as string);
      }

      if (req.query.status) {
        // Si es un array de estados
        if (Array.isArray(req.query.status)) {
          filters.status = req.query.status as AppointmentStatus[];
        } else {
          filters.status = req.query.status as AppointmentStatus;
        }
      }

      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      const appointments = await this.appointmentService.searchAppointments(searchTerm, filters);

      const response: ApiResponse = {
        success: true,
        data: appointments,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
