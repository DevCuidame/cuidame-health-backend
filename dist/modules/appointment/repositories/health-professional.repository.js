"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthProfessionalRepository = void 0;
// src/modules/appointment/health-professional.repository.ts
const base_repository_1 = require("../../../core/repositories/base.repository");
const health_professional_model_1 = require("../../../models/health-professional.model");
const typeorm_1 = require("typeorm");
class HealthProfessionalRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(health_professional_model_1.HealthProfessional);
    }
    /**
     * Buscar profesionales por especialidad
     * @param specialty Especialidad médica
     * @returns Lista de profesionales con esa especialidad
     */
    async findBySpecialty(specialty) {
        return await this.repository.find({
            where: {
                specialty: (0, typeorm_1.ILike)(`%${specialty}%`),
                is_active: true
            },
            relations: ['user']
        });
    }
    /**
     * Buscar profesionales disponibles en un horario específico
     * @param date Fecha para la búsqueda
     * @param specialtyId ID de la especialidad (opcional)
     * @returns Lista de profesionales disponibles
     */
    async findAvailableProfessionals(date, specialtyId) {
        // Consulta compleja que cruza con el horario de disponibilidad y citas existentes
        // Aquí una versión simplificada
        const query = this.repository.createQueryBuilder('professional')
            .leftJoinAndSelect('professional.user', 'user')
            .where('professional.is_active = :isActive', { isActive: true });
        if (specialtyId) {
            query.andWhere('professional.specialty_id = :specialtyId', { specialtyId });
        }
        // Esta es una simplificación. La consulta real debería verificar:
        // 1. Que el profesional tenga disponibilidad ese día de la semana
        // 2. Que no tenga bloques de tiempo que interfieran
        // 3. Que no tenga citas ya agendadas en ese horario
        return query.getMany();
    }
}
exports.HealthProfessionalRepository = HealthProfessionalRepository;
