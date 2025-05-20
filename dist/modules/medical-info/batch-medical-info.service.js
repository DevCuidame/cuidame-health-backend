"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMedicalInfoService = void 0;
const medical_info_service_1 = require("./medical-info.service");
class BatchMedicalInfoService {
    medicalInfoService;
    constructor() {
        this.medicalInfoService = new medical_info_service_1.MedicalInfoService();
    }
    /**
     * Crea múltiples vacunas para un paciente en una sola operación
     * @param data DTO con el ID del paciente y array de vacunas
     * @param caregiverId ID del cuidador (opcional)
     * @returns Array de vacunas creadas
     */
    async createBatchVaccines(data, caregiverId) {
        const results = [];
        // Verificar permisos solo una vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // Procesar todas las vacunas de forma secuencial
        for (const vaccineData of data.vacunas) {
            const vaccine = await this.medicalInfoService.createVaccine({
                id_paciente: data.id_paciente,
                vacuna: vaccineData.vacuna,
            }, undefined); // No verificamos permisos de nuevo
            results.push(vaccine);
        }
        return results;
    }
    /**
     * Crea múltiples alergias para un paciente en una sola operación
     * @param data DTO con el ID del paciente y array de alergias
     * @param caregiverId ID del cuidador (opcional)
     * @returns Array de alergias creadas
     */
    async createBatchAllergies(data, caregiverId) {
        const results = [];
        // Verificar permisos solo una vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // Procesar todas las alergias de forma secuencial
        for (const allergyData of data.alergias) {
            const allergy = await this.medicalInfoService.createAllergy({
                id_paciente: data.id_paciente,
                tipo_alergia: allergyData.tipo_alergia,
                descripcion: allergyData.descripcion,
            }, undefined); // No verificamos permisos de nuevo
            results.push(allergy);
        }
        return results;
    }
    /**
     * Crea múltiples antecedentes médicos para un paciente en una sola operación
     * @param data DTO con el ID del paciente y array de antecedentes
     * @param caregiverId ID del cuidador (opcional)
     * @returns Array de antecedentes creados
     */
    async createBatchBackgrounds(data, caregiverId) {
        const results = [];
        // Verificar permisos solo una vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // Procesar todos los antecedentes de forma secuencial
        for (const backgroundData of data.antecedentes) {
            const background = await this.medicalInfoService.createBackground({
                id_paciente: data.id_paciente,
                tipo_antecedente: backgroundData.tipo_antecedente,
                descripcion_antecedente: backgroundData.descripcion_antecedente,
                fecha_antecedente: backgroundData.fecha_antecedente,
            }, undefined); // No verificamos permisos de nuevo
            results.push(background);
        }
        return results;
    }
    /**
     * Crea múltiples antecedentes familiares para un paciente en una sola operación
     * @param data DTO con el ID del paciente y array de antecedentes familiares
     * @param caregiverId ID del cuidador (opcional)
     * @returns Array de antecedentes familiares creados
     */
    async createBatchFamilyBackgrounds(data, caregiverId) {
        const results = [];
        // Verificar permisos solo una vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // Procesar todos los antecedentes familiares de forma secuencial
        for (const familyBackgroundData of data.antecedentes_familiares) {
            const familyBackground = await this.medicalInfoService.createFamilyBackground({
                id_paciente: data.id_paciente,
                tipo_antecedente: familyBackgroundData.tipo_antecedente,
                parentesco: familyBackgroundData.parentesco,
                descripcion_antecedente: familyBackgroundData.descripcion_antecedente,
            }, undefined); // No verificamos permisos de nuevo
            results.push(familyBackground);
        }
        return results;
    }
    /**
     * Crea múltiples enfermedades para un paciente en una sola operación
     * @param data DTO con el ID del paciente y array de enfermedades
     * @param caregiverId ID del cuidador (opcional)
     * @returns Array de enfermedades creadas
     */
    async createBatchDiseases(data, caregiverId) {
        const results = [];
        // Verificar permisos solo una vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // Procesar todas las enfermedades de forma secuencial
        for (const diseaseData of data.enfermedades) {
            const disease = await this.medicalInfoService.createDisease({
                id_paciente: data.id_paciente,
                enfermedad: diseaseData.enfermedad,
            }, undefined); // No verificamos permisos de nuevo
            results.push(disease);
        }
        return results;
    }
}
exports.BatchMedicalInfoService = BatchMedicalInfoService;
