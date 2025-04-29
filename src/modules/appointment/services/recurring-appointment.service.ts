// src/modules/appointment/services/recurring-appointment.service.ts
import { RecurringAppointmentRepository } from '../repositories/recurring-appointment.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { RecurringAppointment, RecurrencePattern, RecurrenceEndType } from '../../../models/recurring-appointment.model';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { NotFoundError, BadRequestError } from '../../../utils/error-handler';
import { HealthProfessionalService } from './health-professional.service';
import { AppointmentTypeService } from './appointment-type.service';
import { addDays, addWeeks, addMonths, setDate, getDay, format } from 'date-fns';
import { PatientService } from '@modules/patient/patient.service';
import { MoreThan, Not } from 'typeorm';

export class RecurringAppointmentService {
  private recurringAppointmentRepository: RecurringAppointmentRepository;
  private appointmentRepository: AppointmentRepository;
  private healthProfessionalService: HealthProfessionalService;
  private appointmentTypeService: AppointmentTypeService;
  private patientService: PatientService;

  constructor() {
    this.recurringAppointmentRepository = new RecurringAppointmentRepository();
    this.appointmentRepository = new AppointmentRepository();
    this.healthProfessionalService = new HealthProfessionalService();
    this.appointmentTypeService = new AppointmentTypeService();
    this.patientService = new PatientService();
  }

  /**
   * Obtener todas las citas recurrentes
   */
  async getAllRecurringAppointments(): Promise<RecurringAppointment[]> {
    return await this.recurringAppointmentRepository.findAll({
      relations: [
        'patient',
        'professional',
        'professional.user',
        'appointmentType',
      ],
    });
  }

  /**
   * Obtener una cita recurrente por ID
   */
  async getRecurringAppointmentById(id: number): Promise<RecurringAppointment> {
    const recurringAppointment = await this.recurringAppointmentRepository.findById(id, {
      relations: [
        'patient',
        'professional',
        'professional.user',
        'appointmentType',
        'appointments'
      ],
    });

    if (!recurringAppointment) {
      throw new NotFoundError(`Cita recurrente con ID ${id} no encontrada`);
    }

    return recurringAppointment;
  }

  /**
   * Obtener citas recurrentes por paciente
   */
  async getRecurringAppointmentsByPatient(patientId: number): Promise<RecurringAppointment[]> {
    // Verificar que el paciente existe
    await this.patientService.getPatientById(patientId);

    return await this.recurringAppointmentRepository.findByPatient(patientId);
  }

  /**
   * Obtener citas recurrentes por profesional
   */
  async getRecurringAppointmentsByProfessional(professionalId: number): Promise<RecurringAppointment[]> {
    // Verificar que el profesional existe
    await this.healthProfessionalService.getProfessionalById(professionalId);

    return await this.recurringAppointmentRepository.findByProfessional(professionalId);
  }

  /**
   * Crear una nueva cita recurrente y generar las citas individuales
   */
  async createRecurringAppointment(
    data: Partial<RecurringAppointment>,
    userId?: number
  ): Promise<{ recurringAppointment: RecurringAppointment; generatedAppointments: Appointment[] }> {
    // Verificaciones de datos
    await this.validateRecurringAppointmentData(data);

    // Crear la cita recurrente
    const recurringAppointment = await this.recurringAppointmentRepository.create(data);

    // Generar las citas individuales basadas en el patrón de recurrencia
    const generatedAppointments = await this.generateAppointments(recurringAppointment, userId);

    return { recurringAppointment, generatedAppointments };
  }

  /**
   * Actualizar una cita recurrente
   */
  async updateRecurringAppointment(
    id: number,
    data: Partial<RecurringAppointment>,
    regenerateAppointments: boolean = false,
    userId?: number
  ): Promise<{ recurringAppointment: RecurringAppointment; generatedAppointments?: Appointment[] }> {
    // Verificar que la cita recurrente existe
    const recurringAppointment = await this.getRecurringAppointmentById(id);

    // Guardar información sobre quién modificó la cita recurrente
    if (userId) {
      data.modified_by_id = userId;
    }

    // Actualizar la cita recurrente
    const updatedRecurringAppointment = await this.recurringAppointmentRepository.update(id, data, 'Cita recurrente');

    // Si se solicita regenerar las citas
    if (regenerateAppointments) {
      // Eliminar citas futuras existentes
      await this.deleteFutureAppointments(id);
      
      // Generar nuevas citas basadas en el patrón actualizado
      const generatedAppointments = await this.generateAppointments(updatedRecurringAppointment, userId);
      
      return { recurringAppointment: updatedRecurringAppointment, generatedAppointments };
    }

    return { recurringAppointment: updatedRecurringAppointment };
  }

