"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringAppointmentRepository = void 0;
// src/modules/appointment/repositories/recurring-appointment.repository.ts
const typeorm_1 = require("typeorm");
const base_repository_1 = require("../../../core/repositories/base.repository");
const recurring_appointment_model_1 = require("../../../models/recurring-appointment.model");
class RecurringAppointmentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(recurring_appointment_model_1.RecurringAppointment);
    }
    /**
     * Buscar citas recurrentes por paciente
     * @param patientId ID del paciente
     * @returns Lista de citas recurrentes del paciente
     */
    async findByPatient(patientId) {
        return await this.repository.find({
            where: { patient_id: patientId, is_active: true },
            relations: ['professional', 'professional.user', 'appointmentType'],
            order: { created_at: 'DESC' }
        });
    }
    /**
     * Buscar citas recurrentes por profesional
     * @param professionalId ID del profesional
     * @returns Lista de citas recurrentes del profesional
     */
    async findByProfessional(professionalId) {
        return await this.repository.find({
            where: { professional_id: professionalId, is_active: true },
            relations: ['patient', 'appointmentType'],
            order: { created_at: 'DESC' }
        });
    }
    /**
     * Buscar citas recurrentes activas que terminan después de una fecha
     * @param date Fecha de referencia
     * @returns Lista de citas recurrentes activas
     */
    async findActiveRecurrences(date) {
        return await this.repository.find({
            where: [
                { is_active: true, end_type: recurring_appointment_model_1.RecurrenceEndType.NEVER },
                { is_active: true, end_type: recurring_appointment_model_1.RecurrenceEndType.ON_DATE, end_date: (0, typeorm_1.Between)(date, new Date(date.getFullYear() + 10, 0, 1)) },
                { is_active: true, end_type: recurring_appointment_model_1.RecurrenceEndType.AFTER_OCCURRENCES, occurrences: (0, typeorm_1.Between)(1, 1000) }
            ],
            relations: ['patient', 'professional', 'appointmentType']
        });
    }
}
exports.RecurringAppointmentRepository = RecurringAppointmentRepository;
