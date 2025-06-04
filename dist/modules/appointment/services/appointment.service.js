"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
// src/modules/appointment/appointment.service.ts
const appointment_repository_1 = require("../repositories/appointment.repository");
const appointment_model_1 = require("../../../models/appointment.model");
const health_professional_service_1 = require("./health-professional.service");
const appointment_type_service_1 = require("./appointment-type.service");
const patient_service_1 = require("../../patient/patient.service");
const error_handler_1 = require("../../../utils/error-handler");
class AppointmentService {
    appointmentRepository;
    healthProfessionalService;
    appointmentTypeService;
    patientService;
    constructor() {
        this.appointmentRepository = new appointment_repository_1.AppointmentRepository();
        this.healthProfessionalService = new health_professional_service_1.HealthProfessionalService();
        this.appointmentTypeService = new appointment_type_service_1.AppointmentTypeService();
        this.patientService = new patient_service_1.PatientService();
    }
    /**
     * Obtener todas las citas
     */
    async getAllAppointments() {
        return await this.appointmentRepository.findAll({
            relations: [
                'patient',
                'professional',
                'professional.user',
                'appointmentType',
                'specialty'
            ],
        });
    }
    /**
     * Obtener una cita por ID
     */
    async getAppointmentById(id) {
        const appointment = await this.appointmentRepository.findById(id, {
            relations: [
                'patient',
                'professional',
                'professional.user',
                'appointmentType',
            ],
        });
        if (!appointment) {
            throw new error_handler_1.NotFoundError(`Cita con ID ${id} no encontrada`);
        }
        return appointment;
    }
    /**
     * Obtener citas por paciente
     */
    async getAppointmentsByPatient(patientId) {
        // Verificar que el paciente existe
        await this.patientService.getPatientById(patientId);
        return await this.appointmentRepository.findByPatient(patientId);
    }
    /**
     * Obtener citas por profesional
     */
    async getAppointmentsByProfessional(professionalId) {
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(professionalId);
        return await this.appointmentRepository.findByProfessional(professionalId);
    }
    /**
     * Crear una nueva cita
     */
    async createAppointment(data, userId) {
        // Verificaciones de datos
        // await this.validateAppointmentData(data);
        // Verificar que no haya conflictos de horario
        // if (
        //   await this.appointmentRepository.hasConflictingAppointments(
        //     data.professional_id as number,
        //     data.start_time as Date,
        //     data.end_time as Date
        //   )
        // ) {
        //   throw new BadRequestError(
        //     'El profesional ya tiene una cita programada en este horario'
        //   );
        // }
        // Si el estado no se especifica, establecer como "Solicitada"
        if (!data.status) {
            data.status = appointment_model_1.AppointmentStatus.REQUESTED;
        }
        // Guardar información sobre quién creó/modificó la cita
        if (userId) {
            data.modified_by_id = userId;
        }
        const appointmentData = {
            patient_id: data.patient_id,
            professional_id: data.professional_id,
            appointment_type_id: data.appointment_type_id,
            start_time: data.start_time,
            end_time: data.end_time,
            status: data.status || appointment_model_1.AppointmentStatus.REQUESTED,
            notes: data.notes || '',
            cancellation_reason: data.cancellation_reason,
            reminder_sent: data.reminder_sent || false,
            specialty_id: data.specialty_id,
            location: data.location,
            modified_by_id: userId || data.modified_by_id,
            recurring_appointment_id: data.recurring_appointment_id,
            created_at: new Date(),
            updated_at: new Date()
        };
        return await this.appointmentRepository.create(appointmentData);
    }
    /**
     * Actualizar una cita
     */
    async updateAppointment(id, data, userId) {
        // Verificar que la cita existe
        // const appointment = await this.getAppointmentById(id);
        // // Si se está cambiando horario o profesional, verificar que no haya conflictos
        // if (
        //   (data.start_time || data.end_time || data.professional_id) &&
        //   (await this.appointmentRepository.hasConflictingAppointments(
        //     (data.professional_id as number) || appointment.professional_id!,
        //     (data.start_time as Date) || appointment.start_time,
        //     (data.end_time as Date) || appointment.end_time,
        //     id
        //   ))
        // ) {
        //   throw new BadRequestError(
        //     'El profesional ya tiene una cita programada en este horario'
        //   );
        // }
        // Guardar información sobre quién modificó la cita
        if (userId) {
            data.modified_by_id = userId;
        }
        return await this.appointmentRepository.update(id, data, 'Cita');
    }
    /**
     * Cambiar el estado de una cita
     */
    async changeAppointmentStatus(id, status, reason, userId) {
        // Verificar que la cita existe
        const appointment = await this.getAppointmentById(id);
        // Validar cambios de estado
        this.validateStatusChange(appointment.status, status);
        // Actualizar estado
        const updateData = { status };
        // Si es cancelación, guardar motivo
        if (status === appointment_model_1.AppointmentStatus.CANCELLED && reason) {
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
    async validateAppointmentData(data) {
        // Verificar datos requeridos
        if (!data.patient_id ||
            !data.professional_id ||
            !data.appointment_type_id ||
            !data.start_time ||
            !data.end_time) {
            throw new error_handler_1.BadRequestError('Faltan datos requeridos para la cita');
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
            throw new error_handler_1.BadRequestError('No se pueden crear citas en el pasado');
        }
    }
    /**
     * Validar cambios de estado
     */
    validateStatusChange(currentStatus, newStatus) {
        // Ejemplo de validación de flujo de estados
        // Esto se puede ajustar según las reglas de negocio específicas
        // No se puede cambiar estado de citas canceladas
        if (currentStatus === appointment_model_1.AppointmentStatus.CANCELLED) {
            throw new error_handler_1.BadRequestError('No se puede cambiar el estado de una cita cancelada');
        }
        // No se puede marcar como completada una cita que no está confirmada
        if (newStatus === appointment_model_1.AppointmentStatus.COMPLETED &&
            currentStatus !== appointment_model_1.AppointmentStatus.CONFIRMED) {
            throw new error_handler_1.BadRequestError('Solo se pueden completar citas confirmadas');
        }
        // No se puede confirmar una cita marcada como no-show
        if (newStatus === appointment_model_1.AppointmentStatus.CONFIRMED &&
            currentStatus === appointment_model_1.AppointmentStatus.NO_SHOW) {
            throw new error_handler_1.BadRequestError('No se puede confirmar una cita marcada como no-show');
        }
    }
    /**
     * Obtener detalles de un tipo de cita
     */
    async getAppointmentTypeDetails(typeId) {
        return await this.appointmentTypeService.getTypeById(typeId);
    }
    /**
     * Obtener detalles de un profesional
     */
    async getProfessionalDetails(professionalId) {
        return await this.healthProfessionalService.getProfessionalById(professionalId);
    }
}
exports.AppointmentService = AppointmentService;
