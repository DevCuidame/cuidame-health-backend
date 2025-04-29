// src/modules/appointment/appointment.repository.ts
import { BaseRepository } from '../../../core/repositories/base.repository';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export class AppointmentRepository extends BaseRepository<Appointment> {
  constructor() {
    super(Appointment);
  }

  /**
   * Buscar citas por paciente
   * @param patientId ID del paciente
   * @returns Lista de citas del paciente
   */
  async findByPatient(patientId: number): Promise<Appointment[]> {
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
  async findByProfessional(professionalId: number): Promise<Appointment[]> {
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
  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return await this.repository.find({
      where: {
        start_time: Between(startDate, endDate)
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
  async hasConflictingAppointments(
    professionalId: number,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: number
  ): Promise<boolean> {
    const query = this.repository.createQueryBuilder('appointment')
      .where('appointment.professional_id = :professionalId', { professionalId })
      .andWhere('appointment.status NOT IN (:...nonConflictingStatuses)', { 
        nonConflictingStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] 
      })
      .andWhere(
        '(appointment.start_time < :endTime AND appointment.end_time > :startTime)',
        { startTime, endTime }
      );

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
  async getUpcomingAppointments(patientId: number): Promise<Appointment[]> {
    const now = new Date();
    
    return await this.repository.find({
      where: {
        patient_id: patientId,
        start_time: MoreThanOrEqual(now),
        status: AppointmentStatus.CONFIRMED
      },
      relations: ['professional', 'professional.user', 'appointmentType'],
      order: { start_time: 'ASC' }
    });
  }
}