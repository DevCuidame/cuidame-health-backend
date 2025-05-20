"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentTypeService = void 0;
// src/modules/appointment/appointment-type.service.ts
const appointment_type_repository_1 = require("../repositories/appointment-type.repository");
const error_handler_1 = require("../../../utils/error-handler");
class AppointmentTypeService {
    appointmentTypeRepository;
    constructor() {
        this.appointmentTypeRepository = new appointment_type_repository_1.AppointmentTypeRepository();
    }
    /**
     * Obtener todos los tipos de cita
     */
    async getAllTypes() {
        return await this.appointmentTypeRepository.findAll();
    }
    /**
     * Obtener tipos de cita activos
     */
    async getActiveTypes() {
        return await this.appointmentTypeRepository.getActiveTypes();
    }
    /**
     * Obtener un tipo de cita por ID
     */
    async getTypeById(id) {
        const appointmentType = await this.appointmentTypeRepository.findById(id);
        if (!appointmentType) {
            throw new error_handler_1.NotFoundError(`Tipo de cita con ID ${id} no encontrado`);
        }
        return appointmentType;
    }
    /**
     * Crear un nuevo tipo de cita
     */
    async createType(data) {
        // Verificar si ya existe un tipo con el mismo nombre
        const existingTypes = await this.appointmentTypeRepository.findAll({
            where: { name: data.name }
        });
        if (existingTypes && existingTypes.length > 0) {
            throw new error_handler_1.BadRequestError(`Ya existe un tipo de cita con el nombre ${data.name}`);
        }
        return await this.appointmentTypeRepository.create(data);
    }
    /**
     * Actualizar un tipo de cita
     */
    async updateType(id, data) {
        // Verificar que el tipo existe
        await this.getTypeById(id);
        // Si se está actualizando el nombre, verificar que no exista otro tipo con ese nombre
        if (data.name) {
            const existingTypes = await this.appointmentTypeRepository.findAll({
                where: { name: data.name }
            });
            if (existingTypes && existingTypes.length > 0 && existingTypes[0].id !== id) {
                throw new error_handler_1.BadRequestError(`Ya existe un tipo de cita con el nombre ${data.name}`);
            }
        }
        return await this.appointmentTypeRepository.update(id, data, 'Tipo de cita');
    }
    /**
     * Eliminar/desactivar un tipo de cita
     */
    async deleteType(id) {
        // Verificar que el tipo existe
        await this.getTypeById(id);
        // En lugar de eliminar, marcar como inactivo
        await this.appointmentTypeRepository.update(id, { is_active: false }, 'Tipo de cita');
        return {
            success: true,
            message: 'Tipo de cita desactivado correctamente'
        };
    }
}
exports.AppointmentTypeService = AppointmentTypeService;
