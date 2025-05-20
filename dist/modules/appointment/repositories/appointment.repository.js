"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRepository = void 0;
// src/modules/appointment/appointment.repository.ts
const base_repository_1 = require("../../../core/repositories/base.repository");
const appointment_model_1 = require("../../../models/appointment.model");
const typeorm_1 = require("typeorm");
class AppointmentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(appointment_model_1.Appointment);
    }
    /**
     * Buscar citas por paciente
     * @param patientId ID del paciente
     * @returns Lista de citas del paciente
     */
    async findByPatient(patientId) {
        return await this.repository.find({
            where: { patient_id: patientId },
            relations: ['professional', 'professional.user', 'appointmentType'],
            order: { start_time: 'DESC' }
        });
    }
    /**
     * Buscar citas por profesional
     * @param professionalId ID del profesional
     * @returns Lista de citas del profesional
     */
    async findByProfessional(professionalId) {
        return await this.repository.find({
            where: { professional_id: professionalId },
            relations: ['patient', 'appointmentType'],
            order: { start_time: 'DESC' }
        });
    }
    /**
     * Buscar citas por rango de fechas
     * @param startDate Fecha inicial
     * @param endDate Fecha final
     * @returns Lista de citas en el rango
     */
    async findByDateRange(startDate, endDate) {
        return await this.repository.find({
            where: {
                start_time: (0, typeorm_1.Between)(startDate, endDate)
            },
            relations: ['patient', 'professional', 'professional.user', 'appointmentType'],
            order: { start_time: 'ASC' }
        });
    }
    /**
     * Verificar si hay citas existentes en un horario específico para un profesional
     * @param professionalId ID del profesional
     * @param startTime Hora de inicio
     * @param endTime Hora de fin
     * @param excludeAppointmentId ID de cita a excluir (para actualizaciones)
     * @returns true si hay conflicto, false si está disponible
     */
    async hasConflictingAppointments(professionalId, startTime, endTime, excludeAppointmentId) {
        const query = this.repository.createQueryBuilder('appointment')
            .where('appointment.professional_id = :professionalId', { professionalId })
            .andWhere('appointment.status NOT IN (:...nonConflictingStatuses)', {
            nonConflictingStatuses: [appointment_model_1.AppointmentStatus.CANCELLED, appointment_model_1.AppointmentStatus.NO_SHOW]
        })
            .andWhere('(appointment.start_time < :endTime AND appointment.end_time > :startTime)', { startTime, endTime });
        if (excludeAppointmentId) {
            query.andWhere('appointment.id != :excludeAppointmentId', { excludeAppointmentId });
        }
        const count = await query.getCount();
        return count > 0;
    }
    /**
     * Obtener próximas citas de un paciente
     * @param patientId ID del paciente
     * @returns Lista de próximas citas
     */
    async getUpcomingAppointments(patientId) {
        const now = new Date();
        return await this.repository.find({
            where: {
                patient_id: patientId,
                start_time: (0, typeorm_1.MoreThanOrEqual)(now),
                status: appointment_model_1.AppointmentStatus.CONFIRMED
            },
            relations: ['professional', 'professional.user', 'appointmentType'],
            order: { start_time: 'ASC' }
        });
    }
}
exports.AppointmentRepository = AppointmentRepository;
