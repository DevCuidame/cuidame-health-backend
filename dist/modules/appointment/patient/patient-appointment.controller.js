"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientAppointmentController = void 0;
const error_handler_1 = require("../../../utils/error-handler");
const patient_appointment_service_1 = require("./patient-appointment.service");
class PatientAppointmentController {
    patientAppointmentService;
    constructor() {
        this.patientAppointmentService = new patient_appointment_service_1.PatientAppointmentService();
    }
    /**
     * Obtener próximas citas del paciente
     * @route GET /api/patient/appointments/upcoming
     */
    getUpcomingAppointments = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.patientId || req.user?.id);
            if (isNaN(patientId)) {
                throw new error_handler_1.BadRequestError('ID de paciente inválido');
            }
            // Verificar permisos si se está consultando un paciente diferente al de la sesión
            if (req.params.patientId && parseInt(req.params.patientId) !== req.user?.id) {
                // Aquí se podría implementar una verificación adicional para caretakers
                // que pueden gestionar citas de sus dependientes
                throw new error_handler_1.ForbiddenError('No tienes permiso para ver las citas de este paciente');
            }
            const appointments = await this.patientAppointmentService.getUpcomingAppointments(patientId);
            const response = {
                success: true,
                data: appointments,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    getAllPatientsAppointments = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            // Obtener todas las citas de todos los pacientes a cargo del usuario
            const appointments = await this.patientAppointmentService.getAllPatientsAppointmentsForCaretaker(userId);
            const response = {
                success: true,
                data: appointments,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener citas pasadas del paciente
     * @route GET /api/patient/appointments/past
     */
    getPastAppointments = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.patientId || req.user?.id);
            if (isNaN(patientId)) {
                throw new error_handler_1.BadRequestError('ID de paciente inválido');
            }
            // Verificar permisos si se está consultando un paciente diferente al de la sesión
            if (req.params.patientId && parseInt(req.params.patientId) !== req.user?.id) {
                throw new error_handler_1.ForbiddenError('No tienes permiso para ver las citas de este paciente');
            }
            // Obtener límite de resultados de los query params
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const appointments = await this.patientAppointmentService.getPastAppointments(patientId, limit);
            const response = {
                success: true,
                data: appointments,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener historial completo de citas con paginación y filtros
     * @route GET /api/patient/appointments/history
     */
    getAppointmentHistory = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.patientId || req.user?.id);
            if (isNaN(patientId)) {
                throw new error_handler_1.BadRequestError('ID de paciente inválido');
            }
            // Verificar permisos si se está consultando un paciente diferente al de la sesión
            if (req.params.patientId && parseInt(req.params.patientId) !== req.user?.id) {
                throw new error_handler_1.ForbiddenError('No tienes permiso para ver las citas de este paciente');
            }
            // Parámetros de paginación
            const pagination = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
                sort: req.query.sort || 'start_time',
                order: req.query.order || 'DESC'
            };
            // Filtros
            const filter = {};
            // Procesar estado
            if (req.query.status) {
                if (Array.isArray(req.query.status)) {
                    filter.status = req.query.status;
                }
                else {
                    filter.status = req.query.status;
                }
            }
            // Procesar fechas
            if (req.query.startDate) {
                filter.startDate = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.endDate = new Date(req.query.endDate);
            }
            // Procesar otros filtros
            if (req.query.professionalId) {
                filter.professionalId = parseInt(req.query.professionalId);
            }
            if (req.query.appointmentTypeId) {
                filter.appointmentTypeId = parseInt(req.query.appointmentTypeId);
            }
            const result = await this.patientAppointmentService.getAppointmentHistory(patientId, filter, pagination);
            const response = {
                success: true,
                data: result.items,
                metadata: result.metadata,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Cancelar una cita
     * @route POST /api/patient/appointments/:id/cancel
     */
    cancelAppointment = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            const patientId = req.user?.id;
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            if (!patientId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const { reason, reasonDetails } = req.body;
            // Validar que el motivo sea válido
            if (!reason || !Object.values(patient_appointment_service_1.CancellationReason).includes(reason)) {
                throw new error_handler_1.BadRequestError('Motivo de cancelación inválido');
            }
            const appointment = await this.patientAppointmentService.cancelAppointment(appointmentId, patientId, reason, reasonDetails);
            const response = {
                success: true,
                message: 'Cita cancelada correctamente',
                data: appointment,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Solicitar reprogramación de una cita
     * @route POST /api/patient/appointments/:id/reschedule
     */
    requestReschedule = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            const patientId = req.user?.id;
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            if (!patientId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const { newStartTime, newEndTime, reason } = req.body;
            if (!newStartTime || !newEndTime) {
                throw new error_handler_1.BadRequestError('Debe proporcionar nueva fecha y hora de inicio y fin');
            }
            if (!reason) {
                throw new error_handler_1.BadRequestError('Debe proporcionar un motivo para la reprogramación');
            }
            // Convertir fechas de string a Date si es necesario
            const startTime = typeof newStartTime === 'string' ? new Date(newStartTime) : newStartTime;
            const endTime = typeof newEndTime === 'string' ? new Date(newEndTime) : newEndTime;
            const appointment = await this.patientAppointmentService.requestReschedule(appointmentId, patientId, startTime, endTime, reason);
            const response = {
                success: true,
                message: 'Solicitud de reprogramación enviada correctamente',
                data: appointment,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Confirmar asistencia a una cita
     * @route POST /api/patient/appointments/:id/confirm-attendance
     */
    confirmAttendance = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            const patientId = req.user?.id;
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            if (!patientId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const appointment = await this.patientAppointmentService.confirmAttendance(appointmentId, patientId);
            const response = {
                success: true,
                message: 'Asistencia confirmada correctamente',
                data: appointment,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener detalles de una cita
     * @route GET /api/patient/appointments/:id
     */
    getAppointmentDetails = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            const patientId = req.user?.id;
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            if (!patientId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const appointment = await this.patientAppointmentService.getAppointmentDetails(appointmentId, patientId);
            const response = {
                success: true,
                data: appointment,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.PatientAppointmentController = PatientAppointmentController;