  /**
   * Desactivar una cita recurrente y cancelar citas futuras
   */
  async deactivateRecurringAppointment(
    id: number,
    cancelFutureAppointments: boolean = true,
    reason?: string,
    userId?: number
  ): Promise<{ success: boolean; message: string }> {
    // Verificar que la cita recurrente existe
    const recurringAppointment = await this.getRecurringAppointmentById(id);

    // Desactivar la cita recurrente
    await this.recurringAppointmentRepository.update(id, { is_active: false }, 'Cita recurrente');

    // Si se solicita cancelar citas futuras
    if (cancelFutureAppointments) {
      await this.cancelFutureAppointments(id, reason, userId);
    }

    return {
      success: true,
      message: 'Cita recurrente desactivada correctamente'
    };
  }

  /**
   * Generar citas individuales basadas en un patrón de recurrencia
   */
  private async generateAppointments(
    recurringAppointment: RecurringAppointment,
    userId?: number
  ): Promise<Appointment[]> {
    const generatedAppointments: Appointment[] = [];
    const now = new Date();
    
    // Determinar la fecha límite para generar citas
    let endDate: Date | null = null;
    let maxOccurrences = 100; // Límite por defecto para evitar bucles infinitos
    
    if (recurringAppointment.end_type === RecurrenceEndType.ON_DATE && recurringAppointment.end_date) {
      endDate = new Date(recurringAppointment.end_date);
    } else if (recurringAppointment.end_type === RecurrenceEndType.AFTER_OCCURRENCES && recurringAppointment.occurrences) {
      maxOccurrences = recurringAppointment.occurrences;
    } else if (recurringAppointment.end_type === RecurrenceEndType.NEVER) {
      // Para "nunca", generamos un número razonable de citas (por ejemplo, 1 año)
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    // Calcular la duración de cada cita en milisegundos
    const appointmentDuration = recurringAppointment.end_time.getTime() - recurringAppointment.start_time.getTime();
    
    // Generar las citas según el patrón de recurrencia
    let currentDate = new Date(recurringAppointment.start_time);
    let count = 0;
    
    while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
      // Verificar si el día actual cumple con el patrón (para recurrencia semanal)
      if (recurringAppointment.recurrence_pattern === RecurrencePattern.WEEKLY && 
          recurringAppointment.days_of_week && 
          recurringAppointment.days_of_week.length > 0) {
        // Si no es uno de los días seleccionados, avanzar al siguiente día
        if (!recurringAppointment.days_of_week.includes(getDay(currentDate))) {
          currentDate = addDays(currentDate, 1);
          continue;
        }
      }
      
      // Crear la cita individual
      const appointmentData: Partial<Appointment> = {
        patient_id: recurringAppointment.patient_id,
        professional_id: recurringAppointment.professional_id,
        appointment_type_id: recurringAppointment.appointment_type_id,
        start_time: new Date(currentDate),
        end_time: new Date(currentDate.getTime() + appointmentDuration),
        status: AppointmentStatus.CONFIRMED,
        notes: recurringAppointment.notes,
        recurring_appointment_id: recurringAppointment.id,
        modified_by_id: userId
      };
      
      // Verificar si hay conflictos con otras citas
      const hasConflict = await this.appointmentRepository.hasConflictingAppointments(
        appointmentData.professional_id as number,
        appointmentData.start_time as Date,
        appointmentData.end_time as Date
      );
      
      // Solo crear la cita si no hay conflictos
      if (!hasConflict) {
        try {
          const appointment = await this.appointmentRepository.create(appointmentData);
          generatedAppointments.push(appointment);
        } catch (error) {
          console.error(`Error al crear cita recurrente para ${format(currentDate, 'yyyy-MM-dd HH:mm')}:`, error);
          // Continuar con la siguiente cita aunque haya error
        }
      }
      
      count++;
      
      // Avanzar a la siguiente fecha según el patrón de recurrencia
      switch (recurringAppointment.recurrence_pattern) {
        case RecurrencePattern.DAILY:
          currentDate = addDays(currentDate, recurringAppointment.recurrence_interval);
          break;
        case RecurrencePattern.WEEKLY:
          // Para patrón semanal con días específicos, avanzar solo un día
          if (recurringAppointment.days_of_week && recurringAppointment.days_of_week.length > 0) {
            currentDate = addDays(currentDate, 1);
          } else {
            currentDate = addWeeks(currentDate, recurringAppointment.recurrence_interval);
          }
          break;
        case RecurrencePattern.BIWEEKLY:
          currentDate = addWeeks(currentDate, 2 * recurringAppointment.recurrence_interval);
          break;
        case RecurrencePattern.MONTHLY:
          if (recurringAppointment.day_of_month) {
            // Si se especificó un día del mes, usar ese día
            currentDate = addMonths(currentDate, recurringAppointment.recurrence_interval);
            currentDate = setDate(currentDate, recurringAppointment.day_of_month);
          } else {
            // Si no, mantener el mismo día
            currentDate = addMonths(currentDate, recurringAppointment.recurrence_interval);
          }
          break;
        default:
          currentDate = addDays(currentDate, recurringAppointment.recurrence_interval);
      }
    }
    
    return generatedAppointments;
  }

