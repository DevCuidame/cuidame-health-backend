"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentHistoryService = void 0;
// src/modules/appointment/services/appointment-history.service.ts
const database_1 = require("../../../core/config/database");
const appointment_model_1 = require("../../../models/appointment.model");
/**
 * Servicio para gestionar el historial de cambios en citas
 */
class AppointmentHistoryService {
    historyRepository;
    constructor() {
        // Utilizamos el DataSource directamente para acceder a la tabla de historial
        this.historyRepository = database_1.AppDataSource.getRepository('appointment_history');
    }
    /**
     * Registrar un cambio en una cita
     * @param record Datos del cambio a registrar
     * @returns Registro de historial creado
     */
    async recordChange(record) {
        // Completar campos faltantes
        const completeRecord = {
            ...record,
            created_at: new Date()
        };
        // Guardar el registro
        return await this.historyRepository.save(completeRecord);
    }
    /**
     * Registrar la creación de una cita
     * @param appointment Cita creada
     * @param userId ID del usuario que creó la cita
     * @returns Registro de historial
     */
    async recordCreation(appointment, userId) {
        return await this.recordChange({
            appointment_id: appointment.id,
            change_type: 'create',
            new_status: appointment.status,
            new_start_time: appointment.start_time,
            new_end_time: appointment.end_time,
            user_id: userId
        });
    }
    /**
     * Registrar un cambio de estado en una cita
     * @param appointmentId ID de la cita
     * @param previousStatus Estado anterior
     * @param newStatus Nuevo estado
     * @param reason Motivo del cambio
     * @param userId ID del usuario que realizó el cambio
     * @returns Registro de historial
     */
    async recordStatusChange(appointmentId, previousStatus, newStatus, reason, userId) {
        return await this.recordChange({
            appointment_id: appointmentId,
            change_type: 'status_change',
            previous_status: previousStatus,
            new_status: newStatus,
            reason,
            user_id: userId
        });
    }
    /**
     * Registrar una cancelación de cita
     * @param appointmentId ID de la cita
     * @param previousStatus Estado anterior
     * @param reason Motivo de la cancelación
     * @param userId ID del usuario que canceló la cita
     * @returns Registro de historial
     */
    async recordCancellation(appointmentId, previousStatus, reason, userId) {
        return await this.recordChange({
            appointment_id: appointmentId,
            change_type: 'cancel',
            previous_status: previousStatus,
            new_status: appointment_model_1.AppointmentStatus.CANCELLED,
            reason,
            user_id: userId
        });
    }
    /**
     * Registrar una reprogramación de cita
     * @param oldAppointmentId ID de la cita original
     * @param newAppointmentId ID de la nueva cita
     * @param previousStartTime Hora de inicio anterior
     * @param newStartTime Nueva hora de inicio
     * @param previousEndTime Hora de fin anterior
     * @param newEndTime Nueva hora de fin
     * @param reason Motivo de la reprogramación
     * @param userId ID del usuario que reprogramó la cita
     * @returns Registro de historial
     */
    async recordReschedule(oldAppointmentId, newAppointmentId, previousStartTime, newStartTime, previousEndTime, newEndTime, reason, userId) {
        // Registrar la cita original como reprogramada
        await this.recordChange({
            appointment_id: oldAppointmentId,
            change_type: 'reschedule',
            previous_status: appointment_model_1.AppointmentStatus.CONFIRMED, // Asumimos que estaba confirmada
            new_status: appointment_model_1.AppointmentStatus.RESCHEDULED,
            previous_start_time: previousStartTime,
            previous_end_time: previousEndTime,
            reason: `Reprogramada a la cita #${newAppointmentId}. ${reason || ''}`,
            user_id: userId
        });
        // Registrar la creación de la nueva cita
        return await this.recordChange({
            appointment_id: newAppointmentId,
            change_type: 'reschedule',
            new_status: appointment_model_1.AppointmentStatus.REQUESTED, // Nueva cita comienza como solicitada
            new_start_time: newStartTime,
            new_end_time: newEndTime,
            reason: `Reprogramación de la cita #${oldAppointmentId}. ${reason || ''}`,
            user_id: userId
        });
    }
    /**
     * Obtener historial de cambios para una cita
     * @param appointmentId ID de la cita
     * @returns Lista de registros de historial
     */
    async getAppointmentHistory(appointmentId) {
        return await this.historyRepository.find({
            where: { appointment_id: appointmentId },
            order: { created_at: 'DESC' }
        });
    }
    /**
     * Obtener historial de reprogramaciones para una cita
     * @param appointmentId ID de la cita
     * @returns Lista de registros de historial
     */
    async getRescheduleHistory(appointmentId) {
        // Primero buscamos si esta cita es una reprogramación
        const rescheduleRecord = await this.historyRepository.findOne({
            where: {
                appointment_id: appointmentId,
                change_type: 'reschedule'
            }
        });
        if (!rescheduleRecord) {
            return [];
        }
        // Extraer el ID de la cita original del motivo
        const originalIdMatch = rescheduleRecord.reason?.match(/cita #(\d+)/);
        if (!originalIdMatch) {
            return [rescheduleRecord];
        }
        const originalId = parseInt(originalIdMatch[1]);
        // Recursivamente buscar si la cita original también era una reprogramación
        const previousHistory = await this.getRescheduleHistory(originalId);
        // Añadir el registro actual al historial
        return [...previousHistory, rescheduleRecord];
    }
}
exports.AppointmentHistoryService = AppointmentHistoryService;
