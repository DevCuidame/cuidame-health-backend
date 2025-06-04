"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
const error_handler_1 = require("../../../utils/error-handler");
const appointment_model_1 = require("../../../models/appointment.model");
class AppointmentController {
    appointmentService;
    constructor() {
        this.appointmentService = new appointment_service_1.AppointmentService();
    }
    /**
     * Obtener todas las citas
     * @route GET /api/appointments
     */
    getAllAppointments = async (req, res, next) => {
        try {
            const appointments = await this.appointmentService.getAllAppointments();
            const response = {
                success: true,
                data: appointments,
                timestamp: new Date().toISOString(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener una cita por ID
     * @route GET /api/appointments/:id
     */
    getAppointmentById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            const appointment = await this.appointmentService.getAppointmentById(id);
            const response = {
                success: true,
                data: appointment,
                timestamp: new Date().toISOString(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener citas por paciente
     * @route GET /api/appointments/patient/:id
     */
    getAppointmentsByPatient = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            if (isNaN(patientId)) {
                throw new error_handler_1.BadRequestError('ID de paciente inválido');
            }
            const appointments = await this.appointmentService.getAppointmentsByPatient(patientId);
            const response = {
                success: true,
                data: appointments,
                timestamp: new Date().toISOString(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener citas por profesional
     * @route GET /api/appointments/professional/:id
     */
    getAppointmentsByProfessional = async (req, res, next) => {
        try {
            const professionalId = parseInt(req.params.id);
            if (isNaN(professionalId)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const appointments = await this.appointmentService.getAppointmentsByProfessional(professionalId);
            const response = {
                success: true,
                data: appointments,
                timestamp: new Date().toISOString(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crear una nueva cita
     * @route POST /api/appointments
     */
    createAppointment = async (req, res, next) => {
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
                if (data.professional.attention_township_name &&
                    data.professional.user &&
                    data.professional.user.first_name) {
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
            const appointment = await this.appointmentService.createAppointment(data, userId);
            const response = {
                success: true,
                message: 'Cita creada correctamente',
                data: appointment,
                timestamp: new Date().toISOString(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar una cita
     * @route PUT /api/appointments/:id
     */
    updateAppointment = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
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
            const appointment = await this.appointmentService.updateAppointment(id, data, userId);
            const response = {
                success: true,
                message: 'Cita actualizada correctamente',
                data: appointment,
                timestamp: new Date().toISOString(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Cambiar el estado de una cita
     * @route PATCH /api/appointments/:id/status
     */
    changeAppointmentStatus = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            const { status, reason } = req.body;
            const userId = req.user?.id;
            // Validar que el estado sea válido
            if (!Object.values(appointment_model_1.AppointmentStatus).includes(status)) {
                throw new error_handler_1.BadRequestError('Estado de cita inválido');
            }
            const appointment = await this.appointmentService.changeAppointmentStatus(id, status, reason, userId);
            const response = {
                success: true,
                message: `Estado de cita actualizado a "${status}"`,
                data: appointment,
                timestamp: new Date().toISOString(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AppointmentController = AppointmentController;
