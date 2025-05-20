"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAppointmentController = void 0;
const admin_appointment_service_1 = require("../services/admin-appointment.service");
const error_handler_1 = require("../../../utils/error-handler");
class AdminAppointmentController {
    adminAppointmentService;
    constructor() {
        this.adminAppointmentService = new admin_appointment_service_1.AdminAppointmentService();
    }
    /**
     * Buscar citas con filtros avanzados
     * @route GET /api/admin/appointments/search
     */
    searchAppointments = async (req, res, next) => {
        try {
            // Parámetros de paginación
            const pagination = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
                sort: req.query.sort || 'start_time',
                order: req.query.order || 'DESC'
            };
            // Filtros de búsqueda
            const filters = {};
            // Procesar filtros desde la query
            if (req.query.professionalId) {
                filters.professionalId = parseInt(req.query.professionalId);
            }
            if (req.query.patientId) {
                filters.patientId = parseInt(req.query.patientId);
            }
            if (req.query.appointmentTypeId) {
                filters.appointmentTypeId = parseInt(req.query.appointmentTypeId);
            }
            if (req.query.status) {
                // Si es un array de estados
                if (Array.isArray(req.query.status)) {
                    filters.status = req.query.status;
                }
                else {
                    filters.status = req.query.status;
                }
            }
            if (req.query.startDate) {
                filters.startDate = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filters.endDate = new Date(req.query.endDate);
            }
            if (req.query.search) {
                filters.searchTerm = req.query.search;
            }
            // Ejecutar búsqueda con paginación
            const result = await this.adminAppointmentService.searchAppointmentsWithPagination(filters, pagination);
            // Construir respuesta
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
     * Procesar citas en masa (aprobar/rechazar)
     * @route POST /api/admin/appointments/bulk-process
     */
    bulkProcessAppointments = async (req, res, next) => {
        try {
            const { appointmentIds, action, reason } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
                throw new error_handler_1.BadRequestError('Debe proporcionar al menos un ID de cita');
            }
            if (!action || (action !== 'confirm' && action !== 'reject')) {
                throw new error_handler_1.BadRequestError('Acción inválida. Debe ser "confirm" o "reject"');
            }
            const result = await this.adminAppointmentService.bulkProcessAppointments(appointmentIds, action, reason, userId);
            const response = {
                success: result.success,
                message: result.message,
                data: {
                    processed: result.processed,
                    failed: result.failed
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
     * Reasignar una cita a otro profesional
     * @route PUT /api/admin/appointments/:id/reassign
     */
    reassignAppointment = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            const { professionalId } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            if (!professionalId || isNaN(parseInt(professionalId))) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const appointment = await this.adminAppointmentService.reassignAppointment(appointmentId, parseInt(professionalId), userId);
            const response = {
                success: true,
                message: 'Cita reasignada correctamente',
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
     * Obtener métricas para el dashboard
     * @route GET /api/admin/appointments/metrics
     */
    getAppointmentMetrics = async (req, res, next) => {
        try {
            let startDate = new Date();
            let endDate = new Date();
            // Por defecto, último mes
            startDate.setMonth(startDate.getMonth() - 1);
            // Procesar fechas si se proporcionan
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate);
            }
            const metrics = await this.adminAppointmentService.getAppointmentMetrics(startDate, endDate);
            const response = {
                success: true,
                data: metrics,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener carga de trabajo de los profesionales
     * @route GET /api/admin/appointments/workload
     */
    getProfessionalWorkload = async (req, res, next) => {
        try {
            let startDate = new Date();
            let endDate = new Date();
            // Por defecto, último mes
            startDate.setMonth(startDate.getMonth() - 1);
            // Procesar fechas si se proporcionan
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate);
            }
            const workload = await this.adminAppointmentService.getProfessionalWorkload(startDate, endDate);
            const response = {
                success: true,
                data: workload,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AdminAppointmentController = AdminAppointmentController;
