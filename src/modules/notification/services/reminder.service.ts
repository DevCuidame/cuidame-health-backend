// src/modules/notification/services/reminder.service.ts
import { AppointmentRepository } from '../../appointment/repositories/appointment.repository';
import { NotificationService } from '../notification.service';
import { ReminderOptions } from '../notification.interface';
import { NotificationType, NotificationStatus } from '../../../models/notification.model';
import { AppointmentStatus } from '../../../models/appointment.model';
import { UserRepository } from '../../user/user.repository';
import { Between, In, MoreThan, LessThan } from 'typeorm';
import logger from '../../../utils/logger';

/**
 * Servicio para el envío de recordatorios automáticos
 */
export class ReminderService {
  private appointmentRepository: AppointmentRepository;
  private notificationService: NotificationService;
  private userRepository: UserRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.notificationService = new NotificationService();
    this.userRepository = new UserRepository();
  }

  /**
   * Envía recordatorios para citas próximas
   * @param options Opciones de recordatorio
   * @returns Número de recordatorios enviados
   */
  async sendAppointmentReminders(options: ReminderOptions = {}): Promise<number> {
    try {
      // Configurar valores por defecto
      const days = options.days || 0;
      const hours = options.hours || 24; // Por defecto, recordatorio 24h antes
      const minutes = options.minutes || 0;
      const includeCancelled = options.includeCancelled || false;
      
      // Calcular rango de fechas para las citas
      const now = new Date();
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      targetDate.setHours(targetDate.getHours() + hours);
      targetDate.setMinutes(targetDate.getMinutes() + minutes);
      
      // Rango de tiempo para buscar citas (con un margen de 5 minutos)
      const startRange = new Date(targetDate);
      startRange.setMinutes(startRange.getMinutes() - 5);
      
      const endRange = new Date(targetDate);
      endRange.setMinutes(endRange.getMinutes() + 5);
      
      // Estados de cita a incluir
      const appointmentStatuses = [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED];
      if (includeCancelled) {
        appointmentStatuses.push(AppointmentStatus.CANCELLED);
      }
      
      // Buscar citas que cumplan con el criterio
      const appointments = await this.appointmentRepository.findAll({
        where: {
          start_time: Between(startRange, endRange),
          status: In(appointmentStatuses),
          reminder_sent: false // Solo citas sin recordatorio enviado
        },
        relations: ['patient', 'professional', 'professional.user', 'appointmentType']
      });
      
      if (appointments.length === 0) {
        return 0;
      }
      
      logger.info(`Encontradas ${appointments.length} citas para enviar recordatorios`);
      
      let remindersSent = 0;
      
      // Enviar recordatorio para cada cita
      for (const appointment of appointments) {
        try {
          // Datos para la notificación
          const patientName = `${appointment.patient.nombre} ${appointment.patient.apellido}`;
          const professionalName = appointment.professional?.user 
            ? `${appointment.professional.user.name} ${appointment.professional.user.lastname}`
            : 'profesional asignado';
          
          const appointmentDate = appointment.start_time!.toLocaleDateString();
          const appointmentTime = appointment.start_time!.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          const appointmentType = appointment.appointmentType?.name || 'consulta';
          
          // Preparar mensaje de recordatorio
          const title = 'Recordatorio de cita';
          let message = `Recordatorio: Tiene una cita de ${appointmentType} programada para el ${appointmentDate} a las ${appointmentTime} con ${professionalName}.`;
          
          if (appointment.status === AppointmentStatus.CANCELLED) {
            message = `Su cita de ${appointmentType} que estaba programada para el ${appointmentDate} a las ${appointmentTime} con ${professionalName} ha sido cancelada.`;
          }
          
          // Enviar recordatorio al paciente
          await this.notificationService.createNotification({
            user_id: appointment.patient_id,
            appointment_id: appointment.id,
            type: NotificationType.APPOINTMENT_REMINDER,
            title,
            message
          });
          
          // Enviar recordatorio al profesional
          await this.notificationService.createNotification({
            user_id: appointment.professional_id!,
            appointment_id: appointment.id,
            type: NotificationType.APPOINTMENT_REMINDER,
            title: 'Recordatorio de cita con paciente',
            message: `Recordatorio: Tiene una cita de ${appointmentType} programada para el ${appointmentDate} a las ${appointmentTime} con el paciente ${patientName}.`
          });
          
          // Marcar la cita como recordatorio enviado
          await this.appointmentRepository.update(
            appointment.id,
            { reminder_sent: true },
            'Cita'
          );
          
          remindersSent++;
        } catch (error) {
          logger.error(`Error al enviar recordatorio para la cita ${appointment.id}:`, error);
          // Continuar con la siguiente cita
        }
      }
      
      return remindersSent;
    } catch (error) {
      logger.error('Error al enviar recordatorios de citas:', error);
      throw error;
    }
  }

  /**
   * Envía recordatorios semanales con resumen de citas
   * @returns Número de resúmenes enviados
   */
  async sendWeeklySummaries(): Promise<number> {
    try {
      // Obtener todos los profesionales activos
      const professionals = await this.userRepository.findByFilters({
        role_id: 2 // Asumiendo que el rol 2 es para profesionales
      });
      
      if (professionals.length === 0) {
        return 0;
      }
      
      // Calcular rango de fechas para la próxima semana
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      
      let summariesSent = 0;
      
      // Enviar resumen a cada profesional
      for (const professional of professionals) {
        try {
          // Buscar citas para el profesional en la próxima semana
          const appointments = await this.appointmentRepository.findAll({
            where: {
              professional_id: professional.id,
              start_time: Between(startDate, endDate),
              status: In([AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED])
            },
            relations: ['patient', 'appointmentType'],
            order: { start_time: 'ASC' }
          });
          
          if (appointments.length === 0) {
            continue; // Ninguna cita para este profesional
          }
          
          // Generar mensaje con el resumen
          let message = `Resumen de citas para la próxima semana (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}):\n\n`;
          
          appointments.forEach((appointment, index) => {
            const date = appointment.start_time!.toLocaleDateString();
            const time = appointment.start_time!.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const patientName = `${appointment.patient.nombre} ${appointment.patient.apellido}`;
            const appointmentType = appointment.appointmentType?.name || 'consulta';
            
            message += `${index + 1}. ${date} a las ${time}: ${appointmentType} con ${patientName}\n`;
          });
          
          // Enviar notificación con el resumen
          await this.notificationService.createNotification({
            user_id: professional.id,
            type: NotificationType.APPOINTMENT_SUMMARY,
            title: 'Resumen semanal de citas',
            message
          });
          
          summariesSent++;
        } catch (error) {
          logger.error(`Error al enviar resumen semanal al profesional ${professional.id}:`, error);
          // Continuar con el siguiente profesional
        }
      }
      
      return summariesSent;
    } catch (error) {
      logger.error('Error al enviar resúmenes semanales:', error);
      throw error;
    }
  }

  /**
   * Envía notificaciones para citas sin confirmar
   * @param hoursBeforeAppointment Horas antes de la cita para enviar la notificación
   * @returns Número de notificaciones enviadas
   */
  async sendUnconfirmedAppointmentReminders(hoursBeforeAppointment: number = 48): Promise<number> {
    try {
      // Calcular el rango de tiempo para las citas
      const now = new Date();
      const targetDate = new Date(now);
      targetDate.setHours(targetDate.getHours() + hoursBeforeAppointment);
      
      // Buscar citas que cumplan con el criterio (no confirmadas, próximas)
      const appointments = await this.appointmentRepository.findAll({
        where: {
            start_time: Between(now, targetDate),
          status: AppointmentStatus.REQUESTED, // Solo citas solicitadas pero no confirmadas
          reminder_sent: false // Solo citas sin recordatorio enviado
        },
        relations: ['patient', 'professional', 'professional.user', 'appointmentType']
      });
      
      if (appointments.length === 0) {
        return 0;
      }
      
      let remindersSent = 0;
      
      // Enviar recordatorio para cada cita
      for (const appointment of appointments) {
        try {
          const patientName = `${appointment.patient.nombre} ${appointment.patient.apellido}`;
          const professionalName = appointment.professional?.user 
            ? `${appointment.professional.user.name} ${appointment.professional.user.lastname}`
            : 'profesional asignado';
          
          const appointmentDate = appointment.start_time.toLocaleDateString();
          const appointmentTime = appointment.start_time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          
          // Notificación para el profesional
          await this.notificationService.createNotification({
            user_id: appointment.professional_id!,
            appointment_id: appointment.id,
            type: NotificationType.APPOINTMENT_REMINDER,
            title: 'Recordatorio: Cita pendiente de confirmar',
            message: `Tiene una cita pendiente de confirmar con ${patientName} programada para el ${appointmentDate} a las ${appointmentTime}. Por favor, confirme o rechace la solicitud.`
          });
          
          // Marcar la cita como recordatorio enviado
          await this.appointmentRepository.update(
            appointment.id,
            { reminder_sent: true },
            'Cita'
          );
          
          remindersSent++;
        } catch (error) {
          logger.error(`Error al enviar recordatorio de cita sin confirmar ${appointment.id}:`, error);
          // Continuar con la siguiente cita
        }
      }
      
      return remindersSent;
    } catch (error) {
      logger.error('Error al enviar recordatorios de citas sin confirmar:', error);
      throw error;
    }
  }
}