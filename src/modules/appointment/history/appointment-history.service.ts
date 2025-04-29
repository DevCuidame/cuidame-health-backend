// src/modules/appointment/services/appointment-history.service.ts
import { AppDataSource } from '../../../core/config/database';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';

/**
 * Interfaz para representar un registro de historial de cambios en una cita
 */
interface AppointmentHistoryRecord {
  id?: number;
  appointment_id: number;
  change_type: 'create' | 'update' | 'cancel' | 'reschedule' | 'status_change';
  previous_status?: AppointmentStatus;
  new_status?: AppointmentStatus;
  previous_start_time?: Date;
  new_start_time?: Date;
  previous_end_time?: Date;
  new_end_time?: Date;
  reason?: string;
  user_id?: number;
  created_at?: Date;
}

/**
 * Servicio para gestionar el historial de cambios en citas
 */
export class AppointmentHistoryService {
  private historyRepository: any;

  constructor() {
    // Utilizamos el DataSource directamente para acceder a la tabla de historial
    this.historyRepository = AppDataSource.getRepository('appointment_history');
  }

  /**
   * Registrar un cambio en una cita
   * @param record Datos del cambio a registrar
   * @returns Registro de historial creado
   */
  async recordChange(record: AppointmentHistoryRecord): Promise<any> {
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
  async recordCreation(appointment: Appointment, userId?: number): Promise<any> {
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
  async recordStatusChange(
    appointmentId: number,
    previousStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
    reason?: string,
    userId?: number
  ): Promise<any> {
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
  async recordCancellation(
    appointmentId: number,
    previousStatus: AppointmentStatus,
    reason?: string,
    userId?: number
  ): Promise<any> {
    return await this.recordChange({
      appointment_id: appointmentId,
      change_type: 'cancel',
      previous_status: previousStatus,
      new_status: AppointmentStatus.CANCELLED,
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
  async recordReschedule(
    oldAppointmentId: number,
    newAppointmentId: number,
    previousStartTime: Date,
    newStartTime: Date,
    previousEndTime: Date,
    newEndTime: Date,
    reason?: string,
    userId?: number
  ): Promise<any> {
    // Registrar la cita original como reprogramada
    await this.recordChange({
      appointment_id: oldAppointmentId,
      change_type: 'reschedule',
      previous_status: AppointmentStatus.CONFIRMED, // Asumimos que estaba confirmada
      new_status: AppointmentStatus.RESCHEDULED,
      previous_start_time: previousStartTime,
      previous_end_time: previousEndTime,
      reason: `Reprogramada a la cita #${newAppointmentId}. ${reason || ''}`,
      user_id: userId
    });
    
    // Registrar la creación de la nueva cita
    return await this.recordChange({
      appointment_id: newAppointmentId,
      change_type: 'reschedule',
      new_status: AppointmentStatus.REQUESTED, // Nueva cita comienza como solicitada
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
  async getAppointmentHistory(appointmentId: number): Promise<any[]> {
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
  async getRescheduleHistory(appointmentId: number): Promise<any[]> {
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