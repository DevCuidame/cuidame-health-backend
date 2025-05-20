// src/modules/appointment/services/patient-appointment.service.ts
import { AppointmentRepository } from '../repositories/appointment.repository';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { NotificationService } from '../../notification/notification.service';
import { NotificationType } from '../../../models/notification.model';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../utils/error-handler';
import { Between, FindOptionsWhere, In, LessThan, MoreThan, Repository } from 'typeorm';
import { PaginatedResult, PaginationParams } from '../../../core/interfaces/response.interface';
import { AppointmentService } from '../services/appointment.service';
import { Patient } from '../../../models/patient.model';
import { PatientRepository } from '../../../modules/patient/patient.repository';

/**
 * Tipos de motivos para cancelación
 */
export enum CancellationReason {
  PERSONAL = 'personal',
  MEDICAL = 'medical',
  SCHEDULE_CONFLICT = 'schedule_conflict',
  TRANSPORTATION = 'transportation',
  OTHER = 'other'
}

/**
 * Interfaz para filtros de historial de citas
 */
export interface AppointmentHistoryFilter {
  status?: AppointmentStatus | AppointmentStatus[];
  startDate?: Date;
  endDate?: Date;
  appointmentTypeId?: number;
  professionalId?: number;
}

/**
 * Servicio especializado para operaciones de citas desde la perspectiva del paciente
 */
