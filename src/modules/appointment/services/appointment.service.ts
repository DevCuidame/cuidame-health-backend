// src/modules/appointment/appointment.service.ts
import { AppointmentRepository } from '../repositories/appointment.repository';
import {
  Appointment,
  AppointmentStatus,
} from '../../../models/appointment.model';
import { HealthProfessionalService } from './health-professional.service';
import { AppointmentTypeService } from './appointment-type.service';
import { PatientService } from '../../patient/patient.service';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../../../utils/error-handler';
import { AppointmentType } from '../../../models/appointment-type.model';
import { HealthProfessional } from '../../../models/health-professional.model';

export class AppointmentService {
  private appointmentRepository: AppointmentRepository;
  private healthProfessionalService: HealthProfessionalService;
  private appointmentTypeService: AppointmentTypeService;
  private patientService: PatientService;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.healthProfessionalService = new HealthProfessionalService();
    this.appointmentTypeService = new AppointmentTypeService();
    this.patientService = new PatientService();
  }

  /**
   * Obtener todas las citas
   */
  async getAllAppointments(): Promise<Appointment[]> {
    return await this.appointmentRepository.findAll({
      relations: [
        'patient',
        'professional',
        'professional.user',
        'appointmentType',
      ],
    });
  }

  /**
   * Obtener una cita por ID
   */
  async getAppointmentById(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id, {
      relations: [
        'patient',
        'professional',
        'professional.user',
        'appointmentType',
      ],
    });

    if (!appointment) {
      throw new NotFoundError(`Cita con ID ${id} no encontrada`);
    }

    return appointment;
  }

  /**
   * Obtener citas por paciente
   */
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    // Verificar que el paciente existe
    await this.patientService.getPatientById(patientId);

    return await this.appointmentRepository.findByPatient(patientId);
  }

  /**
   * Obtener citas por profesional
   */
  async getAppointmentsByProfessional(
    professionalId: number
  ): Promise<Appointment[]> {
    // Verificar que el profesional existe
    await this.healthProfessionalService.getProfessionalById(professionalId);

    return await this.appointmentRepository.findByProfessional(professionalId);
  }

  /**
   * Crear una nueva cita
   */
  async createAppointment(
    data: Partial<Appointment>,
    userId?: number
  ): Promise<Appointment> {
    // Verificaciones de datos
    await this.validateAppointmentData(data);

    // Verificar que no haya conflictos de horario
    if (
      await this.appointmentRepository.hasConflictingAppointments(
        data.professional_id as number,
        data.start_time as Date,
        data.end_time as Date
      )
    ) {
      throw new BadRequestError(
        'El profesional ya tiene una cita programada en este horario'
      );
    }

    // Si el estado no se especifica, establecer como "Solicitada"
    if (!data.status) {
      data.status = AppointmentStatus.REQUESTED;
    }

    // Guardar información sobre quién creó/modificó la cita
    if (userId) {
      data.modified_by_id = userId;
    }

    return await this.appointmentRepository.create(data);
  }

  /**
   * Actualizar una cita
   */
  async updateAppointment(
    id: number,
    data: Partial<Appointment>,
    userId?: number
  ): Promise<Appointment> {
    // Verificar que la cita existe
    const appointment = await this.getAppointmentById(id);

    // Si se está cambiando horario o profesional, verificar que no haya conflictos
    if (
      (data.start_time || data.end_time || data.professional_id) &&
      (await this.appointmentRepository.hasConflictingAppointments(
        (data.professional_id as number) || appointment.professional_id,
        (data.start_time as Date) || appointment.start_time,
        (data.end_time as Date) || appointment.end_time,
        id
      ))
    ) {
      throw new BadRequestError(
        'El profesional ya tiene una cita programada en este horario'
      );
    }

    // Guardar información sobre quién modificó la cita
    if (userId) {
      data.modified_by_id = userId;
    }

    return await this.appointmentRepository.update(id, data, 'Cita');
  }

  /**
   * Cambiar el estado de una cita
   */
  async changeAppointmentStatus(
    id: number,
    status: AppointmentStatus,
    reason?: string,
    userId?: number
  ): Promise<Appointment> {
    // Verificar que la cita existe
    const appointment = await this.getAppointmentById(id);

    // Validar cambios de estado
    this.validateStatusChange(appointment.status, status);

    // Actualizar estado
    const updateData: Partial<Appointment> = { status };

    // Si es cancelación, guardar motivo
    if (status === AppointmentStatus.CANCELLED && reason) {
      updateData.cancellation_reason = reason;
    }

    // Guardar información sobre quién modificó la cita
    if (userId) {
      updateData.modified_by_id = userId;
    }

    return await this.appointmentRepository.update(id, updateData, 'Cita');
  }

  // Métodos auxiliares para validación

  /**
   * Validar datos de una cita
   */
  private async validateAppointmentData(
    data: Partial<Appointment>
  ): Promise<void> {
    // Verificar datos requeridos
    if (
      !data.patient_id ||
      !data.professional_id ||
      !data.appointment_type_id ||
      !data.start_time ||
      !data.end_time
    ) {
      throw new BadRequestError('Faltan datos requeridos para la cita');
    }

    // Verificar que el paciente existe
    await this.patientService.getPatientById(data.patient_id);

    // Verificar que el profesional existe
    await this.healthProfessionalService.getProfessionalById(
      data.professional_id
    );

    // Verificar que el tipo de cita existe
    await this.appointmentTypeService.getTypeById(data.appointment_type_id);

    // Validar horarios
    if (data.start_time >= data.end_time) {
      throw new BadRequestError(
        'La hora de inicio debe ser anterior a la hora de fin'
      );
    }

    // Validar que la cita no sea en el pasado
    if (data.start_time < new Date()) {
      throw new BadRequestError('No se pueden crear citas en el pasado');
    }
  }

  /**
   * Validar cambios de estado
   */
  private validateStatusChange(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus
  ): void {
    // Ejemplo de validación de flujo de estados
    // Esto se puede ajustar según las reglas de negocio específicas

    // No se puede cambiar estado de citas canceladas
    if (currentStatus === AppointmentStatus.CANCELLED) {
      throw new BadRequestError(
        'No se puede cambiar el estado de una cita cancelada'
      );
    }

    // No se puede marcar como completada una cita que no está confirmada
    if (
      newStatus === AppointmentStatus.COMPLETED &&
      currentStatus !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestError('Solo se pueden completar citas confirmadas');
    }

    // No se puede confirmar una cita marcada como no-show
    if (
      newStatus === AppointmentStatus.CONFIRMED &&
      currentStatus === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestError(
        'No se puede confirmar una cita marcada como no-show'
      );
    }
  }

  /**
   * Obtener detalles de un tipo de cita
   */
  async getAppointmentTypeDetails(typeId: number): Promise<AppointmentType> {
    return await this.appointmentTypeService.getTypeById(typeId);
  }

  /**
   * Obtener detalles de un profesional
   */
  async getProfessionalDetails(
    professionalId: number
  ): Promise<HealthProfessional> {
    return await this.healthProfessionalService.getProfessionalById(
      professionalId
    );
  }
}
