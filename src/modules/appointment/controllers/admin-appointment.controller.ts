// src/modules/appointment/controllers/admin-appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AdminAppointmentService, AppointmentFilterOptions } from '../services/admin-appointment.service';
import { ApiResponse, PaginationParams } from '../../../core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';
import { AppointmentStatus } from '../../../models/appointment.model';

export class AdminAppointmentController {
  private adminAppointmentService: AdminAppointmentService;

  constructor() {
    this.adminAppointmentService = new AdminAppointmentService();
  }

  /**
   * Buscar citas con filtros avanzados
   * @route GET /api/admin/appointments/search
   */
  searchAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parámetros de paginación
      const pagination: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sort: req.query.sort as string || 'start_time',
        order: (req.query.order as 'ASC' | 'DESC') || 'DESC'
      };

      // Filtros de búsqueda
      const filters: AppointmentFilterOptions = {};

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

      if (req.query.search) {
        filters.searchTerm = req.query.search as string;
      }

      // Ejecutar búsqueda con paginación
      const result = await this.adminAppointmentService.searchAppointmentsWithPagination(
        filters,
        pagination
      );

      // Construir respuesta
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
   * Procesar citas en masa (aprobar/rechazar)
   * @route POST /api/admin/appointments/bulk-process
   */
  bulkProcessAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { appointmentIds, action, reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }

      if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
        throw new BadRequestError('Debe proporcionar al menos un ID de cita');
      }

      if (!action || (action !== 'confirm' && action !== 'reject')) {
        throw new BadRequestError('Acción inválida. Debe ser "confirm" o "reject"');
      }

      const result = await this.adminAppointmentService.bulkProcessAppointments(
        appointmentIds,
        action,
        reason,
        userId
      );

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        data: {
          processed: result.processed,
          failed: result.failed
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reasignar una cita a otro profesional
   * @route PUT /api/admin/appointments/:id/reassign
   */
  reassignAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { professionalId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }

      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }

      if (!professionalId || isNaN(parseInt(professionalId))) {
        throw new BadRequestError('ID de profesional inválido');
      }

      const appointment = await this.adminAppointmentService.reassignAppointment(
        appointmentId,
        parseInt(professionalId),
        userId
      );

      const response: ApiResponse = {
        success: true,
        message: 'Cita reasignada correctamente',
        data: appointment,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener métricas para el dashboard
   * @route GET /api/admin/appointments/metrics
   */
  getAppointmentMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let startDate = new Date();
      let endDate = new Date();

      // Por defecto, último mes
      startDate.setMonth(startDate.getMonth() - 1);

      // Procesar fechas si se proporcionan
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const metrics = await this.adminAppointmentService.getAppointmentMetrics(startDate, endDate);

      const response: ApiResponse = {
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener carga de trabajo de los profesionales
   * @route GET /api/admin/appointments/workload
   */
  getProfessionalWorkload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let startDate = new Date();
      let endDate = new Date();

      // Por defecto, último mes
      startDate.setMonth(startDate.getMonth() - 1);

      // Procesar fechas si se proporcionan
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const workload = await this.adminAppointmentService.getProfessionalWorkload(startDate, endDate);

      const response: ApiResponse = {
        success: true,
        data: workload,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}