export class PatientAppointmentService {
  private appointmentRepository: AppointmentRepository;
  private appointmentService: AppointmentService;
  private notificationService: NotificationService;
  private patientRepository: PatientRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.appointmentService = new AppointmentService();
    this.notificationService = new NotificationService();
    this.patientRepository = new PatientRepository();
  
  }

  /**
   * Obtener citas próximas para un paciente
   * @param patientId ID del paciente
   * @returns Lista de citas próximas
   */
  async getUpcomingAppointments(patientId: number): Promise<Appointment[]> {
    const now = new Date();
    
    return await this.appointmentRepository.findAll({
      where: {
        patient_id: patientId,
        start_time: MoreThan(now),
        status: In([AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED])
      },
      relations: ['professional', 'professional.user', 'appointmentType'],
      order: { start_time: 'ASC' }
    });
  }

  
   /**
   * Verifica si un paciente está a cargo de un usuario específico
   */
   async isPatientUnderUserCare(userId: number, patientId: number): Promise<boolean> {
    const patient = await this.patientRepository.findOneByOptions({
      where: {
        id: patientId,
        a_cargo_id: userId
      }
    });
    
    return !!patient; // Devuelve true si el paciente está a cargo del usuario, false en caso contrario
  }

  /**
   * Obtiene todos los pacientes a cargo de un usuario específico
   */
  async getPatientsUnderUserCare(userId: number): Promise<Patient[]> {
    return await this.patientRepository.findAll({
      where: {
        a_cargo_id: userId
      }
    });
  }


   /**
   * Obtiene todas las citas de todos los pacientes a cargo de un usuario
   */
   async getAllPatientsAppointmentsForCaretaker(userId: number): Promise<Appointment[]> {
    const patients = await this.getPatientsUnderUserCare(userId);
    const patientIds = patients.map(patient => patient.id);
    
    // Si no hay pacientes a cargo, devolvemos un array vacío
    if (patientIds.length === 0) {
      return [];
    }
    
    // Obtenemos todas las citas para esos pacientes
    return await this.appointmentRepository.findAll({
      where: {
        patient_id: In(patientIds),
      },
      relations: ['professional', 'professional.user', 'appointmentType', 'patient'],
      order: { start_time: 'DESC' } 
    });
  }

  /**
   * Obtener citas pasadas para un paciente
   * @param patientId ID del paciente
   * @param limit Límite de resultados
   * @returns Lista de citas pasadas
   */
  async getPastAppointments(patientId: number, limit: number = 5): Promise<Appointment[]> {
    const now = new Date();
    
    return await this.appointmentRepository.findAll({
      where: {
        patient_id: patientId,
        start_time: LessThan(now)
      },
      relations: ['professional', 'professional.user', 'appointmentType'],
      order: { start_time: 'DESC' },
      take: limit
    });
  }

  /**
   * Obtener historial completo de citas con paginación y filtros
   * @param patientId ID del paciente
   * @param filter Filtros para la búsqueda
   * @param pagination Parámetros de paginación
   * @returns Resultado paginado de citas
   */
  async getAppointmentHistory(
    patientId: number,
    filter: AppointmentHistoryFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Appointment>> {
    const whereOptions: FindOptionsWhere<Appointment> = {
      patient_id: patientId
    };
    
    // Aplicar filtros
    if (filter.status) {
      whereOptions.status = Array.isArray(filter.status) 
        ? In(filter.status) 
        : filter.status;
    }
    
    if (filter.professionalId) {
      whereOptions.professional_id = filter.professionalId;
    }
    
    if (filter.appointmentTypeId) {
      whereOptions.appointment_type_id = filter.appointmentTypeId;
    }
    
    // Filtrar por rango de fechas
    if (filter.startDate && filter.endDate) {
      whereOptions.start_time = Between(filter.startDate, filter.endDate);
    } else if (filter.startDate) {
      whereOptions.start_time = MoreThan(filter.startDate);
    } else if (filter.endDate) {
      whereOptions.start_time = LessThan(filter.endDate);
    }
    
    return await this.appointmentRepository.findWithPagination(
      pagination,
      {
        where: whereOptions,
        relations: ['professional', 'professional.user', 'appointmentType'],
        order: { start_time: pagination.order === 'ASC' ? 'ASC' : 'DESC' }
      }
    );
  }

  /**
   * Cancelar una cita desde la perspectiva del paciente
   * @param appointmentId ID de la cita
   * @param patientId ID del paciente
   * @param reason Motivo de cancelación
   * @param reasonDetails Detalles adicionales sobre la cancelación
   * @returns Cita cancelada
   */
  async cancelAppointment(
    appointmentId: number,
    patientId: number,
    reason: CancellationReason,
    reasonDetails?: string
  ): Promise<Appointment> {
    // Verificar que la cita existe
    const appointment = await this.appointmentService.getAppointmentById(appointmentId);
    
    // Verificar que la cita pertenece al paciente
    if (appointment.patient_id !== patientId) {
      throw new ForbiddenError('No tienes permiso para cancelar esta cita');
    }
    
    // Verificar que la cita pueda ser cancelada
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestError(`No se puede cancelar una cita con estado ${appointment.status}`);
    }
    
    // Verificar que la cancelación se haga con al menos 24 horas de anticipación
    const now = new Date();
    const appointmentTime = new Date(appointment.start_time!);
    const hoursDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let lateCancellation = false;
    if (hoursDifference < 24) {
      // Permitir la cancelación tardía, pero registrarla como tal
      lateCancellation = true;
    }
    
    // Construir mensaje de cancelación
    let cancellationMessage = '';
    switch (reason) {
      case CancellationReason.PERSONAL:
        cancellationMessage = 'Motivo personal';
        break;
      case CancellationReason.MEDICAL:
        cancellationMessage = 'Motivo médico';
        break;
      case CancellationReason.SCHEDULE_CONFLICT:
        cancellationMessage = 'Conflicto de horario';
        break;
      case CancellationReason.TRANSPORTATION:
        cancellationMessage = 'Problemas de transporte';
        break;
      case CancellationReason.OTHER:
        cancellationMessage = 'Otro motivo';
        break;
    }
    
    if (reasonDetails) {
      cancellationMessage += `: ${reasonDetails}`;
    }
    
    if (lateCancellation) {
      cancellationMessage += ' [Cancelación tardía]';
    }
    
    // Actualizar la cita
    const updatedAppointment = await this.appointmentService.changeAppointmentStatus(
      appointmentId,
      AppointmentStatus.CANCELLED,
      cancellationMessage,
      patientId // Usando patientId como modified_by_id
    );
    
    // Enviar notificación al profesional
    await this.notificationService.createNotification({
      user_id: appointment.professional_id!,
      appointment_id: appointment.id,
      type: NotificationType.APPOINTMENT_CANCELLED,
      title: 'Cita cancelada',
      message: `La cita del ${appointment.start_time!.toLocaleDateString()} a las ${appointment.start_time!.toLocaleTimeString()} ha sido cancelada por el paciente. Motivo: ${cancellationMessage}`
    });
    
    return updatedAppointment;
  }

  /**
   * Solicitar reprogramación de una cita
   * @param appointmentId ID de la cita a reprogramar
   * @param patientId ID del paciente
   * @param newStartTime Nueva fecha y hora de inicio
   * @param newEndTime Nueva fecha y hora de fin
   * @param reason Motivo de la reprogramación
   * @returns Cita reprogramada
   */
  async requestReschedule(
    appointmentId: number,
    patientId: number,
    newStartTime: Date,
    newEndTime: Date,
    reason: string
  ): Promise<Appointment> {
    // Verificar que la cita existe
    const appointment = await this.appointmentService.getAppointmentById(appointmentId);
    
    // Verificar que la cita pertenece al paciente
    if (appointment.patient_id !== patientId) {
      throw new ForbiddenError('No tienes permiso para reprogramar esta cita');
    }
    
    // Verificar que la cita pueda ser reprogramada
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestError(`No se puede reprogramar una cita con estado ${appointment.status}`);
    }
    
    // Verificar que la nueva fecha/hora sea futura
    const now = new Date();
    if (newStartTime <= now) {
      throw new BadRequestError('La nueva fecha y hora debe ser futura');
    }
    
    // Verificar que la hora de inicio sea anterior a la hora de fin
    if (newStartTime >= newEndTime) {
      throw new BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
    }
    
    // Crear una nueva cita basada en la anterior, pero con estado REQUESTED
    const rescheduleData = {
      patient_id: appointment.patient_id,
      professional_id: appointment.professional_id,
      appointment_type_id: appointment.appointment_type_id,
      start_time: newStartTime,
      end_time: newEndTime,
      status: AppointmentStatus.REQUESTED,
      notes: appointment.notes,
      modified_by_id: patientId
    };
    
    // Guardar la nueva cita
    const newAppointment = await this.appointmentService.createAppointment(rescheduleData, patientId);
    
    // Actualizar notas en la nueva cita para indicar que es una reprogramación
    const reprogrammingNote = `Reprogramación de cita #${appointmentId}. Motivo: ${reason}`;
    await this.appointmentRepository.update(
      newAppointment.id, 
      { notes: reprogrammingNote },
      'Cita'
    );
    
    // Cancelar la cita original
    await this.appointmentService.changeAppointmentStatus(
      appointmentId,
      AppointmentStatus.RESCHEDULED,
      `Reprogramada a la cita #${newAppointment.id}. Motivo: ${reason}`,
      patientId
    );
    
    // Enviar notificación al profesional
    await this.notificationService.createNotification({
      user_id: appointment.professional_id!,
      appointment_id: newAppointment.id,
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      title: 'Solicitud de reprogramación de cita',
      message: `El paciente ha solicitado reprogramar la cita del ${appointment.start_time!.toLocaleDateString()} al ${newStartTime.toLocaleDateString()} a las ${newStartTime.toLocaleTimeString()}. Motivo: ${reason}`
    });
    
    // Obtener la cita actualizada con todas las relaciones
    return await this.appointmentService.getAppointmentById(newAppointment.id);
  }

  /**
   * Confirmar asistencia a una cita
   * @param appointmentId ID de la cita
   * @param patientId ID del paciente
   * @returns Cita confirmada
   */
  async confirmAttendance(
    appointmentId: number,
    patientId: number
  ): Promise<Appointment> {
    // Verificar que la cita existe
    const appointment = await this.appointmentService.getAppointmentById(appointmentId);
    
    // Verificar que la cita pertenece al paciente
    if (appointment.patient_id !== patientId) {
      throw new ForbiddenError('No tienes permiso para confirmar esta cita');
    }
    
    // Verificar que la cita pueda ser confirmada
    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.REQUESTED
    ) {
      throw new BadRequestError(`No se puede confirmar una cita con estado ${appointment.status}`);
    }
    
    // No necesitamos cambiar el estado, pero añadimos una nota
    const updatedAppointment = await this.appointmentRepository.update(
      appointmentId,
      { 
        notes: appointment.notes 
          ? `${appointment.notes}\nAsistencia confirmada por el paciente el ${new Date().toLocaleString()}`
          : `Asistencia confirmada por el paciente el ${new Date().toLocaleString()}` 
      },
      'Cita'
    );
    
    // Enviar notificación al profesional
    await this.notificationService.createNotification({
      user_id: appointment.professional_id!,
      appointment_id: appointment.id,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      title: 'Asistencia confirmada por el paciente',
      message: `El paciente ha confirmado su asistencia a la cita del ${appointment.start_time!.toLocaleDateString()} a las ${appointment.start_time!.toLocaleTimeString()}.`
    });
    
    return updatedAppointment;
  }

  /**
   * Obtener detalles de una cita específica
   * @param appointmentId ID de la cita
   * @param patientId ID del paciente
   * @returns Detalles completos de la cita
   */
  async getAppointmentDetails(
    appointmentId: number,
    patientId: number
  ): Promise<Appointment> {
    // Obtener la cita con todas sus relaciones
    const appointment = await this.appointmentService.getAppointmentById(appointmentId);
    
    // Verificar que la cita pertenece al paciente
    if (appointment.patient_id !== patientId) {
      throw new ForbiddenError('No tienes permiso para ver los detalles de esta cita');
    }
    
    return appointment;
  }
}