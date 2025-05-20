"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthProfessionalService = void 0;
// src/modules/appointment/health-professional.service.ts
const health_professional_repository_1 = require("../repositories/health-professional.repository");
const error_handler_1 = require("../../../utils/error-handler");
const user_repository_1 = require("../../user/user.repository");
class HealthProfessionalService {
    healthProfessionalRepository;
    userRepository;
    constructor() {
        this.healthProfessionalRepository = new health_professional_repository_1.HealthProfessionalRepository();
        this.userRepository = new user_repository_1.UserRepository();
    }
    /**
     * Obtener todos los profesionales de salud
     */
    async getAllProfessionals() {
        return await this.healthProfessionalRepository.findAll({
            relations: ['user'],
        });
    }
    /**
     * Obtener un profesional por ID
     */
    async getProfessionalById(id) {
        const professional = await this.healthProfessionalRepository.findById(id, {
            relations: ['user'],
        });
        if (!professional) {
            throw new error_handler_1.NotFoundError(`Profesional con ID ${id} no encontrado`);
        }
        return professional;
    }
    /**
     * Crear un nuevo profesional de salud
     */
    async createProfessional(data) {
        // Verificar que el usuario existe
        const user = await this.userRepository.findById(data.user_id);
        if (!user) {
            throw new error_handler_1.NotFoundError(`Usuario con ID ${data.user_id} no encontrado`);
        }
        // Verificar que no exista ya un profesional con ese usuario
        const existingProfessionals = await this.healthProfessionalRepository.findAll({
            where: { user_id: data.user_id },
        });
        if (existingProfessionals && existingProfessionals.length > 0) {
            throw new error_handler_1.BadRequestError('Este usuario ya está registrado como profesional de salud');
        }
        return await this.healthProfessionalRepository.create(data);
    }
    /**
     * Actualizar un profesional de salud
     */
    async updateProfessional(id, data) {
        // Verificar que el profesional existe
        await this.getProfessionalById(id);
        return await this.healthProfessionalRepository.update(id, data, 'Profesional de salud');
    }
    /**
     * Eliminar un profesional de salud (o desactivarlo)
     */
    async deleteProfessional(id) {
        // Verificar que el profesional existe
        await this.getProfessionalById(id);
        // En lugar de eliminar, marcar como inactivo
        await this.healthProfessionalRepository.update(id, { is_active: false }, 'Profesional de salud');
        return {
            success: true,
            message: 'Profesional de salud desactivado correctamente',
        };
    }
    /**
     * Buscar profesionales por especialidad
     */
    async findBySpecialty(specialty) {
        return await this.healthProfessionalRepository.findBySpecialty(specialty);
    }
}
exports.HealthProfessionalService = HealthProfessionalService;
