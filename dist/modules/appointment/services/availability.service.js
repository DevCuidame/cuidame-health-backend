"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
// src/modules/appointment/availability.service.ts
const availability_repository_1 = require("../repositories/availability.repository");
const availability_model_1 = require("../../../models/availability.model");
const health_professional_service_1 = require("./health-professional.service");
const error_handler_1 = require("../../../utils/error-handler");
const appointment_model_1 = require("../../../models/appointment.model");
const appointment_repository_1 = require("../repositories/appointment.repository");
const time_block_repository_1 = require("../repositories/time-block.repository");
class AvailabilityService {
    availabilityRepository;
    healthProfessionalService;
    appointmentRepository;
    timeBlockRepository;
    constructor() {
        this.availabilityRepository = new availability_repository_1.AvailabilityRepository();
        this.healthProfessionalService = new health_professional_service_1.HealthProfessionalService();
        this.appointmentRepository = new appointment_repository_1.AppointmentRepository();
        this.timeBlockRepository = new time_block_repository_1.TimeBlockRepository();
    }
    /**
     * Obtener disponibilidad de un profesional
     */
    async getProfessionalAvailability(professionalId) {
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(professionalId);
        return await this.availabilityRepository.findByProfessional(professionalId);
    }
    /**
     * Añadir un nuevo horario de disponibilidad
     */
    async addAvailability(data) {
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(data.professional_id);
        // Validar que las horas sean correctas
        if (data.start_time && data.end_time && data.start_time >= data.end_time) {
            throw new error_handler_1.BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
        }
        return await this.availabilityRepository.create(data);
    }
    /**
     * Actualizar un horario de disponibilidad
     */
    async updateAvailability(id, data) {
        // Verificar que el horario existe
        const availability = await this.availabilityRepository.findById(id);
        if (!availability) {
            throw new error_handler_1.NotFoundError(`Horario de disponibilidad con ID ${id} no encontrado`);
        }
        // Validar que las horas sean correctas
        if (data.start_time && data.end_time && data.start_time >= data.end_time) {
            throw new error_handler_1.BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
        }
        return await this.availabilityRepository.update(id, data, 'Horario de disponibilidad');
    }
    /**
     * Eliminar/desactivar un horario de disponibilidad
     */
    async deleteAvailability(id) {
        // Verificar que el horario existe
        const availability = await this.availabilityRepository.findById(id);
        if (!availability) {
            throw new error_handler_1.NotFoundError(`Horario de disponibilidad con ID ${id} no encontrado`);
        }
        // En lugar de eliminar, marcar como inactivo
        await this.availabilityRepository.update(id, { is_active: false }, 'Horario de disponibilidad');
        return {
            success: true,
            message: 'Horario de disponibilidad desactivado correctamente'
        };
    }
    /**
     * Obtener slots de tiempo disponibles para un profesional en una fecha específica
     * @param professionalId ID del profesional
     * @param date Fecha para consultar disponibilidad
     * @returns Lista de slots de tiempo disponibles
     */
    async getAvailableTimeSlots(professionalId, date) {
        // Verificar que el profesional existe
        const professional = await this.healthProfessionalService.getProfessionalById(professionalId);
        // 1. Obtener el día de la semana para la fecha solicitada
        const dayOfWeek = this.getDayOfWeek(date);
        // 2. Buscar horarios de disponibilidad para ese día
        const availabilities = await this.availabilityRepository.findByProfessionalAndDay(professionalId, dayOfWeek);
        if (!availabilities || availabilities.length === 0) {
            return []; // No hay disponibilidad para este día
        }
        // 3. Generar slots de tiempo basados en la duración por defecto del profesional
        const slots = [];
        const slotDuration = professional.default_appointment_duration || 30; // minutos
        for (const availability of availabilities) {
            // Convertir las horas de string "HH:MM:SS" a objetos Date
            const startParts = availability.start_time.split(':').map(Number);
            const endParts = availability.end_time.split(':').map(Number);
            // Crear una copia de la fecha solicitada y establecer la hora de inicio
            const startTime = new Date(date);
            startTime.setHours(startParts[0], startParts[1], startParts[2] || 0, 0);
            // Crear una copia de la fecha solicitada y establecer la hora de fin
            const endTime = new Date(date);
            endTime.setHours(endParts[0], endParts[1], endParts[2] || 0, 0);
            // Generar slots de la duración especificada
            let currentSlotStart = new Date(startTime);
            while (currentSlotStart.getTime() + slotDuration * 60000 <= endTime.getTime()) {
                const currentSlotEnd = new Date(currentSlotStart.getTime() + slotDuration * 60000);
                slots.push({
                    start: new Date(currentSlotStart),
                    end: new Date(currentSlotEnd)
                });
                // Avanzar al siguiente slot
                currentSlotStart = new Date(currentSlotEnd);
            }
        }
        // 4. Obtener citas existentes para ese día
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const existingAppointments = await this.appointmentRepository.findByDateRange(dayStart, dayEnd);
        const professionalAppointments = existingAppointments.filter(a => a.professional_id === professionalId &&
            (a.status === appointment_model_1.AppointmentStatus.CONFIRMED || a.status === appointment_model_1.AppointmentStatus.REQUESTED));
        // 5. Filtrar slots que se superponen con citas existentes
        const availableSlots = slots.filter(slot => {
            return !professionalAppointments.some((appointment) => {
                return ((slot.start >= appointment.start_time && slot.start < appointment.end_time) ||
                    (slot.end > appointment.start_time && slot.end <= appointment.end_time) ||
                    (slot.start <= appointment.start_time && slot.end >= appointment.end_time));
            });
        });
        // 6. Filtrar slots que se superponen con bloques de tiempo
        const timeBlocks = await this.timeBlockRepository.findByProfessionalAndDateRange(professionalId, dayStart, dayEnd);
        const finalAvailableSlots = availableSlots.filter(slot => {
            return !timeBlocks.some((block) => {
                return ((slot.start >= block.start_time && slot.start < block.end_time) ||
                    (slot.end > block.start_time && slot.end <= block.end_time) ||
                    (slot.start <= block.start_time && slot.end >= block.end_time));
            });
        });
        return finalAvailableSlots;
    }
    /**
     * Obtener días disponibles para un mes específico
     * @param professionalId ID del profesional
     * @param year Año para consultar
     * @param month Mes para consultar (1-12)
     * @returns Lista de días disponibles en ese mes
     */
    async getAvailableDays(professionalId, year, month) {
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(professionalId);
        // 1. Obtener todos los días para el mes y año especificados
        const daysInMonth = new Date(year, month, 0).getDate();
        const availableDays = [];
        // 2. Obtener disponibilidad del profesional para todos los días de la semana
        const allAvailabilities = await this.availabilityRepository.findByProfessional(professionalId);
        // Si no hay configuración de disponibilidad, no hay días disponibles
        if (!allAvailabilities || allAvailabilities.length === 0) {
            return [];
        }
        // Mapear las disponibilidades por día de la semana
        const availabilitiesByDay = new Map();
        for (const day of Object.values(availability_model_1.DayOfWeek)) {
            availabilitiesByDay.set(day, allAvailabilities.filter(a => a.day_of_week === day));
        }
        // 3. Para cada día del mes, verificar si hay disponibilidad
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = this.getDayOfWeek(date);
            // Si hay configuración de disponibilidad para este día de la semana
            if (availabilitiesByDay.get(dayOfWeek)?.length) {
                // Verificar si no está bloqueado completamente
                const isFullyBlocked = await this.isDateFullyBlocked(professionalId, date);
                if (!isFullyBlocked) {
                    availableDays.push(day);
                }
            }
        }
        return availableDays;
    }
    /**
     * Verificar si una fecha está completamente bloqueada
     * @param professionalId ID del profesional
     * @param date Fecha a verificar
     */
    async isDateFullyBlocked(professionalId, date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        // Verificar si hay un bloque de tiempo para todo el día
        const fullDayBlocks = await this.timeBlockRepository.findFullDayBlocks(professionalId, dayStart);
        return fullDayBlocks.length > 0;
    }
    /**
     * Convertir fecha a día de la semana
     * @param date Fecha
     */
    getDayOfWeek(date) {
        const days = [
            availability_model_1.DayOfWeek.SUNDAY,
            availability_model_1.DayOfWeek.MONDAY,
            availability_model_1.DayOfWeek.TUESDAY,
            availability_model_1.DayOfWeek.WEDNESDAY,
            availability_model_1.DayOfWeek.THURSDAY,
            availability_model_1.DayOfWeek.FRIDAY,
            availability_model_1.DayOfWeek.SATURDAY
        ];
        return days[date.getDay()];
    }
}
exports.AvailabilityService = AvailabilityService;
