"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringAppointmentController = void 0;
const recurring_appointment_service_1 = require("../services/recurring-appointment.service");
const error_handler_1 = require("../../../utils/error-handler");
class RecurringAppointmentController {
    recurringAppointmentService;
    constructor() {
        this.recurringAppointmentService = new recurring_appointment_service_1.RecurringAppointmentService();
    }
    /**
     * Obtener todas las citas recurrentes
     * @route GET /api/recurring-appointments
     */
    getAllRecurringAppointments = async (req, res, next) => {
        try {
            const recurringAppointments = await this.recurringAppointmentService.getAllRecurringAppointments();
            const response = {
                success: true,
                data: recurringAppointments,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener una cita recurrente por ID
     * @route GET /api/recurring-appointments/:id
     */
    getRecurringAppointmentById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cita recurrente inválido');
            }
            const recurringAppointment = await this.recurringAppointmentService.getRecurringAppointmentById(id);
            const response = {
                success: true,
                data: recurringAppointment,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener citas recurrentes por paciente
     * @route GET /api/recurring-appointments/patient/:id
     */
    getRecurringAppointmentsByPatient = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            if (isNaN(patientId)) {
                throw new error_handler_1.BadRequestError('ID de paciente inválido');
            }
            const recurringAppointments = await this.recurringAppointmentService.getRecurringAppointmentsByPatient(patientId);
            const response = {
                success: true,
                data: recurringAppointments,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener citas recurrentes por profesional
     * @route GET /api/recurring-appointments/professional/:id
     */
    getRecurringAppointmentsByProfessional = async (req, res, next) => {
        try {
            const professionalId = parseInt(req.params.id);
            if (isNaN(professionalId)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const recurringAppointments = await this.recurringAppointmentService.getRecurringAppointmentsByProfessional(professionalId);
            const response = {
                success: true,
                data: recurringAppointments,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crear una nueva cita recurrente
     * @route POST /api/recurring-appointments
     */
    createRecurringAppointment = async (req, res, next) => {
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
            const response = {
                success: true,
                message: 'Cita recurrente creada correctamente',
                data: {
                    recurringAppointment: result.recurringAppointment,
                    appointmentsGenerated: result.generatedAppointments.length
                },
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar una cita recurrente
     * @route PUT /api/recurring-appointments/:id
     */
    updateRecurringAppointment = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cita recurrente inválido');
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
            const result = await this.recurringAppointmentService.updateRecurringAppointment(id, data, regenerateAppointments, userId);
            const response = {
                success: true,
                message: 'Cita recurrente actualizada correctamente',
                data: {
                    recurringAppointment: result.recurringAppointment,
                    appointmentsGenerated: result.generatedAppointments ? result.generatedAppointments.length : 0
                },
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Desactivar una cita recurrente
     * @route DELETE /api/recurring-appointments/:id
     */
    deactivateRecurringAppointment = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cita recurrente inválido');
            }
            const { cancelFuture, reason } = req.body;
            const userId = req.user?.id;
            const result = await this.recurringAppointmentService.deactivateRecurringAppointment(id, cancelFuture !== false, // Por defecto, cancelar citas futuras
            reason, userId);
            const response = {
                success: true,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.RecurringAppointmentController = RecurringAppointmentController;
