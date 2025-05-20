"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentTypeController = void 0;
const appointment_type_service_1 = require("../services/appointment-type.service");
const error_handler_1 = require("../../../utils/error-handler");
class AppointmentTypeController {
    appointmentTypeService;
    constructor() {
        this.appointmentTypeService = new appointment_type_service_1.AppointmentTypeService();
    }
    /**
     * Obtener todos los tipos de cita
     * @route GET /api/appointment-types
     */
    getAllTypes = async (req, res, next) => {
        try {
            // Si se solicita solo los activos
            const onlyActive = req.query.active === 'true';
            const types = onlyActive
                ? await this.appointmentTypeService.getActiveTypes()
                : await this.appointmentTypeService.getAllTypes();
            const response = {
                success: true,
                data: types,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener un tipo de cita por ID
     * @route GET /api/appointment-types/:id
     */
    getTypeById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de tipo de cita inválido');
            }
            const type = await this.appointmentTypeService.getTypeById(id);
            const response = {
                success: true,
                data: type,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crear un nuevo tipo de cita
     * @route POST /api/appointment-types
     */
    createType = async (req, res, next) => {
        try {
            const data = req.body;
            const type = await this.appointmentTypeService.createType(data);
            const response = {
                success: true,
                message: 'Tipo de cita creado correctamente',
                data: type,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar un tipo de cita
     * @route PUT /api/appointment-types/:id
     */
    updateType = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de tipo de cita inválido');
            }
            const data = req.body;
            const type = await this.appointmentTypeService.updateType(id, data);
            const response = {
                success: true,
                message: 'Tipo de cita actualizado correctamente',
                data: type,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar/desactivar un tipo de cita
     * @route DELETE /api/appointment-types/:id
     */
    deleteType = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de tipo de cita inválido');
            }
            const result = await this.appointmentTypeService.deleteType(id);
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
exports.AppointmentTypeController = AppointmentTypeController;
