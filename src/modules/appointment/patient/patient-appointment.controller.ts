// src/modules/appointment/controllers/patient-appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginationParams } from '../../../core/interfaces/response.interface';
import { BadRequestError, ForbiddenError } from '../../../utils/error-handler';
import { AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentHistoryFilter, CancellationReason, PatientAppointmentService } from './patient-appointment.service';

export class PatientAppointmentController {
  private patientAppointmentService: PatientAppointmentService;

  constructor() {
    this.patientAppointmentService = new PatientAppointmentService();
  }

  /**
   * Obtener próximas citas del paciente
   * @route GET /api/patient/appointments/upcoming
   */
  getUpcomingAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId || req.user?.id);
      
      if (isNaN(patientId)) {
        throw new BadRequestError('ID de paciente inválido');
      }
      
      // Verificar permisos si se está consultando un paciente diferente al de la sesión
      if (req.params.patientId && parseInt(req.params.patientId) !== req.user?.id) {
        // Aquí se podría implementar una verificación adicional para caretakers
        // que pueden gestionar citas de sus dependientes
        throw new ForbiddenError('No tienes permiso para ver las citas de este paciente');
      }
      
      const appointments = await this.patientAppointmentService.getUpcomingAppointments(patientId);
      
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
   * Obtener citas pasadas del paciente
   * @route GET /api/patient/appointments/past
   */
  getPastAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId || req.user?.id);
      
      if (isNaN(patientId)) {
        throw new BadRequestError('ID de paciente inválido');
      }
      
      // Verificar permisos si se está consultando un paciente diferente al de la sesión
      if (req.params.patientId && parseInt(req.params.patientId) !== req.user?.id) {
        throw new ForbiddenError('No tienes permiso para ver las citas de este paciente');
      }
      
      // Obtener límite de resultados de los query params
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const appointments = await this.patientAppointmentService.getPastAppointments(patientId, limit);
      
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
   * Obtener historial completo de citas con paginación y filtros
   * @route GET /api/patient/appointments/history
   */
  getAppointmentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId || req.user?.id);
      
      if (isNaN(patientId)) {
        throw new BadRequestError('ID de paciente inválido');
      }
      
      // Verificar permisos si se está consultando un paciente diferente al de la sesión
      if (req.params.patientId && parseInt(req.params.patientId) !== req.user?.id) {
        throw new ForbiddenError('No tienes permiso para ver las citas de este paciente');
      }
      
      // Parámetros de paginación
      const pagination: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sort: req.query.sort as string || 'start_time',
        order: (req.query.order as 'ASC' | 'DESC') || 'DESC'
      };
      
      // Filtros
      const filter: AppointmentHistoryFilter = {};
      
      // Procesar estado
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          filter.status = req.query.status as AppointmentStatus[];
        } else {
          filter.status = req.query.status as AppointmentStatus;
        }
      }
      
      // Procesar fechas
      if (req.query.startDate) {
        filter.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filter.endDate = new Date(req.query.endDate as string);
      }
      
      // Procesar otros filtros
      if (req.query.professionalId) {
        filter.professionalId = parseInt(req.query.professionalId as string);
      }
      
      if (req.query.appointmentTypeId) {
        filter.appointmentTypeId = parseInt(req.query.appointmentTypeId as string);
      }
      
      const result = await this.patientAppointmentService.getAppointmentHistory(
        patientId,
        filter,
        pagination
      );
      
      const response: ApiResponse = {
        success: true,
        data: result.items,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancelar una cita
   * @route POST /api/patient/appointments/:id/cancel
   */
  cancelAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      const patientId = req.user?.id;
      
      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      if (!patientId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const { reason, reasonDetails } = req.body;
      
      // Validar que el motivo sea válido
      if (!reason || !Object.values(CancellationReason).includes(reason as CancellationReason)) {
        throw new BadRequestError('Motivo de cancelación inválido');
      }
      
      const appointment = await this.patientAppointmentService.cancelAppointment(
        appointmentId,
        patientId,
        reason as CancellationReason,
        reasonDetails
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Cita cancelada correctamente',
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Solicitar reprogramación de una cita
   * @route POST /api/patient/appointments/:id/reschedule
   */
  requestReschedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      const patientId = req.user?.id;
      
      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      if (!patientId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const { newStartTime, newEndTime, reason } = req.body;
      
      if (!newStartTime || !newEndTime) {
        throw new BadRequestError('Debe proporcionar nueva fecha y hora de inicio y fin');
      }
      
      if (!reason) {
        throw new BadRequestError('Debe proporcionar un motivo para la reprogramación');
      }
      
      // Convertir fechas de string a Date si es necesario
      const startTime = typeof newStartTime === 'string' ? new Date(newStartTime) : newStartTime;
      const endTime = typeof newEndTime === 'string' ? new Date(newEndTime) : newEndTime;
      
      const appointment = await this.patientAppointmentService.requestReschedule(
        appointmentId,
        patientId,
        startTime,
        endTime,
        reason
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Solicitud de reprogramación enviada correctamente',
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Confirmar asistencia a una cita
   * @route POST /api/patient/appointments/:id/confirm-attendance
   */
  confirmAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      const patientId = req.user?.id;
      
      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      if (!patientId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const appointment = await this.patientAppointmentService.confirmAttendance(
        appointmentId,
        patientId
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Asistencia confirmada correctamente',
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener detalles de una cita
   * @route GET /api/patient/appointments/:id
   */
  getAppointmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      const patientId = req.user?.id;
      
      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      if (!patientId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const appointment = await this.patientAppointmentService.getAppointmentDetails(
        appointmentId,
        patientId
      );
      
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
}