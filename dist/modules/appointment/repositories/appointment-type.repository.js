"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentTypeRepository = void 0;
// src/modules/appointment/appointment-type.repository.ts
const base_repository_1 = require("../../../core/repositories/base.repository");
const appointment_type_model_1 = require("../../../models/appointment-type.model");
class AppointmentTypeRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(appointment_type_model_1.AppointmentType);
    }
    /**
     * Obtener todos los tipos de cita activos
     */
    async getActiveTypes() {
        return await this.repository.find({
            where: { is_active: true },
            order: { name: 'ASC' }
        });
    }
}
exports.AppointmentTypeRepository = AppointmentTypeRepository;
