"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionService = void 0;
const patient_repository_1 = require("../patient/patient.repository");
const error_handler_1 = require("../../utils/error-handler");
const medical_info_repository_1 = require("../../modules/medical-info/medical-info.repository");
class ConditionService {
    medicalInfoRepository;
    patientRepository;
    constructor() {
        this.medicalInfoRepository = new medical_info_repository_1.MedicalInfoRepository();
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
     * Crea o actualiza la condición de un paciente
     * @param data Datos de la condición
     * @param caregiverId ID del cuidador (si aplica)
     * @returns Condición creada o actualizada
     */
    async saveCondition(data, caregiverId) {
        // Verificar permisos
        await this.verifyAccess(data.id_paciente, caregiverId);
        // Verificar si ya existe una condición para este paciente
        const existingCondition = await this.medicalInfoRepository.getConditionByPatient(data.id_paciente);
        if (existingCondition) {
            // Actualizar condición existente
            return await this.medicalInfoRepository.updateCondition(existingCondition.id, {
                ...data,
                updated_at: new Date()
            });
        }
        else {
            // Crear nueva condición
            return await this.medicalInfoRepository.createCondition({
                ...data,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }
    /**
     * Obtiene la condición de un paciente
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador (si aplica)
     * @returns Condición del paciente o null si no existe
     */
    async getConditionByPatient(patientId, caregiverId) {
        // Verificar permisos
        await this.verifyAccess(patientId, caregiverId);
        // Obtener condición del paciente
        return await this.medicalInfoRepository.getConditionByPatient(patientId);
    }
}
exports.ConditionService = ConditionService;
