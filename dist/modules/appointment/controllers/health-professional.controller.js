"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthProfessionalController = void 0;
const health_professional_service_1 = require("../services/health-professional.service");
const error_handler_1 = require("../../../utils/error-handler");
class HealthProfessionalController {
    healthProfessionalService;
    constructor() {
        this.healthProfessionalService = new health_professional_service_1.HealthProfessionalService();
    }
    /**
     * Obtener todos los profesionales de salud
     * @route GET /api/professionals
     */
    getAllProfessionals = async (req, res, next) => {
        try {
            const professionals = await this.healthProfessionalService.getAllProfessionals();
            const response = {
                success: true,
                data: professionals,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener un profesional por ID
     * @route GET /api/professionals/:id
     */
    getProfessionalById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const professional = await this.healthProfessionalService.getProfessionalById(id);
            const response = {
                success: true,
                data: professional,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crear un nuevo profesional de salud
     * @route POST /api/professionals
     */
    createProfessional = async (req, res, next) => {
        try {
            const data = req.body;
            const professional = await this.healthProfessionalService.createProfessional(data);
            const response = {
                success: true,
                message: 'Profesional creado correctamente',
                data: professional,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar un profesional de salud
     * @route PUT /api/professionals/:id
     */
    updateProfessional = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const data = req.body;
            const professional = await this.healthProfessionalService.updateProfessional(id, data);
            const response = {
                success: true,
                message: 'Profesional actualizado correctamente',
                data: professional,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar/desactivar un profesional de salud
     * @route DELETE /api/professionals/:id
     */
    deleteProfessional = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const result = await this.healthProfessionalService.deleteProfessional(id);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Buscar profesionales por especialidad
     * @route GET /api/professionals/specialty/:specialty
     */
    findBySpecialty = async (req, res, next) => {
        try {
            const specialty = req.params.specialty;
            const professionals = await this.healthProfessionalService.findBySpecialty(specialty);
            const response = {
                success: true,
                data: professionals,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.HealthProfessionalController = HealthProfessionalController;
