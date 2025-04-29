// src/modules/appointment/repositories/recurring-appointment.repository.ts
import { Between } from 'typeorm';
import { BaseRepository } from '../../../core/repositories/base.repository';
import { RecurrenceEndType, RecurringAppointment } from '../../../models/recurring-appointment.model';

export class RecurringAppointmentRepository extends BaseRepository<RecurringAppointment> {
  constructor() {
    super(RecurringAppointment);
  }

  /**
   * Buscar citas recurrentes por paciente
   * @param patientId ID del paciente
   * @returns Lista de citas recurrentes del paciente
   */
  async findByPatient(patientId: number): Promise<RecurringAppointment[]> {
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
  async findByProfessional(professionalId: number): Promise<RecurringAppointment[]> {
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
  async findActiveRecurrences(date: Date): Promise<RecurringAppointment[]> {
    return await this.repository.find({
      where: [
        { is_active: true, end_type: RecurrenceEndType.NEVER },
        { is_active: true, end_type: RecurrenceEndType.ON_DATE, end_date: Between(date, new Date(date.getFullYear() + 10, 0, 1)) },
        { is_active: true, end_type: RecurrenceEndType.AFTER_OCCURRENCES, occurrences: Between(1, 1000) }
      ],
      relations: ['patient', 'professional', 'appointmentType']
    });
  }
}