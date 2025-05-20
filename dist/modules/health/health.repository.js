"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRepository = void 0;
const vitals_models_1 = require("../../models/vitals.models");
const database_1 = require("../../core/config/database");
const typeorm_1 = require("typeorm");
/**
 * Repositorio para gestionar los signos vitales de los pacientes
 */
class HealthRepository {
    heartRateRepository;
    bloodPressureRepository;
    bloodGlucoseRepository;
    bloodOxygenRepository;
    respiratoryRateRepository;
    constructor() {
        this.heartRateRepository = database_1.AppDataSource.getRepository(vitals_models_1.HeartRate);
        this.bloodPressureRepository = database_1.AppDataSource.getRepository(vitals_models_1.BloodPressure);
        this.bloodGlucoseRepository = database_1.AppDataSource.getRepository(vitals_models_1.BloodGlucose);
        this.bloodOxygenRepository = database_1.AppDataSource.getRepository(vitals_models_1.BloodOxygen);
        this.respiratoryRateRepository =
            database_1.AppDataSource.getRepository(vitals_models_1.RespiratoryRate);
    }
    // Métodos para frecuencia cardíaca
    async createHeartRate(data) {
        const heartRate = this.heartRateRepository.create(data);
        return await this.heartRateRepository.save(heartRate);
    }
    async getHeartRateById(id) {
        return await this.heartRateRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
    }
    async getHeartRatesByPatient(patientId, startDate, endDate) {
        const query = { patient_id: patientId };
        if (startDate && endDate) {
            query.date = (0, typeorm_1.Between)(startDate, endDate);
        }
        else if (startDate) {
            query.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        else if (endDate) {
            query.date = (0, typeorm_1.LessThanOrEqual)(endDate);
        }
        return await this.heartRateRepository.find({
            where: query,
            order: { date: 'DESC' },
        });
    }
    async getLatestHeartRate(patientId) {
        return await this.heartRateRepository.findOne({
            where: { patient_id: patientId },
            order: { date: 'DESC' },
        });
    }
    // Métodos para presión arterial
    async createBloodPressure(data) {
        const bloodPressure = this.bloodPressureRepository.create(data);
        return await this.bloodPressureRepository.save(bloodPressure);
    }
    async getBloodPressureById(id) {
        return await this.bloodPressureRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
    }
    async getBloodPressuresByPatient(patientId, startDate, endDate) {
        const query = { patient_id: patientId };
        if (startDate && endDate) {
            query.date = (0, typeorm_1.Between)(startDate, endDate);
        }
        else if (startDate) {
            query.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        else if (endDate) {
            query.date = (0, typeorm_1.LessThanOrEqual)(endDate);
        }
        return await this.bloodPressureRepository.find({
            where: query,
            order: { date: 'DESC' },
        });
    }
    async getLatestBloodPressure(patientId) {
        return await this.bloodPressureRepository.findOne({
            where: { patient_id: patientId },
            order: { date: 'DESC' },
        });
    }
    // Métodos para glucosa en sangre
    async createBloodGlucose(data) {
        const bloodGlucose = this.bloodGlucoseRepository.create(data);
        return await this.bloodGlucoseRepository.save(bloodGlucose);
    }
    async getBloodGlucoseById(id) {
        return await this.bloodGlucoseRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
    }
    async getBloodGlucosesByPatient(patientId, startDate, endDate) {
        const query = { patient_id: patientId };
        if (startDate && endDate) {
            query.date = (0, typeorm_1.Between)(startDate, endDate);
        }
        else if (startDate) {
            query.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        else if (endDate) {
            query.date = (0, typeorm_1.LessThanOrEqual)(endDate);
        }
        return await this.bloodGlucoseRepository.find({
            where: query,
            order: { date: 'DESC' },
        });
    }
    async getLatestBloodGlucose(patientId) {
        return await this.bloodGlucoseRepository.findOne({
            where: { patient_id: patientId },
            order: { date: 'DESC' },
        });
    }
    // Métodos para oxígeno en sangre
    async createBloodOxygen(data) {
        const bloodOxygen = this.bloodOxygenRepository.create(data);
        return await this.bloodOxygenRepository.save(bloodOxygen);
    }
    async getBloodOxygenById(id) {
        return await this.bloodOxygenRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
    }
    async getBloodOxygensByPatient(patientId, startDate, endDate) {
        const query = { patient_id: patientId };
        if (startDate && endDate) {
            query.date = (0, typeorm_1.Between)(startDate, endDate);
        }
        else if (startDate) {
            query.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        else if (endDate) {
            query.date = (0, typeorm_1.LessThanOrEqual)(endDate);
        }
        return await this.bloodOxygenRepository.find({
            where: query,
            order: { date: 'DESC' },
        });
    }
    async getLatestBloodOxygen(patientId) {
        return await this.bloodOxygenRepository.findOne({
            where: { patient_id: patientId },
            order: { date: 'DESC' },
        });
    }
    // Métodos para frecuencia respiratoria
    async createRespiratoryRate(data) {
        const respiratoryRate = this.respiratoryRateRepository.create(data);
        return await this.respiratoryRateRepository.save(respiratoryRate);
    }
    async getRespiratoryRateById(id) {
        return await this.respiratoryRateRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
    }
    async getRespiratoryRatesByPatient(patientId, startDate, endDate) {
        const query = { patient_id: patientId };
        if (startDate && endDate) {
            query.date = (0, typeorm_1.Between)(startDate, endDate);
        }
        else if (startDate) {
            query.date = (0, typeorm_1.MoreThanOrEqual)(startDate);
        }
        else if (endDate) {
            query.date = (0, typeorm_1.LessThanOrEqual)(endDate);
        }
        return await this.respiratoryRateRepository.find({
            where: query,
            order: { date: 'DESC' },
        });
    }
    async getLatestRespiratoryRate(patientId) {
        return await this.respiratoryRateRepository.findOne({
            where: { patient_id: patientId },
            order: { date: 'DESC' },
        });
    }
    // Método para eliminar un registro de frecuencia cardíaca
    async deleteHeartRate(id) {
        const result = await this.heartRateRepository.delete(id);
        return (result.affected !== undefined &&
            result.affected !== null &&
            result.affected > 0);
    }
    // Método para eliminar un registro de presión arterial
    async deleteBloodPressure(id) {
        const result = await this.bloodPressureRepository.delete(id);
        return (result.affected !== undefined &&
            result.affected !== null &&
            result.affected > 0);
    }
    // Método para eliminar un registro de glucosa en sangre
    async deleteBloodGlucose(id) {
        const result = await this.bloodGlucoseRepository.delete(id);
        return (result.affected !== undefined &&
            result.affected !== null &&
            result.affected > 0);
    }
    // Método para eliminar un registro de oxígeno en sangre
    async deleteBloodOxygen(id) {
        const result = await this.bloodOxygenRepository.delete(id);
        return (result.affected !== undefined &&
            result.affected !== null &&
            result.affected > 0);
    }
    // Método para eliminar un registro de frecuencia respiratoria
    async deleteRespiratoryRate(id) {
        const result = await this.respiratoryRateRepository.delete(id);
        return (result.affected !== undefined &&
            result.affected !== null &&
            result.affected > 0);
    }
    // Métodos para actualizar registros
    async updateHeartRate(id, data) {
        await this.heartRateRepository.update(id, data);
        const updated = await this.getHeartRateById(id);
        if (!updated) {
            throw new Error(`HeartRate with ID ${id} not found after update`);
        }
        return updated;
    }
    async updateBloodPressure(id, data) {
        await this.bloodPressureRepository.update(id, data);
        const updated = await this.getBloodPressureById(id);
        if (!updated) {
            throw new Error(`BloodPressure with ID ${id} not found after update`);
        }
        return updated;
    }
    async updateBloodGlucose(id, data) {
        await this.bloodGlucoseRepository.update(id, data);
        const updated = await this.getBloodGlucoseById(id);
        if (!updated) {
            throw new Error(`BloodGlucose with ID ${id} not found after update`);
        }
        return updated;
    }
    async updateBloodOxygen(id, data) {
        await this.bloodOxygenRepository.update(id, data);
        const updated = await this.getBloodOxygenById(id);
        if (!updated) {
            throw new Error(`BloodOxygen with ID ${id} not found after update`);
        }
        return updated;
    }
    async updateRespiratoryRate(id, data) {
        await this.respiratoryRateRepository.update(id, data);
        const updated = await this.getRespiratoryRateById(id);
        if (!updated) {
            throw new Error(`RespiratoryRate with ID ${id} not found after update`);
        }
        return updated;
    }
    // Métodos para obtener todos los signos vitales más recientes
    async getLatestVitals(patientId) {
        const [heartRate, bloodPressure, bloodGlucose, bloodOxygen, respiratoryRate,] = await Promise.all([
            this.getLatestHeartRate(patientId),
            this.getLatestBloodPressure(patientId),
            this.getLatestBloodGlucose(patientId),
            this.getLatestBloodOxygen(patientId),
            this.getLatestRespiratoryRate(patientId),
        ]);
        return {
            heartRate,
            bloodPressure,
            bloodGlucose,
            bloodOxygen,
            respiratoryRate,
        };
    }
}
exports.HealthRepository = HealthRepository;
