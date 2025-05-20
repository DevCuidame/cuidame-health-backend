"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const appointment_repository_1 = require("../repositories/appointment.repository");
const export_util_1 = require("../../../utils/export.util");
const typeorm_1 = require("typeorm");
class ExportController {
    appointmentRepository;
    constructor() {
        this.appointmentRepository = new appointment_repository_1.AppointmentRepository();
    }
    /**
     * Exportar citas a CSV
     * @route GET /api/admin/export/appointments/csv
     */
    exportAppointmentsToCSV = async (req, res, next) => {
        try {
            // Construir filtros basados en los parámetros de consulta
            const whereOptions = {};
            // Filtrar por profesional
            if (req.query.professionalId) {
                whereOptions.professional_id = parseInt(req.query.professionalId);
            }
            // Filtrar por paciente
            if (req.query.patientId) {
                whereOptions.patient_id = parseInt(req.query.patientId);
            }
            // Filtrar por tipo de cita
            if (req.query.appointmentTypeId) {
                whereOptions.appointment_type_id = parseInt(req.query.appointmentTypeId);
            }
            // Filtrar por estado
            if (req.query.status) {
                if (Array.isArray(req.query.status)) {
                    whereOptions.status = (0, typeorm_1.In)(req.query.status);
                }
                else {
                    whereOptions.status = req.query.status;
                }
            }
            // Filtrar por rango de fechas
            if (req.query.startDate && req.query.endDate) {
                whereOptions.start_time = (0, typeorm_1.Between)(new Date(req.query.startDate), new Date(req.query.endDate));
            }
            else if (req.query.startDate) {
                const endDate = new Date();
                endDate.setFullYear(endDate.getFullYear() + 1); // Por defecto, un año desde la fecha de inicio
                whereOptions.start_time = (0, typeorm_1.Between)(new Date(req.query.startDate), endDate);
            }
            else if (req.query.endDate) {
                const startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1); // Por defecto, un año antes de la fecha de fin
                whereOptions.start_time = (0, typeorm_1.Between)(startDate, new Date(req.query.endDate));
            }
            // Buscar citas que coincidan con los filtros
            const appointments = await this.appointmentRepository.findAll({
                where: whereOptions,
                relations: ['patient', 'professional', 'professional.user', 'appointmentType'],
                order: { start_time: 'DESC' }
            });
            // Generar CSV
            const csv = export_util_1.ExportUtils.appointmentsToCSV(appointments);
            // Configurar encabezados para descarga
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=citas.csv');
            // Enviar respuesta
            res.status(200).send(csv);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Exportar citas a JSON
     * @route GET /api/admin/export/appointments/json
     */
    exportAppointmentsToJSON = async (req, res, next) => {
        try {
            // Construir filtros basados en los parámetros de consulta
            const whereOptions = {};
            // Filtrar por profesional
            if (req.query.professionalId) {
                whereOptions.professional_id = parseInt(req.query.professionalId);
            }
            // Filtrar por paciente
            if (req.query.patientId) {
                whereOptions.patient_id = parseInt(req.query.patientId);
            }
            // Filtrar por tipo de cita
            if (req.query.appointmentTypeId) {
                whereOptions.appointment_type_id = parseInt(req.query.appointmentTypeId);
            }
            // Filtrar por estado
            if (req.query.status) {
                if (Array.isArray(req.query.status)) {
                    whereOptions.status = (0, typeorm_1.In)(req.query.status);
                }
                else {
                    whereOptions.status = req.query.status;
                }
            }
            // Filtrar por rango de fechas
            if (req.query.startDate && req.query.endDate) {
                whereOptions.start_time = (0, typeorm_1.Between)(new Date(req.query.startDate), new Date(req.query.endDate));
            }
            else if (req.query.startDate) {
                const endDate = new Date();
                endDate.setFullYear(endDate.getFullYear() + 1);
                whereOptions.start_time = (0, typeorm_1.Between)(new Date(req.query.startDate), endDate);
            }
            else if (req.query.endDate) {
                const startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                whereOptions.start_time = (0, typeorm_1.Between)(startDate, new Date(req.query.endDate));
            }
            // Buscar citas que coincidan con los filtros
            const appointments = await this.appointmentRepository.findAll({
                where: whereOptions,
                relations: ['patient', 'professional', 'professional.user', 'appointmentType'],
                order: { start_time: 'DESC' }
            });
            // Generar JSON
            const json = export_util_1.ExportUtils.appointmentsToJSON(appointments);
            // Configurar encabezados para descarga
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=citas.json');
            // Enviar respuesta
            res.status(200).send(json);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Exportar resumen de citas
     * @route GET /api/admin/export/appointments/summary
     */
    exportAppointmentsSummary = async (req, res, next) => {
        try {
            // Construir filtros basados en los parámetros de consulta
            const whereOptions = {};
            // Filtrar por profesional
            if (req.query.professionalId) {
                whereOptions.professional_id = parseInt(req.query.professionalId);
            }
            // Filtrar por rango de fechas
            if (req.query.startDate && req.query.endDate) {
                whereOptions.start_time = (0, typeorm_1.Between)(new Date(req.query.startDate), new Date(req.query.endDate));
            }
            else {
                // Por defecto, último mes
                const endDate = new Date();
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                whereOptions.start_time = (0, typeorm_1.Between)(startDate, endDate);
            }
            // Buscar citas que coincidan con los filtros
            const appointments = await this.appointmentRepository.findAll({
                where: whereOptions,
                relations: ['patient', 'professional', 'professional.user', 'appointmentType'],
                order: { start_time: 'DESC' }
            });
            // Generar resumen
            const summary = export_util_1.ExportUtils.generateAppointmentSummary(appointments);
            // Configurar encabezados para descarga
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', 'attachment; filename=resumen_citas.txt');
            // Enviar respuesta
            res.status(200).send(summary);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ExportController = ExportController;
