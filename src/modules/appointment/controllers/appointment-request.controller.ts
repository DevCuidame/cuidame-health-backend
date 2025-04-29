// src/modules/appointment/appointment-request.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppointmentRequestService } from '../services/appointment-request.service';
import { AvailabilityService } from '../services/availability.service';
import { BadRequestError } from '../../../utils/error-handler';
import { ApiResponse } from 'src/core/interfaces/response.interface';

export class AppointmentRequestController {
  private appointmentRequestService: AppointmentRequestService;
  private availabilityService: AvailabilityService;

  constructor() {
    this.appointmentRequestService = new AppointmentRequestService();
    this.availabilityService = new AvailabilityService();
  }

  /**
   * Consultar días disponibles para un mes
   * @route GET /api/appointment-requests/available-days/:professionalId/:year/:month
   */
  getAvailableDays = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.professionalId);
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(professionalId) || isNaN(year) || isNaN(month)) {
        throw new BadRequestError('Parámetros inválidos');
      }
      
      const availableDays = await this.availabilityService.getAvailableDays(
        professionalId,
        year,
        month
      );
      
      const response: ApiResponse = {
        success: true,
        data: { availableDays },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Consultar horarios disponibles para una fecha
   * @route GET /api/appointment-requests/available-slots/:professionalId/:date
   */
  getAvailableTimeSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const professionalId = parseInt(req.params.professionalId);
      const dateStr = req.params.date; // formato: YYYY-MM-DD
      
      if (isNaN(professionalId) || !dateStr) {
        throw new BadRequestError('Parámetros inválidos');
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestError('Formato de fecha inválido');
      }
      
      const availableSlots = await this.availabilityService.getAvailableTimeSlots(
        professionalId,
        date
      );
      
      // Formatear los slots para la respuesta
      const formattedSlots = availableSlots.map((slot: any) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        // Formato legible para la UI
        time: `${slot.start.getHours().toString().padStart(2, '0')}:${slot.start.getMinutes().toString().padStart(2, '0')}`
      }));
      
      const response: ApiResponse = {
        success: true,
        data: { availableSlots: formattedSlots },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Solicitar una cita
   * @route POST /api/appointment-requests
   */
  requestAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const data = req.body;
      
      const appointment = await this.appointmentRequestService.requestAppointment(data, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Solicitud de cita enviada correctamente',
        data: appointment,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}