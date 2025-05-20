"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRequestController = void 0;
const appointment_request_service_1 = require("../services/appointment-request.service");
const availability_service_1 = require("../services/availability.service");
const error_handler_1 = require("../../../utils/error-handler");
class AppointmentRequestController {
    appointmentRequestService;
    availabilityService;
    constructor() {
        this.appointmentRequestService = new appointment_request_service_1.AppointmentRequestService();
        this.availabilityService = new availability_service_1.AvailabilityService();
    }
    /**
     * Consultar días disponibles para un mes
     * @route GET /api/appointment-requests/available-days/:professionalId/:year/:month
     */
    getAvailableDays = async (req, res, next) => {
        try {
            const professionalId = parseInt(req.params.professionalId);
            const year = parseInt(req.params.year);
            const month = parseInt(req.params.month);
            if (isNaN(professionalId) || isNaN(year) || isNaN(month)) {
                throw new error_handler_1.BadRequestError('Parámetros inválidos');
            }
            const availableDays = await this.availabilityService.getAvailableDays(professionalId, year, month);
            const response = {
                success: true,
                data: { availableDays },
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Consultar horarios disponibles para una fecha
     * @route GET /api/appointment-requests/available-slots/:professionalId/:date
     */
    getAvailableTimeSlots = async (req, res, next) => {
        try {
            const professionalId = parseInt(req.params.professionalId);
            const dateStr = req.params.date; // formato: YYYY-MM-DD
            if (isNaN(professionalId) || !dateStr) {
                throw new error_handler_1.BadRequestError('Parámetros inválidos');
            }
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                throw new error_handler_1.BadRequestError('Formato de fecha inválido');
            }
            const availableSlots = await this.availabilityService.getAvailableTimeSlots(professionalId, date);
            // Formatear los slots para la respuesta
            const formattedSlots = availableSlots.map((slot) => ({
                start: slot.start.toISOString(),
                end: slot.end.toISOString(),
                // Formato legible para la UI
                time: `${slot.start.getHours().toString().padStart(2, '0')}:${slot.start.getMinutes().toString().padStart(2, '0')}`
            }));
            const response = {
                success: true,
                data: { availableSlots: formattedSlots },
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Solicitar una cita
     * @route POST /api/appointment-requests
     */
    requestAppointment = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const data = req.body;
            const appointment = await this.appointmentRequestService.requestAppointment(data, userId);
            const response = {
                success: true,
                message: 'Solicitud de cita enviada correctamente',
                data: appointment,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AppointmentRequestController = AppointmentRequestController;
