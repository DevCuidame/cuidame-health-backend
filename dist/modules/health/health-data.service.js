"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthDataService = void 0;
// src/modules/health-data/health-data.service.ts
const health_data_repository_1 = require("./health-data.repository");
const patient_repository_1 = require("../patient/patient.repository");
const error_handler_1 = require("../../utils/error-handler");
class HealthDataService {
    healthDataRepository;
    patientRepository;
    constructor() {
        this.healthDataRepository = new health_data_repository_1.HealthDataRepository();
        this.patientRepository = new patient_repository_1.PatientRepository();
    }
    /**
     * Verificar permisos para acceder a los datos de un paciente
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador (si aplica)
     */
    async verifyAccess(patientId, caregiverId) {
        // Si no se proporciona ID de cuidador, no verificar permisos
        if (!caregiverId)
            return;
        const hasAccess = await this.patientRepository.belongsToCaregiver(patientId, caregiverId);
        if (!hasAccess) {
            throw new error_handler_1.ForbiddenError('No tienes permiso para acceder a los datos de este paciente');
        }
    }
    /**
     * Obtiene todos los datos de salud de un paciente por su ID
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador (opcional, para verificar permisos)
     * @returns Datos de salud del paciente
     */
    async getHealthDataById(patientId, caregiverId) {
        // Verificar que el paciente existe
        const patientExists = await this.patientRepository.exists({ id: patientId });
        if (!patientExists) {
            throw new error_handler_1.NotFoundError(`Paciente con ID ${patientId} no encontrado`);
        }
        // Verificar permisos
        await this.verifyAccess(patientId, caregiverId);
        // Obtener datos de salud
        const healthData = await this.healthDataRepository.getHealthDataById(patientId);
        if (!healthData) {
            throw new error_handler_1.NotFoundError(`No se encontraron datos de salud para el paciente con ID ${patientId}`);
        }
        return healthData;
    }
}
exports.HealthDataService = HealthDataService;
