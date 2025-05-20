"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringAppointmentService = void 0;
// src/modules/appointment/services/recurring-appointment.service.ts
const recurring_appointment_repository_1 = require("../repositories/recurring-appointment.repository");
const appointment_repository_1 = require("../repositories/appointment.repository");
const recurring_appointment_model_1 = require("../../../models/recurring-appointment.model");
const appointment_model_1 = require("../../../models/appointment.model");
const error_handler_1 = require("../../../utils/error-handler");
const health_professional_service_1 = require("./health-professional.service");
const appointment_type_service_1 = require("./appointment-type.service");
const date_fns_1 = require("date-fns");
const patient_service_1 = require("../../../modules/patient/patient.service");
const typeorm_1 = require("typeorm");
class RecurringAppointmentService {
    recurringAppointmentRepository;
    appointmentRepository;
    healthProfessionalService;
    appointmentTypeService;
    patientService;
    constructor() {
        this.recurringAppointmentRepository = new recurring_appointment_repository_1.RecurringAppointmentRepository();
        this.appointmentRepository = new appointment_repository_1.AppointmentRepository();
        this.healthProfessionalService = new health_professional_service_1.HealthProfessionalService();
        this.appointmentTypeService = new appointment_type_service_1.AppointmentTypeService();
        this.patientService = new patient_service_1.PatientService();
    }
    /**
     * Obtener todas las citas recurrentes
     */
    async getAllRecurringAppointments() {
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
    async getRecurringAppointmentById(id) {
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
            throw new error_handler_1.NotFoundError(`Cita recurrente con ID ${id} no encontrada`);
        }
        return recurringAppointment;
    }
    /**
     * Obtener citas recurrentes por paciente
     */
    async getRecurringAppointmentsByPatient(patientId) {
        // Verificar que el paciente existe
        await this.patientService.getPatientById(patientId);
        return await this.recurringAppointmentRepository.findByPatient(patientId);
    }
    /**
     * Obtener citas recurrentes por profesional
     */
    async getRecurringAppointmentsByProfessional(professionalId) {
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(professionalId);
        return await this.recurringAppointmentRepository.findByProfessional(professionalId);
    }
    /**
     * Crear una nueva cita recurrente y generar las citas individuales
     */
    async createRecurringAppointment(data, userId) {
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
    async updateRecurringAppointment(id, data, regenerateAppointments = false, userId) {
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
    async deactivateRecurringAppointment(id, cancelFutureAppointments = true, reason, userId) {
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
    async generateAppointments(recurringAppointment, userId) {
        const generatedAppointments = [];
        const now = new Date();
        // Determinar la fecha límite para generar citas
        let endDate = null;
        let maxOccurrences = 100; // Límite por defecto para evitar bucles infinitos
        if (recurringAppointment.end_type === recurring_appointment_model_1.RecurrenceEndType.ON_DATE && recurringAppointment.end_date) {
            endDate = new Date(recurringAppointment.end_date);
        }
        else if (recurringAppointment.end_type === recurring_appointment_model_1.RecurrenceEndType.AFTER_OCCURRENCES && recurringAppointment.occurrences) {
            maxOccurrences = recurringAppointment.occurrences;
        }
        else if (recurringAppointment.end_type === recurring_appointment_model_1.RecurrenceEndType.NEVER) {
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
            if (recurringAppointment.recurrence_pattern === recurring_appointment_model_1.RecurrencePattern.WEEKLY &&
                recurringAppointment.days_of_week &&
                recurringAppointment.days_of_week.length > 0) {
                // Si no es uno de los días seleccionados, avanzar al siguiente día
                if (!recurringAppointment.days_of_week.includes((0, date_fns_1.getDay)(currentDate))) {
                    currentDate = (0, date_fns_1.addDays)(currentDate, 1);
                    continue;
                }
            }
            // Crear la cita individual
            const appointmentData = {
                patient_id: recurringAppointment.patient_id,
                professional_id: recurringAppointment.professional_id,
                appointment_type_id: recurringAppointment.appointment_type_id,
                start_time: new Date(currentDate),
                end_time: new Date(currentDate.getTime() + appointmentDuration),
                status: appointment_model_1.AppointmentStatus.CONFIRMED,
                notes: recurringAppointment.notes,
                recurring_appointment_id: recurringAppointment.id,
                modified_by_id: userId
            };
            // Verificar si hay conflictos con otras citas
            const hasConflict = await this.appointmentRepository.hasConflictingAppointments(appointmentData.professional_id, appointmentData.start_time, appointmentData.end_time);
            // Solo crear la cita si no hay conflictos
            if (!hasConflict) {
                try {
                    const appointment = await this.appointmentRepository.create(appointmentData);
                    generatedAppointments.push(appointment);
                }
                catch (error) {
                    console.error(`Error al crear cita recurrente para ${(0, date_fns_1.format)(currentDate, 'yyyy-MM-dd HH:mm')}:`, error);
                    // Continuar con la siguiente cita aunque haya error
                }
            }
            count++;
            // Avanzar a la siguiente fecha según el patrón de recurrencia
            switch (recurringAppointment.recurrence_pattern) {
                case recurring_appointment_model_1.RecurrencePattern.DAILY:
                    currentDate = (0, date_fns_1.addDays)(currentDate, recurringAppointment.recurrence_interval);
                    break;
                case recurring_appointment_model_1.RecurrencePattern.WEEKLY:
                    // Para patrón semanal con días específicos, avanzar solo un día
                    if (recurringAppointment.days_of_week && recurringAppointment.days_of_week.length > 0) {
                        currentDate = (0, date_fns_1.addDays)(currentDate, 1);
                    }
                    else {
                        currentDate = (0, date_fns_1.addWeeks)(currentDate, recurringAppointment.recurrence_interval);
                    }
                    break;
                case recurring_appointment_model_1.RecurrencePattern.BIWEEKLY:
                    currentDate = (0, date_fns_1.addWeeks)(currentDate, 2 * recurringAppointment.recurrence_interval);
                    break;
                case recurring_appointment_model_1.RecurrencePattern.MONTHLY:
                    if (recurringAppointment.day_of_month) {
                        // Si se especificó un día del mes, usar ese día
                        currentDate = (0, date_fns_1.addMonths)(currentDate, recurringAppointment.recurrence_interval);
                        currentDate = (0, date_fns_1.setDate)(currentDate, recurringAppointment.day_of_month);
                    }
                    else {
                        // Si no, mantener el mismo día
                        currentDate = (0, date_fns_1.addMonths)(currentDate, recurringAppointment.recurrence_interval);
                    }
                    break;
                default:
                    currentDate = (0, date_fns_1.addDays)(currentDate, recurringAppointment.recurrence_interval);
            }
        }
        return generatedAppointments;
    }
    /**
     * Eliminar citas futuras generadas por una recurrencia
     */
    async deleteFutureAppointments(recurringAppointmentId) {
        const now = new Date();
        // Buscar todas las citas futuras asociadas a esta recurrencia
        const appointments = await this.appointmentRepository.findAll({
            where: {
                recurring_appointment_id: recurringAppointmentId,
                start_time: (0, typeorm_1.MoreThan)(now)
            }
        });
        // Eliminar cada cita futura
        for (const appointment of appointments) {
            await this.appointmentRepository.update(appointment.id, { status: appointment_model_1.AppointmentStatus.CANCELLED }, 'Cita');
        }
    }
    /**
     * Cancelar citas futuras generadas por una recurrencia
     */
    async cancelFutureAppointments(recurringAppointmentId, reason, userId) {
        const now = new Date();
        // Buscar todas las citas futuras asociadas a esta recurrencia
        const appointments = await this.appointmentRepository.findAll({
            where: {
                recurring_appointment_id: recurringAppointmentId,
                start_time: (0, typeorm_1.MoreThan)(now),
                status: (0, typeorm_1.Not)(appointment_model_1.AppointmentStatus.CANCELLED)
            }
        });
        // Cancelar cada cita futura
        for (const appointment of appointments) {
            await this.appointmentRepository.update(appointment.id, {
                status: appointment_model_1.AppointmentStatus.CANCELLED,
                cancellation_reason: reason || 'Cancelada por desactivación de cita recurrente',
                modified_by_id: userId
            }, 'Cita');
        }
    }
    /**
     * Validar datos de una cita recurrente
     */
    async validateRecurringAppointmentData(data) {
        // Verificar datos requeridos
        if (!data.patient_id ||
            !data.professional_id ||
            !data.appointment_type_id ||
            !data.start_time ||
            !data.end_time ||
            !data.recurrence_pattern) {
            throw new error_handler_1.BadRequestError('Faltan datos requeridos para la cita recurrente');
        }
        // Verificar que el paciente existe
        await this.patientService.getPatientById(data.patient_id);
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(data.professional_id);
        // Verificar que el tipo de cita existe
        await this.appointmentTypeService.getTypeById(data.appointment_type_id);
        // Validar horarios
        if (data.start_time >= data.end_time) {
            throw new error_handler_1.BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
        }
        // Validar que la cita no sea en el pasado
        if (data.start_time < new Date()) {
            throw new error_handler_1.BadRequestError('No se pueden crear citas recurrentes en el pasado');
        }
        // Validar parámetros específicos según el tipo de recurrencia
        switch (data.recurrence_pattern) {
            case recurring_appointment_model_1.RecurrencePattern.WEEKLY:
                if (!data.days_of_week || data.days_of_week.length === 0) {
                    throw new error_handler_1.BadRequestError('Para recurrencia semanal, debe seleccionar al menos un día de la semana');
                }
                break;
            case recurring_appointment_model_1.RecurrencePattern.MONTHLY:
                if (!data.day_of_month || data.day_of_month < 1 || data.day_of_month > 31) {
                    throw new error_handler_1.BadRequestError('Para recurrencia mensual, debe especificar un día del mes válido (1-31)');
                }
                break;
        }
        // Validar tipo de fin de recurrencia
        switch (data.end_type) {
            case recurring_appointment_model_1.RecurrenceEndType.AFTER_OCCURRENCES:
                if (!data.occurrences || data.occurrences < 1) {
                    throw new error_handler_1.BadRequestError('Debe especificar un número válido de ocurrencias');
                }
                break;
            case recurring_appointment_model_1.RecurrenceEndType.ON_DATE:
                if (!data.end_date) {
                    throw new error_handler_1.BadRequestError('Debe especificar una fecha de finalización');
                }
                if (data.end_date < data.start_time) {
                    throw new error_handler_1.BadRequestError('La fecha de finalización debe ser posterior a la fecha de inicio');
                }
                break;
        }
    }
}
exports.RecurringAppointmentService = RecurringAppointmentService;
