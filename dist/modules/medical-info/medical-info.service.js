"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalInfoService = void 0;
const patient_repository_1 = require("../../modules/patient/patient.repository");
const medical_info_repository_1 = require("./medical-info.repository");
const error_handler_1 = require("../../utils/error-handler");
class MedicalInfoService {
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
    // Métodos para alergias
    async createAllergy(data, caregiverId) {
        await this.verifyAccess(data.id_paciente, caregiverId);
        return await this.medicalInfoRepository.createAllergy({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    async getAllergyById(id, caregiverId) {
        const allergy = await this.medicalInfoRepository.getAllergyById(id);
        if (!allergy) {
            throw new error_handler_1.NotFoundError(`Alergia con ID ${id} no encontrada`);
        }
        await this.verifyAccess(allergy.id_paciente, caregiverId);
        return allergy;
    }
    async getAllergiesByPatient(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.medicalInfoRepository.getAllergiesByPatient(patientId);
    }
    async updateAllergy(id, data, caregiverId) {
        const allergy = await this.getAllergyById(id, caregiverId);
        return await this.medicalInfoRepository.updateAllergy(id, {
            ...data,
            updated_at: new Date()
        });
    }
    async deleteAllergy(id, caregiverId) {
        const allergy = await this.getAllergyById(id, caregiverId);
        const result = await this.medicalInfoRepository.deleteAllergy(id);
        return {
            success: result,
            message: result ? 'Alergia eliminada correctamente' : 'No se pudo eliminar la alergia'
        };
    }
    // Métodos para condiciones médicas
    async createOrUpdateCondition(data, caregiverId) {
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
    async getConditionByPatient(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.medicalInfoRepository.getConditionByPatient(patientId);
    }
    // Métodos para antecedentes médicos
    async createBackground(data, caregiverId) {
        await this.verifyAccess(data.id_paciente, caregiverId);
        return await this.medicalInfoRepository.createBackground({
            ...data,
            fecha_antecedente: data.fecha_antecedente ? new Date(data.fecha_antecedente) : undefined,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    async getBackgroundById(id, caregiverId) {
        const background = await this.medicalInfoRepository.getBackgroundById(id);
        if (!background) {
            throw new error_handler_1.NotFoundError(`Antecedente médico con ID ${id} no encontrado`);
        }
        await this.verifyAccess(background.id_paciente, caregiverId);
        return background;
    }
    async getBackgroundsByPatient(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.medicalInfoRepository.getBackgroundsByPatient(patientId);
    }
    async updateBackground(id, data, caregiverId) {
        const background = await this.getBackgroundById(id, caregiverId);
        return await this.medicalInfoRepository.updateBackground(id, {
            ...data,
            fecha_antecedente: data.fecha_antecedente ? new Date(data.fecha_antecedente) : undefined,
            updated_at: new Date()
        });
    }
    async deleteBackground(id, caregiverId) {
        const background = await this.getBackgroundById(id, caregiverId);
        const result = await this.medicalInfoRepository.deleteBackground(id);
        return {
            success: result,
            message: result ? 'Antecedente médico eliminado correctamente' : 'No se pudo eliminar el antecedente médico'
        };
    }
    // Métodos para antecedentes familiares
    async createFamilyBackground(data, caregiverId) {
        await this.verifyAccess(data.id_paciente, caregiverId);
        return await this.medicalInfoRepository.createFamilyBackground({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    async getFamilyBackgroundById(id, caregiverId) {
        const familyBackground = await this.medicalInfoRepository.getFamilyBackgroundById(id);
        if (!familyBackground) {
            throw new error_handler_1.NotFoundError(`Antecedente familiar con ID ${id} no encontrado`);
        }
        await this.verifyAccess(familyBackground.id_paciente, caregiverId);
        return familyBackground;
    }
    async getFamilyBackgroundsByPatient(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.medicalInfoRepository.getFamilyBackgroundsByPatient(patientId);
    }
    async updateFamilyBackground(id, data, caregiverId) {
        const familyBackground = await this.getFamilyBackgroundById(id, caregiverId);
        return await this.medicalInfoRepository.updateFamilyBackground(id, {
            ...data,
            updated_at: new Date()
        });
    }
    async deleteFamilyBackground(id, caregiverId) {
        const familyBackground = await this.getFamilyBackgroundById(id, caregiverId);
        const result = await this.medicalInfoRepository.deleteFamilyBackground(id);
        return {
            success: result,
            message: result ? 'Antecedente familiar eliminado correctamente' : 'No se pudo eliminar el antecedente familiar'
        };
    }
    // Métodos para vacunas
    async createVaccine(data, caregiverId) {
        await this.verifyAccess(data.id_paciente, caregiverId);
        return await this.medicalInfoRepository.createVaccine({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    async getVaccineById(id, caregiverId) {
        const vaccine = await this.medicalInfoRepository.getVaccineById(id);
        if (!vaccine) {
            throw new error_handler_1.NotFoundError(`Vacuna con ID ${id} no encontrada`);
        }
        await this.verifyAccess(vaccine.id_paciente, caregiverId);
        return vaccine;
    }
    async getVaccinesByPatient(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.medicalInfoRepository.getVaccinesByPatient(patientId);
    }
    async updateVaccine(id, data, caregiverId) {
        const vaccine = await this.getVaccineById(id, caregiverId);
        return await this.medicalInfoRepository.updateVaccine(id, {
            ...data,
            updated_at: new Date()
        });
    }
    async deleteVaccine(id, caregiverId) {
        const vaccine = await this.getVaccineById(id, caregiverId);
        const result = await this.medicalInfoRepository.deleteVaccine(id);
        return {
            success: result,
            message: result ? 'Vacuna eliminada correctamente' : 'No se pudo eliminar la vacuna'
        };
    }
    // Método para obtener todo el historial médico de un paciente
    async getAllMedicalInfo(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.medicalInfoRepository.getAllMedicalInfo(patientId);
    }
    async createDisease(data, caregiverId) {
        await this.verifyAccess(data.id_paciente, caregiverId);
        return await this.medicalInfoRepository.createDisease({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    async getDiseaseById(id, caregiverId) {
        const disease = await this.medicalInfoRepository.getDiseaseById(id);
        if (!disease) {
            throw new error_handler_1.NotFoundError(`Enfermedad con ID ${id} no encontrada`);
        }
        await this.verifyAccess(disease.id_paciente, caregiverId);
        return disease;
    }
    async getDiseasesByPatient(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.medicalInfoRepository.getDiseasesByPatient(patientId);
    }
    async updateDisease(id, data, caregiverId) {
        const disease = await this.getDiseaseById(id, caregiverId);
        return await this.medicalInfoRepository.updateDisease(id, {
            ...data,
            updated_at: new Date()
        });
    }
    async deleteDisease(id, caregiverId) {
        const disease = await this.getDiseaseById(id, caregiverId);
        const result = await this.medicalInfoRepository.deleteDisease(id);
        return {
            success: result,
            message: result ? 'Enfermedad eliminada correctamente' : 'No se pudo eliminar la enfermedad'
        };
    }
}
exports.MedicalInfoService = MedicalInfoService;
