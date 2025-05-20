"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeBlockRepository = void 0;
// src/modules/appointment/repositories/time-block.repository.ts
const base_repository_1 = require("../../../core/repositories/base.repository");
const time_block_model_1 = require("../../../models/time-block.model");
const typeorm_1 = require("typeorm");
class TimeBlockRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(time_block_model_1.TimeBlock);
    }
    /**
     * Buscar bloques de tiempo por profesional y rango de fechas
     * @param professionalId ID del profesional
     * @param startDate Fecha inicial
     * @param endDate Fecha final
     * @returns Lista de bloques de tiempo
     */
    async findByProfessionalAndDateRange(professionalId, startDate, endDate) {
        return await this.repository.find({
            where: {
                professional_id: professionalId,
                start_time: (0, typeorm_1.LessThanOrEqual)(endDate),
                end_time: (0, typeorm_1.MoreThanOrEqual)(startDate)
            },
            order: { start_time: 'ASC' }
        });
    }
    /**
     * Buscar bloques de tiempo que cubren un día completo
     * @param professionalId ID del profesional
     * @param date Fecha a verificar
     * @returns Lista de bloques de tiempo que cubren todo el día
     */
    async findFullDayBlocks(professionalId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return await this.repository.find({
            where: {
                professional_id: professionalId,
                start_time: (0, typeorm_1.LessThanOrEqual)(startOfDay),
                end_time: (0, typeorm_1.MoreThanOrEqual)(endOfDay)
            }
        });
    }
    /**
     * Crear un nuevo bloque de tiempo
     * @param data Datos del bloque de tiempo
     * @returns Bloque de tiempo creado
     */
    async createTimeBlock(data) {
        return await this.create(data);
    }
    /**
     * Obtener un bloque de tiempo por ID
     * @param id ID del bloque de tiempo
     * @returns Bloque de tiempo encontrado
     */
    async getTimeBlockById(id) {
        return await this.findById(id);
    }
    /**
     * Actualizar un bloque de tiempo
     * @param id ID del bloque de tiempo
     * @param data Datos a actualizar
     * @returns Bloque de tiempo actualizado
     */
    async updateTimeBlock(id, data) {
        return await this.update(id, data, 'Bloque de tiempo');
    }
    /**
     * Eliminar un bloque de tiempo
     * @param id ID del bloque de tiempo
     * @returns true si se eliminó correctamente
     */
    async deleteTimeBlock(id) {
        return await this.delete(id, 'Bloque de tiempo');
    }
    /**
     * Obtener bloques de tiempo por profesional
     * @param professionalId ID del profesional
     * @returns Lista de bloques de tiempo
     */
    async getTimeBlocksByProfessional(professionalId) {
        return await this.repository.find({
            where: {
                professional_id: professionalId
            },
            order: { start_time: 'ASC' }
        });
    }
    /**
     * Obtener bloques de tiempo próximos
     * @param professionalId ID del profesional
     * @returns Lista de bloques de tiempo futuros
     */
    async getUpcomingTimeBlocks(professionalId) {
        const now = new Date();
        return await this.repository.find({
            where: {
                professional_id: professionalId,
                end_time: (0, typeorm_1.MoreThanOrEqual)(now)
            },
            order: { start_time: 'ASC' }
        });
    }
}
exports.TimeBlockRepository = TimeBlockRepository;
