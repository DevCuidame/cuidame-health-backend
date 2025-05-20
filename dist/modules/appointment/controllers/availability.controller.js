"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityController = void 0;
const availability_service_1 = require("../services/availability.service");
const error_handler_1 = require("../../../utils/error-handler");
const availability_model_1 = require("../../../models/availability.model");
class AvailabilityController {
    availabilityService;
    constructor() {
        this.availabilityService = new availability_service_1.AvailabilityService();
    }
    /**
     * Obtener disponibilidad de un profesional
     * @route GET /api/availability/professional/:id
     */
    getProfessionalAvailability = async (req, res, next) => {
        try {
            const professionalId = parseInt(req.params.id);
            if (isNaN(professionalId)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const availability = await this.availabilityService.getProfessionalAvailability(professionalId);
            const response = {
                success: true,
                data: availability,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Añadir nuevo horario de disponibilidad
     * @route POST /api/availability
     */
    addAvailability = async (req, res, next) => {
        try {
            const data = req.body;
            // Validar que el día de la semana sea válido
            if (data.day_of_week && !Object.values(availability_model_1.DayOfWeek).includes(data.day_of_week)) {
                throw new error_handler_1.BadRequestError('Día de la semana inválido');
            }
            const availability = await this.availabilityService.addAvailability(data);
            const response = {
                success: true,
                message: 'Horario de disponibilidad añadido correctamente',
                data: availability,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar horario de disponibilidad
     * @route PUT /api/availability/:id
     */
    updateAvailability = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de disponibilidad inválido');
            }
            const data = req.body;
            // Validar que el día de la semana sea válido
            if (data.day_of_week && !Object.values(availability_model_1.DayOfWeek).includes(data.day_of_week)) {
                throw new error_handler_1.BadRequestError('Día de la semana inválido');
            }
            const availability = await this.availabilityService.updateAvailability(id, data);
            const response = {
                success: true,
                message: 'Horario de disponibilidad actualizado correctamente',
                data: availability,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar horario de disponibilidad
     * @route DELETE /api/availability/:id
     */
    deleteAvailability = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de disponibilidad inválido');
            }
            const result = await this.availabilityService.deleteAvailability(id);
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
}
exports.AvailabilityController = AvailabilityController;
