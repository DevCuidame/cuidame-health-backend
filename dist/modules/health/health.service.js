"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const patient_repository_1 = require("../../modules/patient/patient.repository");
const health_repository_1 = require("./health.repository");
const error_handler_1 = require("../../utils/error-handler");
class HealthService {
    healthRepository;
    patientRepository;
    constructor() {
        this.healthRepository = new health_repository_1.HealthRepository();
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
    // Métodos para frecuencia cardíaca
    async createHeartRate(data, caregiverId) {
        await this.verifyAccess(data.patient_id, caregiverId);
        return await this.healthRepository.createHeartRate({
            ...data,
            date: new Date(data.date),
            created_at: new Date()
        });
    }
    async getHeartRateById(id, caregiverId) {
        const heartRate = await this.healthRepository.getHeartRateById(id);
        if (!heartRate) {
            throw new error_handler_1.NotFoundError(`Registro de frecuencia cardíaca con ID ${id} no encontrado`);
        }
        await this.verifyAccess(heartRate.patient_id, caregiverId);
        return heartRate;
    }
    async getHeartRatesByPatient(patientId, startDate, endDate, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.healthRepository.getHeartRatesByPatient(patientId, startDate, endDate);
    }
    // Métodos para presión arterial
    async createBloodPressure(data, caregiverId) {
        await this.verifyAccess(data.patient_id, caregiverId);
        return await this.healthRepository.createBloodPressure({
            ...data,
            date: new Date(data.date),
            created_at: new Date()
        });
    }
    async getBloodPressureById(id, caregiverId) {
        const bloodPressure = await this.healthRepository.getBloodPressureById(id);
        if (!bloodPressure) {
            throw new error_handler_1.NotFoundError(`Registro de presión arterial con ID ${id} no encontrado`);
        }
        await this.verifyAccess(bloodPressure.patient_id, caregiverId);
        return bloodPressure;
    }
    async getBloodPressuresByPatient(patientId, startDate, endDate, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.healthRepository.getBloodPressuresByPatient(patientId, startDate, endDate);
    }
    // Métodos para glucosa en sangre
    async createBloodGlucose(data, caregiverId) {
        await this.verifyAccess(data.patient_id, caregiverId);
        return await this.healthRepository.createBloodGlucose({
            ...data,
            date: new Date(data.date)
        });
    }
    async getBloodGlucoseById(id, caregiverId) {
        const bloodGlucose = await this.healthRepository.getBloodGlucoseById(id);
        if (!bloodGlucose) {
            throw new error_handler_1.NotFoundError(`Registro de glucosa en sangre con ID ${id} no encontrado`);
        }
        await this.verifyAccess(bloodGlucose.patient_id, caregiverId);
        return bloodGlucose;
    }
    async getBloodGlucosesByPatient(patientId, startDate, endDate, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.healthRepository.getBloodGlucosesByPatient(patientId, startDate, endDate);
    }
    // Métodos para oxígeno en sangre
    async createBloodOxygen(data, caregiverId) {
        await this.verifyAccess(data.patient_id, caregiverId);
        return await this.healthRepository.createBloodOxygen({
            ...data,
            date: new Date(data.date)
        });
    }
    async getBloodOxygenById(id, caregiverId) {
        const bloodOxygen = await this.healthRepository.getBloodOxygenById(id);
        if (!bloodOxygen) {
            throw new error_handler_1.NotFoundError(`Registro de oxígeno en sangre con ID ${id} no encontrado`);
        }
        await this.verifyAccess(bloodOxygen.patient_id, caregiverId);
        return bloodOxygen;
    }
    async getBloodOxygensByPatient(patientId, startDate, endDate, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.healthRepository.getBloodOxygensByPatient(patientId, startDate, endDate);
    }
    // Métodos para frecuencia respiratoria
    async createRespiratoryRate(data, caregiverId) {
        await this.verifyAccess(data.patient_id, caregiverId);
        return await this.healthRepository.createRespiratoryRate({
            ...data,
            date: new Date(data.date),
            created_at: new Date()
        });
    }
    async getRespiratoryRateById(id, caregiverId) {
        const respiratoryRate = await this.healthRepository.getRespiratoryRateById(id);
        if (!respiratoryRate) {
            throw new error_handler_1.NotFoundError(`Registro de frecuencia respiratoria con ID ${id} no encontrado`);
        }
        await this.verifyAccess(respiratoryRate.patient_id, caregiverId);
        return respiratoryRate;
    }
    async getRespiratoryRatesByPatient(patientId, startDate, endDate, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.healthRepository.getRespiratoryRatesByPatient(patientId, startDate, endDate);
    }
    // Métodos para obtener todos los signos vitales
    async getLatestVitals(patientId, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        return await this.healthRepository.getLatestVitals(patientId);
    }
    async getAllVitals(patientId, startDate, endDate, caregiverId) {
        await this.verifyAccess(patientId, caregiverId);
        const [heartRates, bloodPressures, bloodGlucoses, bloodOxygens, respiratoryRates] = await Promise.all([
            this.healthRepository.getHeartRatesByPatient(patientId, startDate, endDate),
            this.healthRepository.getBloodPressuresByPatient(patientId, startDate, endDate),
            this.healthRepository.getBloodGlucosesByPatient(patientId, startDate, endDate),
            this.healthRepository.getBloodOxygensByPatient(patientId, startDate, endDate),
            this.healthRepository.getRespiratoryRatesByPatient(patientId, startDate, endDate)
        ]);
        return {
            heartRates,
            bloodPressures,
            bloodGlucoses,
            bloodOxygens,
            respiratoryRates
        };
    }
}
exports.HealthService = HealthService;
