"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeBlockController = void 0;
const time_block_service_1 = require("../services/time-block.service");
const error_handler_1 = require("../../../utils/error-handler");
class TimeBlockController {
    timeBlockService;
    constructor() {
        this.timeBlockService = new time_block_service_1.TimeBlockService();
    }
    /**
     * Crear un nuevo bloque de tiempo
     * @route POST /api/time-blocks
     */
    createTimeBlock = async (req, res, next) => {
        try {
            const data = req.body;
            const userId = req.user?.id;
            // Convertir las fechas de string a Date si es necesario
            if (typeof data.start_time === 'string') {
                data.start_time = new Date(data.start_time);
            }
            if (typeof data.end_time === 'string') {
                data.end_time = new Date(data.end_time);
            }
            const timeBlock = await this.timeBlockService.createTimeBlock(data, userId);
            const response = {
                success: true,
                message: 'Bloque de tiempo creado correctamente',
                data: timeBlock,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener bloque de tiempo por ID
     * @route GET /api/time-blocks/:id
     */
    getTimeBlockById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de bloque de tiempo inválido');
            }
            const timeBlock = await this.timeBlockService.getTimeBlockById(id);
            const response = {
                success: true,
                data: timeBlock,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener bloques de tiempo por profesional
     * @route GET /api/time-blocks/professional/:id
     */
    getTimeBlocksByProfessional = async (req, res, next) => {
        try {
            const professionalId = parseInt(req.params.id);
            if (isNaN(professionalId)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            const timeBlocks = await this.timeBlockService.getTimeBlocksByProfessional(professionalId);
            const response = {
                success: true,
                data: timeBlocks,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar un bloque de tiempo
     * @route PUT /api/time-blocks/:id
     */
    updateTimeBlock = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de bloque de tiempo inválido');
            }
            const data = req.body;
            const userId = req.user?.id;
            // Convertir las fechas de string a Date si es necesario
            if (typeof data.start_time === 'string') {
                data.start_time = new Date(data.start_time);
            }
            if (typeof data.end_time === 'string') {
                data.end_time = new Date(data.end_time);
            }
            const timeBlock = await this.timeBlockService.updateTimeBlock(id, data, userId);
            const response = {
                success: true,
                message: 'Bloque de tiempo actualizado correctamente',
                data: timeBlock,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar un bloque de tiempo
     * @route DELETE /api/time-blocks/:id
     */
    deleteTimeBlock = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de bloque de tiempo inválido');
            }
            const result = await this.timeBlockService.deleteTimeBlock(id);
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
exports.TimeBlockController = TimeBlockController;
