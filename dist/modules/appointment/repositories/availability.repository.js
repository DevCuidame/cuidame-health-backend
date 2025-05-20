"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityRepository = void 0;
// src/modules/appointment/availability.repository.ts
const base_repository_1 = require("../../../core/repositories/base.repository");
const availability_model_1 = require("../../../models/availability.model");
class AvailabilityRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(availability_model_1.Availability);
    }
    /**
     * Obtener disponibilidad de un profesional por día de la semana
     * @param professionalId ID del profesional
     * @param dayOfWeek Día de la semana
     * @returns Lista de horarios disponibles para ese día
     */
    async findByProfessionalAndDay(professionalId, dayOfWeek) {
        return await this.repository.find({
            where: {
                professional_id: professionalId,
                day_of_week: dayOfWeek,
                is_active: true
            },
            order: { start_time: 'ASC' }
        });
    }
    /**
     * Obtener toda la disponibilidad de un profesional
     * @param professionalId ID del profesional
     * @returns Lista de horarios disponibles
     */
    async findByProfessional(professionalId) {
        return await this.repository.find({
            where: {
                professional_id: professionalId,
                is_active: true
            },
            order: { day_of_week: 'ASC', start_time: 'ASC' }
        });
    }
}
exports.AvailabilityRepository = AvailabilityRepository;
