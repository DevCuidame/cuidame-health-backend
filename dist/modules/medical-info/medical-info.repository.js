"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalInfoRepository = void 0;
const allergy_model_1 = require("../../models/allergy.model");
const background_model_1 = require("../../models/background.model");
const condition_model_1 = require("../../models/condition.model");
const error_handler_1 = require("../../utils/error-handler");
const database_1 = require("../../core/config/database");
const diseases_model_1 = require("../../models/diseases.model");
/**
 * Repositorio para gestionar la información médica complementaria de los pacientes
 */
class MedicalInfoRepository {
    allergyRepository;
    conditionRepository;
    backgroundRepository;
    familyBackgroundRepository;
    vaccineRepository;
    diseaseRepository;
    constructor() {
        this.allergyRepository = database_1.AppDataSource.getRepository(allergy_model_1.Allergy);
        this.conditionRepository = database_1.AppDataSource.getRepository(condition_model_1.Condition);
        this.backgroundRepository = database_1.AppDataSource.getRepository(background_model_1.Background);
        this.familyBackgroundRepository = database_1.AppDataSource.getRepository(background_model_1.FamilyBackground);
        this.vaccineRepository = database_1.AppDataSource.getRepository(background_model_1.Vaccine);
        this.diseaseRepository = database_1.AppDataSource.getRepository(diseases_model_1.Disease);
    }
    // Métodos para alergias
    async createAllergy(data) {
        const allergy = this.allergyRepository.create(data);
        return await this.allergyRepository.save(allergy);
    }
    async getAllergyById(id) {
        return await this.allergyRepository.findOne({
            where: { id },
            relations: ['patient']
        });
    }
    async getAllergiesByPatient(patientId) {
        return await this.allergyRepository.find({
            where: { id_paciente: patientId },
            order: { created_at: 'DESC' }
        });
    }
    async updateAllergy(id, data) {
        const allergy = await this.getAllergyById(id);
        if (!allergy) {
            throw new error_handler_1.NotFoundError(`Alergia con ID ${id} no encontrada`);
        }
        await this.allergyRepository.update(id, data);
        return await this.getAllergyById(id);
    }
    async deleteAllergy(id) {
        const allergy = await this.getAllergyById(id);
        if (!allergy) {
            throw new error_handler_1.NotFoundError(`Alergia con ID ${id} no encontrada`);
        }
        const result = await this.allergyRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    // Métodos para condiciones médicas
    async createCondition(data) {
        const condition = this.conditionRepository.create(data);
        return await this.conditionRepository.save(condition);
    }
    async getConditionById(id) {
        return await this.conditionRepository.findOne({
            where: { id },
            relations: ['patient']
        });
    }
    async getConditionByPatient(patientId) {
        return await this.conditionRepository.findOne({
            where: { id_paciente: patientId }
        });
    }
    async updateCondition(id, data) {
        const condition = await this.getConditionById(id);
        if (!condition) {
            throw new error_handler_1.NotFoundError(`Condición médica con ID ${id} no encontrada`);
        }
        await this.conditionRepository.update(id, data);
        return await this.getConditionById(id);
    }
    // Métodos para antecedentes médicos
    async createBackground(data) {
        const background = this.backgroundRepository.create(data);
        return await this.backgroundRepository.save(background);
    }
    async getBackgroundById(id) {
        return await this.backgroundRepository.findOne({
            where: { id },
            relations: ['patient']
        });
    }
    async getBackgroundsByPatient(patientId) {
        return await this.backgroundRepository.find({
            where: { id_paciente: patientId },
            order: { created_at: 'DESC' }
        });
    }
    async updateBackground(id, data) {
        const background = await this.getBackgroundById(id);
        if (!background) {
            throw new error_handler_1.NotFoundError(`Antecedente médico con ID ${id} no encontrado`);
        }
        await this.backgroundRepository.update(id, data);
        return await this.getBackgroundById(id);
    }
    async deleteBackground(id) {
        const background = await this.getBackgroundById(id);
        if (!background) {
            throw new error_handler_1.NotFoundError(`Antecedente médico con ID ${id} no encontrado`);
        }
        const result = await this.backgroundRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    // Métodos para antecedentes familiares
    async createFamilyBackground(data) {
        const familyBackground = this.familyBackgroundRepository.create(data);
        return await this.familyBackgroundRepository.save(familyBackground);
    }
    async getFamilyBackgroundById(id) {
        return await this.familyBackgroundRepository.findOne({
            where: { id },
            relations: ['patient']
        });
    }
    async getFamilyBackgroundsByPatient(patientId) {
        return await this.familyBackgroundRepository.find({
            where: { id_paciente: patientId },
            order: { created_at: 'DESC' }
        });
    }
    async updateFamilyBackground(id, data) {
        const familyBackground = await this.getFamilyBackgroundById(id);
        if (!familyBackground) {
            throw new error_handler_1.NotFoundError(`Antecedente familiar con ID ${id} no encontrado`);
        }
        await this.familyBackgroundRepository.update(id, data);
        return await this.getFamilyBackgroundById(id);
    }
    async deleteFamilyBackground(id) {
        const familyBackground = await this.getFamilyBackgroundById(id);
        if (!familyBackground) {
            throw new error_handler_1.NotFoundError(`Antecedente familiar con ID ${id} no encontrado`);
        }
        const result = await this.familyBackgroundRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    // Métodos para vacunas
    async createVaccine(data) {
        const vaccine = this.vaccineRepository.create(data);
        return await this.vaccineRepository.save(vaccine);
    }
    async getVaccineById(id) {
        return await this.vaccineRepository.findOne({
            where: { id },
            relations: ['patient']
        });
    }
    async getVaccinesByPatient(patientId) {
        return await this.vaccineRepository.find({
            where: { id_paciente: patientId },
            order: { created_at: 'DESC' }
        });
    }
    async updateVaccine(id, data) {
        const vaccine = await this.getVaccineById(id);
        if (!vaccine) {
            throw new error_handler_1.NotFoundError(`Vacuna con ID ${id} no encontrada`);
        }
        await this.vaccineRepository.update(id, data);
        return await this.getVaccineById(id);
    }
    async deleteVaccine(id) {
        const vaccine = await this.getVaccineById(id);
        if (!vaccine) {
            throw new error_handler_1.NotFoundError(`Vacuna con ID ${id} no encontrada`);
        }
        const result = await this.vaccineRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    async createDisease(data) {
        const disease = this.diseaseRepository.create(data);
        return await this.diseaseRepository.save(disease);
    }
    async getDiseaseById(id) {
        return await this.diseaseRepository.findOne({
            where: { id },
            relations: ['patient']
        });
    }
    async getDiseasesByPatient(patientId) {
        return await this.diseaseRepository.find({
            where: { id_paciente: patientId },
            order: { created_at: 'DESC' }
        });
    }
    async updateDisease(id, data) {
        const disease = await this.getDiseaseById(id);
        if (!disease) {
            throw new error_handler_1.NotFoundError(`Enfermedad con ID ${id} no encontrada`);
        }
        await this.diseaseRepository.update(id, data);
        return await this.getDiseaseById(id);
    }
    async deleteDisease(id) {
        const disease = await this.getDiseaseById(id);
        if (!disease) {
            throw new error_handler_1.NotFoundError(`Enfermedad con ID ${id} no encontrada`);
        }
        const result = await this.diseaseRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    // Métodos para obtener todo el historial médico de un paciente
    async getAllMedicalInfo(patientId) {
        const [allergies, condition, backgrounds, familyBackgrounds, vaccines, diseases] = await Promise.all([
            this.getAllergiesByPatient(patientId),
            this.getConditionByPatient(patientId),
            this.getBackgroundsByPatient(patientId),
            this.getFamilyBackgroundsByPatient(patientId),
            this.getVaccinesByPatient(patientId),
            this.getDiseasesByPatient(patientId)
        ]);
        return {
            allergies,
            condition,
            backgrounds,
            familyBackgrounds,
            vaccines,
            diseases
        };
    }
}
exports.MedicalInfoRepository = MedicalInfoRepository;
