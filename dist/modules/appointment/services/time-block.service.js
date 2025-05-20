"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeBlockService = void 0;
// src/modules/appointment/services/time-block.service.ts
const time_block_repository_1 = require("../repositories/time-block.repository");
const health_professional_service_1 = require("./health-professional.service");
const error_handler_1 = require("../../../utils/error-handler");
class TimeBlockService {
    timeBlockRepository;
    healthProfessionalService;
    constructor() {
        this.timeBlockRepository = new time_block_repository_1.TimeBlockRepository();
        this.healthProfessionalService = new health_professional_service_1.HealthProfessionalService();
    }
    /**
     * Crear un nuevo bloque de tiempo
     * @param data Datos del bloque de tiempo
     * @param userId ID del usuario que crea el bloque
     */
    async createTimeBlock(data, userId) {
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(data.professional_id);
        // Verificar que las fechas sean válidas
        if (data.start_time && data.end_time) {
            const start = new Date(data.start_time);
            const end = new Date(data.end_time);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new error_handler_1.BadRequestError('Formato de fecha inválido');
            }
            if (start >= end) {
                throw new error_handler_1.BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
            }
            // Si la fecha de inicio es en el pasado
            if (start < new Date()) {
                throw new error_handler_1.BadRequestError('No se pueden crear bloques de tiempo en el pasado');
            }
        }
        return await this.timeBlockRepository.createTimeBlock(data);
    }
    /**
     * Obtener un bloque de tiempo por ID
     */
    async getTimeBlockById(id) {
        const timeBlock = await this.timeBlockRepository.getTimeBlockById(id);
        if (!timeBlock) {
            throw new error_handler_1.NotFoundError(`Bloque de tiempo con ID ${id} no encontrado`);
        }
        return timeBlock;
    }
    /**
     * Obtener bloques de tiempo por profesional
     */
    async getTimeBlocksByProfessional(professionalId) {
        // Verificar que el profesional existe
        await this.healthProfessionalService.getProfessionalById(professionalId);
        return await this.timeBlockRepository.getTimeBlocksByProfessional(professionalId);
    }
    /**
     * Actualizar un bloque de tiempo
     */
    async updateTimeBlock(id, data, userId) {
        // Verificar que el bloque existe
        await this.getTimeBlockById(id);
        // Verificar que las fechas sean válidas si se están actualizando
        if (data.start_time && data.end_time) {
            const start = new Date(data.start_time);
            const end = new Date(data.end_time);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new error_handler_1.BadRequestError('Formato de fecha inválido');
            }
            if (start >= end) {
                throw new error_handler_1.BadRequestError('La hora de inicio debe ser anterior a la hora de fin');
            }
        }
        return await this.timeBlockRepository.updateTimeBlock(id, data);
    }
    /**
     * Eliminar un bloque de tiempo
     */
    async deleteTimeBlock(id) {
        // Verificar que el bloque existe
        await this.getTimeBlockById(id);
        const result = await this.timeBlockRepository.deleteTimeBlock(id);
        return {
            success: result,
            message: result ? 'Bloque de tiempo eliminado correctamente' : 'No se pudo eliminar el bloque de tiempo'
        };
    }
}
exports.TimeBlockService = TimeBlockService;
