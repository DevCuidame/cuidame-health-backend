"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderService = void 0;
// src/modules/notification/services/reminder.service.ts
const appointment_repository_1 = require("../../appointment/repositories/appointment.repository");
const notification_service_1 = require("../notification.service");
const notification_model_1 = require("../../../models/notification.model");
const appointment_model_1 = require("../../../models/appointment.model");
const user_repository_1 = require("../../user/user.repository");
const typeorm_1 = require("typeorm");
const logger_1 = __importDefault(require("../../../utils/logger"));
/**
 * Servicio para el envío de recordatorios automáticos
 */
class ReminderService {
    appointmentRepository;
    notificationService;
    userRepository;
    constructor() {
        this.appointmentRepository = new appointment_repository_1.AppointmentRepository();
        this.notificationService = new notification_service_1.NotificationService();
        this.userRepository = new user_repository_1.UserRepository();
    }
    /**
     * Envía recordatorios para citas próximas
     * @param options Opciones de recordatorio
     * @returns Número de recordatorios enviados
     */
    async sendAppointmentReminders(options = {}) {
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
            const appointmentStatuses = [appointment_model_1.AppointmentStatus.CONFIRMED, appointment_model_1.AppointmentStatus.REQUESTED];
            if (includeCancelled) {
                appointmentStatuses.push(appointment_model_1.AppointmentStatus.CANCELLED);
            }
            // Buscar citas que cumplan con el criterio
            const appointments = await this.appointmentRepository.findAll({
                where: {
                    start_time: (0, typeorm_1.Between)(startRange, endRange),
                    status: (0, typeorm_1.In)(appointmentStatuses),
                    reminder_sent: false // Solo citas sin recordatorio enviado
                },
                relations: ['patient', 'professional', 'professional.user', 'appointmentType']
            });
            if (appointments.length === 0) {
                return 0;
            }
            logger_1.default.info(`Encontradas ${appointments.length} citas para enviar recordatorios`);
            let remindersSent = 0;
            // Enviar recordatorio para cada cita
            for (const appointment of appointments) {
                try {
                    // Datos para la notificación
                    const patientName = `${appointment.patient.nombre} ${appointment.patient.apellido}`;
                    const professionalName = appointment.professional?.user
                        ? `${appointment.professional.user.name} ${appointment.professional.user.lastname}`
                        : 'profesional asignado';
                    const appointmentDate = appointment.start_time.toLocaleDateString();
                    const appointmentTime = appointment.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const appointmentType = appointment.appointmentType?.name || 'consulta';
                    // Preparar mensaje de recordatorio
                    const title = 'Recordatorio de cita';
                    let message = `Recordatorio: Tiene una cita de ${appointmentType} programada para el ${appointmentDate} a las ${appointmentTime} con ${professionalName}.`;
                    if (appointment.status === appointment_model_1.AppointmentStatus.CANCELLED) {
                        message = `Su cita de ${appointmentType} que estaba programada para el ${appointmentDate} a las ${appointmentTime} con ${professionalName} ha sido cancelada.`;
                    }
                    // Enviar recordatorio al paciente
                    await this.notificationService.createNotification({
                        user_id: appointment.patient_id,
                        appointment_id: appointment.id,
                        type: notification_model_1.NotificationType.APPOINTMENT_REMINDER,
                        title,
                        message
                    });
                    // Enviar recordatorio al profesional
                    await this.notificationService.createNotification({
                        user_id: appointment.professional_id,
                        appointment_id: appointment.id,
                        type: notification_model_1.NotificationType.APPOINTMENT_REMINDER,
                        title: 'Recordatorio de cita con paciente',
                        message: `Recordatorio: Tiene una cita de ${appointmentType} programada para el ${appointmentDate} a las ${appointmentTime} con el paciente ${patientName}.`
                    });
                    // Marcar la cita como recordatorio enviado
                    await this.appointmentRepository.update(appointment.id, { reminder_sent: true }, 'Cita');
                    remindersSent++;
                }
                catch (error) {
                    logger_1.default.error(`Error al enviar recordatorio para la cita ${appointment.id}:`, error);
                    // Continuar con la siguiente cita
                }
            }
            return remindersSent;
        }
        catch (error) {
            logger_1.default.error('Error al enviar recordatorios de citas:', error);
            throw error;
        }
    }
    /**
     * Envía recordatorios semanales con resumen de citas
     * @returns Número de resúmenes enviados
     */
    async sendWeeklySummaries() {
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
                            start_time: (0, typeorm_1.Between)(startDate, endDate),
                            status: (0, typeorm_1.In)([appointment_model_1.AppointmentStatus.CONFIRMED, appointment_model_1.AppointmentStatus.REQUESTED])
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
                        const date = appointment.start_time.toLocaleDateString();
                        const time = appointment.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const patientName = `${appointment.patient.nombre} ${appointment.patient.apellido}`;
                        const appointmentType = appointment.appointmentType?.name || 'consulta';
                        message += `${index + 1}. ${date} a las ${time}: ${appointmentType} con ${patientName}\n`;
                    });
                    // Enviar notificación con el resumen
                    await this.notificationService.createNotification({
                        user_id: professional.id,
                        type: notification_model_1.NotificationType.APPOINTMENT_SUMMARY,
                        title: 'Resumen semanal de citas',
                        message
                    });
                    summariesSent++;
                }
                catch (error) {
                    logger_1.default.error(`Error al enviar resumen semanal al profesional ${professional.id}:`, error);
                    // Continuar con el siguiente profesional
                }
            }
            return summariesSent;
        }
        catch (error) {
            logger_1.default.error('Error al enviar resúmenes semanales:', error);
            throw error;
        }
    }
    /**
     * Envía notificaciones para citas sin confirmar
     * @param hoursBeforeAppointment Horas antes de la cita para enviar la notificación
     * @returns Número de notificaciones enviadas
     */
    async sendUnconfirmedAppointmentReminders(hoursBeforeAppointment = 48) {
        try {
            // Calcular el rango de tiempo para las citas
            const now = new Date();
            const targetDate = new Date(now);
            targetDate.setHours(targetDate.getHours() + hoursBeforeAppointment);
            // Buscar citas que cumplan con el criterio (no confirmadas, próximas)
            const appointments = await this.appointmentRepository.findAll({
                where: {
                    start_time: (0, typeorm_1.Between)(now, targetDate),
                    status: appointment_model_1.AppointmentStatus.REQUESTED, // Solo citas solicitadas pero no confirmadas
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
                    const appointmentTime = appointment.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    // Notificación para el profesional
                    await this.notificationService.createNotification({
                        user_id: appointment.professional_id,
                        appointment_id: appointment.id,
                        type: notification_model_1.NotificationType.APPOINTMENT_REMINDER,
                        title: 'Recordatorio: Cita pendiente de confirmar',
                        message: `Tiene una cita pendiente de confirmar con ${patientName} programada para el ${appointmentDate} a las ${appointmentTime}. Por favor, confirme o rechace la solicitud.`
                    });
                    // Marcar la cita como recordatorio enviado
                    await this.appointmentRepository.update(appointment.id, { reminder_sent: true }, 'Cita');
                    remindersSent++;
                }
                catch (error) {
                    logger_1.default.error(`Error al enviar recordatorio de cita sin confirmar ${appointment.id}:`, error);
                    // Continuar con la siguiente cita
                }
            }
            return remindersSent;
        }
        catch (error) {
            logger_1.default.error('Error al enviar recordatorios de citas sin confirmar:', error);
            throw error;
        }
    }
}
exports.ReminderService = ReminderService;
