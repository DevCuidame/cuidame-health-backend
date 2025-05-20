"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncMedicalInfoService = void 0;
// src/modules/medical-info/sync-medical-info.service.ts
const medical_info_repository_1 = require("./medical-info.repository");
const medical_info_service_1 = require("./medical-info.service");
class SyncMedicalInfoService {
    medicalInfoService;
    medicalInfoRepository;
    constructor() {
        this.medicalInfoService = new medical_info_service_1.MedicalInfoService();
        this.medicalInfoRepository = new medical_info_repository_1.MedicalInfoRepository();
    }
    /**
     * Función auxiliar para formatear fechas de manera consistente
     */
    formatDateToISOString(date) {
        if (!date)
            return null;
        // Si ya es un string, verificar si tiene formato ISO
        if (typeof date === 'string') {
            // Si es una fecha ISO completa (con hora), extraer solo la parte de la fecha
            if (date.includes('T')) {
                return date.split('T')[0];
            }
            return date; // Devolver tal cual si es solo fecha (YYYY-MM-DD)
        }
        // Si es un objeto Date, convertir a formato ISO y extraer solo la parte de la fecha
        try {
            return date.toISOString().substring(0, 10);
        }
        catch (error) {
            console.error('Error al formatear fecha:', error);
            return null;
        }
    }
    /**
     * Sincroniza las vacunas de un paciente:
     * - Mantiene las que siguen en la nueva lista
     * - Agrega las nuevas
     * - Elimina las que ya no están en la nueva lista
     *
     * @param data DTO con el ID del paciente y array de vacunas
     * @param caregiverId ID del cuidador (opcional)
     * @returns Resultado de la sincronización
     */
    async syncVaccines(data, caregiverId) {
        // Verificar permisos una sola vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // 1. Obtener vacunas actuales del paciente
        const currentVaccines = await this.medicalInfoRepository.getVaccinesByPatient(data.id_paciente);
        // 2. Preparar los resultados
        const result = {
            created: [],
            maintained: [],
            deleted: []
        };
        // 3. Identificar vacunas que ya no están en la nueva lista (a eliminar)
        for (const currentVaccine of currentVaccines) {
            const stillExists = data.vacunas.some(v => v.vacuna.toLowerCase().trim() === currentVaccine.vacuna?.toLowerCase().trim());
            if (!stillExists) {
                result.deleted.push({
                    id: currentVaccine.id,
                    vacuna: currentVaccine.vacuna || 'Desconocida'
                });
                await this.medicalInfoRepository.deleteVaccine(currentVaccine.id);
            }
            else {
                result.maintained.push(currentVaccine);
            }
        }
        // 4. Identificar y crear nuevas vacunas
        for (const newVaccine of data.vacunas) {
            const alreadyExists = currentVaccines.some(v => v.vacuna?.toLowerCase().trim() === newVaccine.vacuna.toLowerCase().trim());
            if (!alreadyExists) {
                const created = await this.medicalInfoService.createVaccine({
                    id_paciente: data.id_paciente,
                    vacuna: newVaccine.vacuna
                }, undefined); // No verificamos permisos de nuevo
                result.created.push(created);
            }
        }
        return result;
    }
    /**
     * Sincroniza las alergias de un paciente:
     * - Mantiene las que siguen en la nueva lista
     * - Agrega las nuevas
     * - Elimina las que ya no están en la nueva lista
     *
     * @param data DTO con el ID del paciente y array de alergias
     * @param caregiverId ID del cuidador (opcional)
     * @returns Resultado de la sincronización
     */
    async syncAllergies(data, caregiverId) {
        // Verificar permisos una sola vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // 1. Obtener alergias actuales del paciente
        const currentAllergies = await this.medicalInfoRepository.getAllergiesByPatient(data.id_paciente);
        // 2. Preparar los resultados
        const result = {
            created: [],
            maintained: [],
            deleted: []
        };
        // 3. Identificar alergias que ya no están en la nueva lista (a eliminar)
        for (const currentAllergy of currentAllergies) {
            // Para alergias, comparamos tipo y descripción, ya que podrían haber múltiples del mismo tipo
            const stillExists = data.alergias.some(a => a.tipo_alergia.toLowerCase().trim() === currentAllergy.tipo_alergia?.toLowerCase().trim() &&
                ((!a.descripcion && !currentAllergy.descripcion) ||
                    (a.descripcion?.toLowerCase().trim() === currentAllergy.descripcion?.toLowerCase().trim())));
            if (!stillExists) {
                result.deleted.push({
                    id: currentAllergy.id,
                    tipo_alergia: currentAllergy.tipo_alergia || 'Desconocida'
                });
                await this.medicalInfoRepository.deleteAllergy(currentAllergy.id);
            }
            else {
                result.maintained.push(currentAllergy);
            }
        }
        // 4. Identificar y crear nuevas alergias
        for (const newAllergy of data.alergias) {
            const alreadyExists = currentAllergies.some(a => a.tipo_alergia?.toLowerCase().trim() === newAllergy.tipo_alergia.toLowerCase().trim() &&
                ((!a.descripcion && !newAllergy.descripcion) ||
                    (a.descripcion?.toLowerCase().trim() === newAllergy.descripcion?.toLowerCase().trim())));
            if (!alreadyExists) {
                const created = await this.medicalInfoService.createAllergy({
                    id_paciente: data.id_paciente,
                    tipo_alergia: newAllergy.tipo_alergia,
                    descripcion: newAllergy.descripcion
                }, undefined); // No verificamos permisos de nuevo
                result.created.push(created);
            }
        }
        return result;
    }
    /**
     * Sincroniza los antecedentes médicos de un paciente:
     * - Mantiene los que siguen en la nueva lista
     * - Agrega los nuevos
     * - Elimina los que ya no están en la nueva lista
     *
     * @param data DTO con el ID del paciente y array de antecedentes
     * @param caregiverId ID del cuidador (opcional)
     * @returns Resultado de la sincronización
     */
    async syncBackgrounds(data, caregiverId) {
        // Verificar permisos una sola vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // 1. Obtener antecedentes actuales del paciente
        const currentBackgrounds = await this.medicalInfoRepository.getBackgroundsByPatient(data.id_paciente);
        // 2. Preparar los resultados
        const result = {
            created: [],
            maintained: [],
            deleted: []
        };
        // 3. Identificar antecedentes que ya no están en la nueva lista (a eliminar)
        for (const currentBackground of currentBackgrounds) {
            // Comparamos tipo, descripción y fecha (si existe)
            const stillExists = data.antecedentes.some(b => b.tipo_antecedente.toLowerCase().trim() === currentBackground.tipo_antecedente?.toLowerCase().trim() &&
                ((!b.descripcion_antecedente && !currentBackground.descripcion_antecedente) ||
                    (b.descripcion_antecedente?.toLowerCase().trim() === currentBackground.descripcion_antecedente?.toLowerCase().trim())) &&
                ((!b.fecha_antecedente && !currentBackground.fecha_antecedente) ||
                    (b.fecha_antecedente === this.formatDateToISOString(currentBackground.fecha_antecedente))));
            if (!stillExists) {
                result.deleted.push({
                    id: currentBackground.id,
                    tipo_antecedente: currentBackground.tipo_antecedente || 'Desconocido'
                });
                await this.medicalInfoRepository.deleteBackground(currentBackground.id);
            }
            else {
                result.maintained.push(currentBackground);
            }
        }
        // 4. Identificar y crear nuevos antecedentes
        for (const newBackground of data.antecedentes) {
            const alreadyExists = currentBackgrounds.some(b => b.tipo_antecedente?.toLowerCase().trim() === newBackground.tipo_antecedente.toLowerCase().trim() &&
                ((!b.descripcion_antecedente && !newBackground.descripcion_antecedente) ||
                    (b.descripcion_antecedente?.toLowerCase().trim() === newBackground.descripcion_antecedente?.toLowerCase().trim())) &&
                ((!b.fecha_antecedente && !newBackground.fecha_antecedente) ||
                    (this.formatDateToISOString(b.fecha_antecedente) === newBackground.fecha_antecedente)));
            if (!alreadyExists) {
                const created = await this.medicalInfoService.createBackground({
                    id_paciente: data.id_paciente,
                    tipo_antecedente: newBackground.tipo_antecedente,
                    descripcion_antecedente: newBackground.descripcion_antecedente,
                    fecha_antecedente: newBackground.fecha_antecedente
                }, undefined); // No verificamos permisos de nuevo
                result.created.push(created);
            }
        }
        return result;
    }
    /**
     * Sincroniza los antecedentes familiares de un paciente:
     * - Mantiene los que siguen en la nueva lista
     * - Agrega los nuevos
     * - Elimina los que ya no están en la nueva lista
     *
     * @param data DTO con el ID del paciente y array de antecedentes familiares
     * @param caregiverId ID del cuidador (opcional)
     * @returns Resultado de la sincronización
     */
    async syncFamilyBackgrounds(data, caregiverId) {
        // Verificar permisos una sola vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // 1. Obtener antecedentes familiares actuales del paciente
        const currentFamilyBackgrounds = await this.medicalInfoRepository.getFamilyBackgroundsByPatient(data.id_paciente);
        // 2. Preparar los resultados
        const result = {
            created: [],
            maintained: [],
            deleted: []
        };
        // 3. Identificar antecedentes familiares que ya no están en la nueva lista (a eliminar)
        for (const currentFamilyBackground of currentFamilyBackgrounds) {
            // Comparamos tipo, parentesco y descripción
            const stillExists = data.antecedentes_familiares.some(fb => fb.tipo_antecedente.toLowerCase().trim() === currentFamilyBackground.tipo_antecedente?.toLowerCase().trim() &&
                fb.parentesco.toLowerCase().trim() === currentFamilyBackground.parentesco?.toLowerCase().trim() &&
                ((!fb.descripcion_antecedente && !currentFamilyBackground.descripcion_antecedente) ||
                    (fb.descripcion_antecedente?.toLowerCase().trim() === currentFamilyBackground.descripcion_antecedente?.toLowerCase().trim())));
            if (!stillExists) {
                result.deleted.push({
                    id: currentFamilyBackground.id,
                    tipo_antecedente: currentFamilyBackground.tipo_antecedente || 'Desconocido',
                    parentesco: currentFamilyBackground.parentesco || 'Desconocido'
                });
                await this.medicalInfoRepository.deleteFamilyBackground(currentFamilyBackground.id);
            }
            else {
                result.maintained.push(currentFamilyBackground);
            }
        }
        // 4. Identificar y crear nuevos antecedentes familiares
        for (const newFamilyBackground of data.antecedentes_familiares) {
            const alreadyExists = currentFamilyBackgrounds.some(fb => fb.tipo_antecedente?.toLowerCase().trim() === newFamilyBackground.tipo_antecedente.toLowerCase().trim() &&
                fb.parentesco?.toLowerCase().trim() === newFamilyBackground.parentesco.toLowerCase().trim() &&
                ((!fb.descripcion_antecedente && !newFamilyBackground.descripcion_antecedente) ||
                    (fb.descripcion_antecedente?.toLowerCase().trim() === newFamilyBackground.descripcion_antecedente?.toLowerCase().trim())));
            if (!alreadyExists) {
                const created = await this.medicalInfoService.createFamilyBackground({
                    id_paciente: data.id_paciente,
                    tipo_antecedente: newFamilyBackground.tipo_antecedente,
                    parentesco: newFamilyBackground.parentesco,
                    descripcion_antecedente: newFamilyBackground.descripcion_antecedente
                }, undefined); // No verificamos permisos de nuevo
                result.created.push(created);
            }
        }
        return result;
    }
    /**
     * Sincroniza las enfermedades de un paciente:
     * - Mantiene las que siguen en la nueva lista
     * - Agrega las nuevas
     * - Elimina las que ya no están en la nueva lista
     *
     * @param data DTO con el ID del paciente y array de enfermedades
     * @param caregiverId ID del cuidador (opcional)
     * @returns Resultado de la sincronización
     */
    async syncDiseases(data, caregiverId) {
        // Verificar permisos una sola vez
        if (caregiverId) {
            await this.medicalInfoService['verifyAccess'](data.id_paciente, caregiverId);
        }
        // 1. Obtener enfermedades actuales del paciente
        const currentDiseases = await this.medicalInfoRepository.getDiseasesByPatient(data.id_paciente);
        // 2. Preparar los resultados
        const result = {
            created: [],
            maintained: [],
            deleted: []
        };
        // 3. Identificar enfermedades que ya no están en la nueva lista (a eliminar)
        for (const currentDisease of currentDiseases) {
            const stillExists = data.enfermedades.some(d => d.enfermedad.toLowerCase().trim() === currentDisease.enfermedad?.toLowerCase().trim());
            if (!stillExists) {
                result.deleted.push({
                    id: currentDisease.id,
                    enfermedad: currentDisease.enfermedad || 'Desconocida'
                });
                await this.medicalInfoRepository.deleteDisease(currentDisease.id);
            }
            else {
                result.maintained.push(currentDisease);
            }
        }
        // 4. Identificar y crear nuevas enfermedades
        for (const newDisease of data.enfermedades) {
            const alreadyExists = currentDiseases.some(d => d.enfermedad?.toLowerCase().trim() === newDisease.enfermedad.toLowerCase().trim());
            if (!alreadyExists) {
                const created = await this.medicalInfoService.createDisease({
                    id_paciente: data.id_paciente,
                    enfermedad: newDisease.enfermedad
                }, undefined); // No verificamos permisos de nuevo
                result.created.push(created);
            }
        }
        return result;
    }
}
exports.SyncMedicalInfoService = SyncMedicalInfoService;
