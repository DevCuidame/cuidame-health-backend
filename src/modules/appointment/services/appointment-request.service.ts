// src/modules/appointment/appointment-request.service.ts
import { NotificationService } from '../../../modules/notification/notification.service';
import { AppointmentService } from './appointment.service';
import { AvailabilityService } from './availability.service';
import { BadRequestError } from '../../../utils/error-handler';
import { AppointmentStatus } from '../../../models/appointment.model';
import { NotificationType } from '../../../models/notification.model';

export class AppointmentRequestService {
  private appointmentService: AppointmentService;
  private availabilityService: AvailabilityService;
  private notificationService: NotificationService;

  constructor() {
    this.appointmentService = new AppointmentService();
    this.availabilityService = new AvailabilityService();
    this.notificationService = new NotificationService();
  }

  /**
   * Verificar disponibilidad y solicitar una cita
   * @param data Datos de la solicitud de cita
   * @param userId ID del usuario que solicita la cita
   */
  async requestAppointment(data: {
    patient_id: number;
    professional_id: number;
    appointment_type_id: number;
    date: string;
    time: string;
    notes?: string;
  }, userId: number) {
    // 1. Validar la entrada de datos
    if (!data.patient_id || !data.professional_id || !data.appointment_type_id || !data.date || !data.time) {
      throw new BadRequestError('Faltan datos requeridos para la solicitud de cita');
    }

    // 2. Convertir fecha y hora a objetos Date
    const [year, month, day] = data.date.split('-').map(Number);
    const [hour, minute] = data.time.split(':').map(Number);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      throw new BadRequestError('Formato de fecha u hora inválido');
    }
    
    const startTime = new Date(year, month - 1, day, hour, minute);
    
    // 3. Obtener información del tipo de cita para determinar duración
    const appointmentType = await this.appointmentService.getAppointmentTypeDetails(data.appointment_type_id);
    const duration = appointmentType.default_duration || 30; // minutos
    
    // 4. Calcular hora de finalización
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    // 5. Verificar disponibilidad
    const isAvailable = await this.checkAvailability(
      data.professional_id,
      startTime,
      endTime
    );
    
    if (!isAvailable) {
      throw new BadRequestError('El horario seleccionado no está disponible');
    }
    
    // 6. Crear la cita con estado "Solicitada"
    const appointment = await this.appointmentService.createAppointment({
      patient_id: data.patient_id,
      professional_id: data.professional_id,
      appointment_type_id: data.appointment_type_id,
      start_time: startTime,
      end_time: endTime,
      status: AppointmentStatus.REQUESTED,
      notes: data.notes,
      modified_by_id: userId
    });
    
    // 7. Enviar notificaciones
    try {
      // Notificar al paciente
      await this.notificationService.createNotification({
        user_id: userId,
        appointment_id: appointment.id,
        type: NotificationType.APPOINTMENT_CREATED,
        title: 'Solicitud de cita recibida',
        message: `Tu solicitud para una cita el ${startTime.toLocaleDateString()} a las ${startTime.toLocaleTimeString()} ha sido recibida y está pendiente de confirmación.`
      });
      
      // Notificar al profesional o administrador
      const professional = await this.appointmentService.getProfessionalDetails(data.professional_id);
      await this.notificationService.createNotification({
        user_id: professional.user_id,
        appointment_id: appointment.id,
        type: NotificationType.APPOINTMENT_CREATED,
        title: 'Nueva solicitud de cita',
        message: `Has recibido una nueva solicitud de cita para el ${startTime.toLocaleDateString()} a las ${startTime.toLocaleTimeString()}.`
      });
    } catch (error) {
      console.error('Error al enviar notificaciones:', error);
      // Continuamos con la creación de la cita aunque falle el envío de notificaciones
    }
    
    return appointment;
  }

  /**
   * Verificar disponibilidad para una cita
   */
  private async checkAvailability(
    professionalId: number,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    // 1. Verificar si el profesional tiene configuración de disponibilidad para ese día
    const date = new Date(startTime);
    date.setHours(0, 0, 0, 0);
    
    const availableSlots = await this.availabilityService.getAvailableTimeSlots(
      professionalId,
      date
    );
    
    // 2. Verificar si el horario solicitado está dentro de alguno de los slots disponibles
    return availableSlots.some(slot => 
      startTime >= slot.start && 
      endTime <= slot.end
    );
  }
}