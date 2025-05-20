"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAppointmentService = void 0;
// src/modules/appointment/services/admin-appointment.service.ts
const appointment_service_1 = require("./appointment.service");
const appointment_repository_1 = require("../repositories/appointment.repository");
const appointment_model_1 = require("../../../models/appointment.model");
const notification_service_1 = require("../../notification/notification.service");
const notification_model_1 = require("../../../models/notification.model");
const error_handler_1 = require("../../../utils/error-handler");
const typeorm_1 = require("typeorm");
/**
 * Servicio administrativo para gestión avanzada de citas
 */
class AdminAppointmentService {
    appointmentService;
    appointmentRepository;
    notificationService;
    constructor() {
        this.appointmentService = new appointment_service_1.AppointmentService();
        this.appointmentRepository = new appointment_repository_1.AppointmentRepository();
        this.notificationService = new notification_service_1.NotificationService();
    }
    /**
     * Buscar citas con filtros avanzados y paginación
     * @param filters Filtros de búsqueda
     * @param pagination Parámetros de paginación
     * @returns Resultado paginado de citas
     */
    async searchAppointmentsWithPagination(filters, pagination) {
        const whereOptions = {};
        // Aplicar filtros
        if (filters.professionalId) {
            whereOptions.professional_id = filters.professionalId;
        }
        if (filters.patientId) {
            whereOptions.patient_id = filters.patientId;
        }
        if (filters.appointmentTypeId) {
            whereOptions.appointment_type_id = filters.appointmentTypeId;
        }
        if (filters.status) {
            whereOptions.status = Array.isArray(filters.status)
                ? (0, typeorm_1.In)(filters.status)
                : filters.status;
        }
        if (filters.startDate && filters.endDate) {
            whereOptions.start_time = (0, typeorm_1.Between)(filters.startDate, filters.endDate);
        }
        else if (filters.startDate) {
            // Si solo hay fecha de inicio, buscar citas desde esa fecha
            whereOptions.start_time = (0, typeorm_1.Between)(filters.startDate, new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // +10 años como máximo
            );
        }
        else if (filters.endDate) {
            // Si solo hay fecha de fin, buscar citas hasta esa fecha
            whereOptions.start_time = (0, typeorm_1.Between)(new Date(new Date().setFullYear(new Date().getFullYear() - 10)), // -10 años como mínimo
            filters.endDate);
        }
        return await this.appointmentRepository.findWithPagination(pagination, {
            where: whereOptions,
            relations: ['patient', 'professional', 'professional.user', 'appointmentType']
        });
    }
    /**
     * Obtener métricas de citas para el dashboard
     * @param startDate Fecha de inicio
     * @param endDate Fecha de fin
     * @returns Métricas de citas
     */
    async getAppointmentMetrics(startDate, endDate) {
        // Obtener todas las citas en el rango
        const appointments = await this.appointmentRepository.findByDateRange(startDate, endDate);
        // Calcular métricas
        const metrics = {
            total: appointments.length,
            byStatus: {},
            byType: {},
            byProfessional: {},
            dailyDistribution: {}
        };
        // Conteo por estado
        appointments.forEach(appointment => {
            // Por estado
            if (!metrics.byStatus[appointment.status]) {
                metrics.byStatus[appointment.status] = 0;
            }
            metrics.byStatus[appointment.status]++;
            // Por tipo de cita
            const typeId = appointment.appointment_type_id.toString();
            if (!metrics.byType[typeId]) {
                metrics.byType[typeId] = 0;
            }
            metrics.byType[typeId]++;
            // Por profesional
            const professionalId = appointment.professional_id.toString();
            if (!metrics.byProfessional[professionalId]) {
                metrics.byProfessional[professionalId] = 0;
            }
            metrics.byProfessional[professionalId]++;
            // Distribución diaria
            const dateKey = appointment.start_time.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!metrics.dailyDistribution[dateKey]) {
                metrics.dailyDistribution[dateKey] = 0;
            }
            metrics.dailyDistribution[dateKey]++;
        });
        return metrics;
    }
    /**
     * Procesar aprobación/rechazo en masa de citas
     * @param appointmentIds IDs de las citas a procesar
     * @param action Acción a realizar ('confirm' o 'reject')
     * @param reason Motivo en caso de rechazo
     * @param userId ID del usuario que realiza la acción
     * @returns Resultado de la operación
     */
    async bulkProcessAppointments(appointmentIds, action, reason, userId) {
        let processed = 0;
        let failed = 0;
        // Validar que haya IDs de citas
        if (!appointmentIds || appointmentIds.length === 0) {
            throw new error_handler_1.BadRequestError('No se especificaron citas para procesar');
        }
        // Procesar cada cita
        for (const id of appointmentIds) {
            try {
                const appointment = await this.appointmentRepository.findById(id);
                if (!appointment) {
                    failed++;
                    continue;
                }
                // Solo procesar citas en estado 'solicitada'
                if (appointment.status !== appointment_model_1.AppointmentStatus.REQUESTED) {
                    failed++;
                    continue;
                }
                // Actualizar estado según la acción
                const newStatus = action === 'confirm'
                    ? appointment_model_1.AppointmentStatus.CONFIRMED
                    : appointment_model_1.AppointmentStatus.CANCELLED;
                // Actualizar appointment y enviar notificación
                await this.appointmentService.changeAppointmentStatus(id, newStatus, reason, userId);
                // Enviar notificación al paciente
                const notificationType = action === 'confirm'
                    ? notification_model_1.NotificationType.APPOINTMENT_CONFIRMED
                    : notification_model_1.NotificationType.APPOINTMENT_CANCELLED;
                const title = action === 'confirm'
                    ? 'Cita confirmada'
                    : 'Cita rechazada';
                const message = action === 'confirm'
                    ? `Tu cita para el ${appointment.start_time.toLocaleDateString()} a las ${appointment.start_time.toLocaleTimeString()} ha sido confirmada.`
                    : `Tu cita para el ${appointment.start_time.toLocaleDateString()} a las ${appointment.start_time.toLocaleTimeString()} ha sido rechazada. ${reason ? `Motivo: ${reason}` : ''}`;
                await this.notificationService.createNotification({
                    user_id: appointment.patient_id,
                    appointment_id: appointment.id,
                    type: notificationType,
                    title,
                    message
                });
                processed++;
            }
            catch (error) {
                failed++;
            }
        }
        return {
            success: processed > 0,
            processed,
            failed,
            message: `Proceso completado. ${processed} citas procesadas, ${failed} fallidas.`
        };
    }
    /**
     * Reasignar una cita a otro profesional
     * @param appointmentId ID de la cita
     * @param newProfessionalId ID del nuevo profesional
     * @param userId ID del usuario que realiza la acción
     * @returns Cita actualizada
     */
    async reassignAppointment(appointmentId, newProfessionalId, userId) {
        // Obtener la cita
        const appointment = await this.appointmentService.getAppointmentById(appointmentId);
        // Verificar que la cita no esté en estado completada o cancelada
        if (appointment.status === appointment_model_1.AppointmentStatus.COMPLETED ||
            appointment.status === appointment_model_1.AppointmentStatus.CANCELLED) {
            throw new error_handler_1.BadRequestError('No se puede reasignar una cita que ya ha sido completada o cancelada');
        }
        // Verificar que el nuevo profesional existe y está disponible en ese horario
        // Reutilizamos la lógica de verificación de conflictos
        const hasConflict = await this.appointmentRepository.hasConflictingAppointments(newProfessionalId, appointment.start_time, appointment.end_time);
        if (hasConflict) {
            throw new error_handler_1.BadRequestError('El profesional seleccionado no está disponible en este horario');
        }
        // Actualizar la cita
        const updatedAppointment = await this.appointmentService.updateAppointment(appointmentId, {
            professional_id: newProfessionalId,
            status: appointment_model_1.AppointmentStatus.CONFIRMED, // Al reasignar, confirmamos la cita
            modified_by_id: userId
        }, userId);
        // Notificar al paciente sobre la reasignación
        await this.notificationService.createNotification({
            user_id: appointment.patient_id,
            appointment_id: appointment.id,
            type: notification_model_1.NotificationType.APPOINTMENT_RESCHEDULED,
            title: 'Cita reasignada',
            message: `Tu cita para el ${appointment.start_time.toLocaleDateString()} a las ${appointment.start_time.toLocaleTimeString()} ha sido reasignada a un nuevo profesional.`
        });
        return updatedAppointment;
    }
    /**
     * Obtener la carga de trabajo de los profesionales
     * @param startDate Fecha de inicio
     * @param endDate Fecha de fin
     * @returns Métricas de carga de trabajo por profesional
     */
    async getProfessionalWorkload(startDate, endDate) {
        const appointments = await this.appointmentRepository.findByDateRange(startDate, endDate);
        // Agrupar por profesional
        const workloadByProfessional = {};
        // Procesar citas
        appointments.forEach(appointment => {
            const professionalId = appointment.professional_id;
            // Inicializar si no existe
            if (!workloadByProfessional[professionalId]) {
                const professionalName = appointment.professional?.user?.name
                    ? `${appointment.professional.user.name} ${appointment.professional.user.lastname}`
                    : `Profesional ID ${professionalId}`;
                // workloadByProfessional[professionalId] = {
                //   professionalId,
                //   professionalName,
                //   total: 0,
                //   confirmed: 0,
                //   completed: 0,
                //   cancelled: 0,
                //   noShow: 0,
                //   requested: 0,
                //   averageDuration: 0,
                //   totalHours: 0
                // };
            }
            // Incrementar contadores
            workloadByProfessional[professionalId].total++;
            // Contar por estado
            switch (appointment.status) {
                case appointment_model_1.AppointmentStatus.CONFIRMED:
                    workloadByProfessional[professionalId].confirmed++;
                    break;
                case appointment_model_1.AppointmentStatus.COMPLETED:
                    workloadByProfessional[professionalId].completed++;
                    break;
                case appointment_model_1.AppointmentStatus.CANCELLED:
                    workloadByProfessional[professionalId].cancelled++;
                    break;
                case appointment_model_1.AppointmentStatus.NO_SHOW:
                    workloadByProfessional[professionalId].noShow++;
                    break;
                case appointment_model_1.AppointmentStatus.REQUESTED:
                    workloadByProfessional[professionalId].requested++;
                    break;
            }
            // Calcular duración y horas totales
            if (appointment.end_time && appointment.start_time) {
                const durationMs = appointment.end_time.getTime() - appointment.start_time.getTime();
                const durationMinutes = durationMs / (1000 * 60);
                // Solo contar citas completadas o confirmadas para el promedio
                if (appointment.status === appointment_model_1.AppointmentStatus.COMPLETED ||
                    appointment.status === appointment_model_1.AppointmentStatus.CONFIRMED) {
                    // Actualizar duración promedio
                    const currentTotal = workloadByProfessional[professionalId].averageDuration *
                        (workloadByProfessional[professionalId].completed +
                            workloadByProfessional[professionalId].confirmed - 1);
                    workloadByProfessional[professionalId].averageDuration =
                        (currentTotal + durationMinutes) /
                            (workloadByProfessional[professionalId].completed +
                                workloadByProfessional[professionalId].confirmed);
                    // Añadir al total de horas
                    workloadByProfessional[professionalId].totalHours += durationMinutes / 60;
                }
            }
        });
        // Convertir el objeto a un array para la respuesta
        return Object.values(workloadByProfessional);
    }
}
exports.AdminAppointmentService = AdminAppointmentService;