  /**
   * Eliminar citas futuras generadas por una recurrencia
   */
  private async deleteFutureAppointments(recurringAppointmentId: number): Promise<void> {
    const now = new Date();
    
    // Buscar todas las citas futuras asociadas a esta recurrencia
    const appointments = await this.appointmentRepository.findAll({
      where: {
        recurring_appointment_id: recurringAppointmentId,
        start_time: MoreThan(now)
      }
    });
    
    // Eliminar cada cita futura
    for (const appointment of appointments) {
      await this.appointmentRepository.update(appointment.id, { status: AppointmentStatus.CANCELLED }, 'Cita');
    }
  }

  /**
   * Cancelar citas futuras generadas por una recurrencia
   */
  private async cancelFutureAppointments(
    recurringAppointmentId: number,
    reason?: string,
    userId?: number
  ): Promise<void> {
    const now = new Date();
    
    // Buscar todas las citas futuras asociadas a esta recurrencia
    const appointments = await this.appointmentRepository.findAll({
      where: {
        recurring_appointment_id: recurringAppointmentId,
        start_time: MoreThan(now),
        status: Not(AppointmentStatus.CANCELLED)
      }
    });
    
    // Cancelar cada cita futura
    for (const appointment of appointments) {
      await this.appointmentRepository.update(
        appointment.id, 
        { 
          status: AppointmentStatus.CANCELLED,
          cancellation_reason: reason || 'Cancelada por desactivación de cita recurrente',
          modified_by_id: userId
        }, 
        'Cita'
      );
    }
  }

  /**
   * Validar datos de una cita recurrente
   */
  private async validateRecurringAppointmentData(data: Partial<RecurringAppointment>): Promise<void> {
    // Verificar datos requeridos
    if (
      !data.patient_id ||
      !data.professional_id ||
      !data.appointment_type_id ||
      !data.start_time ||
      !data.end_time ||
      !data.recurrence_pattern
    ) {
      throw new BadRequestError('Faltan datos requeridos para la cita recurrente');
    }

    // Verificar que el paciente existe
    await this.patientService.getPatientById(data.patient_id);

    // Verificar que el profesional existe
    await this.healthProfessionalService.getProfessionalById(data.professional_id);

    // Verificar que el tipo de cita existe
    await this.appointmentTypeService.getTypeById(data.appointment_type_id);

    // Validar horarios
    if (data.start_time >= data.end_time) {
      throw new BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
    }

    // Validar que la cita no sea en el pasado
    if (data.start_time < new Date()) {
      throw new BadRequestError('No se pueden crear citas recurrentes en el pasado');
    }

    // Validar parámetros específicos según el tipo de recurrencia
    switch (data.recurrence_pattern) {
      case RecurrencePattern.WEEKLY:
        if (!data.days_of_week || data.days_of_week.length === 0) {
          throw new BadRequestError('Para recurrencia semanal, debe seleccionar al menos un día de la semana');
        }
        break;
      case RecurrencePattern.MONTHLY:
        if (!data.day_of_month || data.day_of_month < 1 || data.day_of_month > 31) {
          throw new BadRequestError('Para recurrencia mensual, debe especificar un día del mes válido (1-31)');
        }
        break;
    }

    // Validar tipo de fin de recurrencia
    switch (data.end_type) {
      case RecurrenceEndType.AFTER_OCCURRENCES:
        if (!data.occurrences || data.occurrences < 1) {
          throw new BadRequestError('Debe especificar un número válido de ocurrencias');
        }
        break;
      case RecurrenceEndType.ON_DATE:
        if (!data.end_date) {
          throw new BadRequestError('Debe especificar una fecha de finalización');
        }
        if (data.end_date < data.start_time) {
          throw new BadRequestError('La fecha de finalización debe ser posterior a la fecha de inicio');
        }
        break;
    }
  }
}