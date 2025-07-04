"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthDataRepository = void 0;
// src/modules/health-data/health-data.repository.ts
const database_1 = require("../../core/config/database");
const patient_model_1 = require("../../models/patient.model");
const allergy_model_1 = require("../../models/allergy.model");
const background_model_1 = require("../../models/background.model");
const condition_model_1 = require("../../models/condition.model");
const diseases_model_1 = require("../../models/diseases.model");
const vitals_models_1 = require("../../models/vitals.models");
const appointment_model_1 = require("../../models/appointment.model");
const control_medicine_model_1 = require("../../models/control-medicine.model");
const questionnaire_model_1 = require("../../models/questionnaire.model");
class HealthDataRepository {
    patientRepository = database_1.AppDataSource.getRepository(patient_model_1.Patient);
    allergiesRepository = database_1.AppDataSource.getRepository(allergy_model_1.Allergy);
    conditionRepository = database_1.AppDataSource.getRepository(condition_model_1.Condition);
    backgroundsRepository = database_1.AppDataSource.getRepository(background_model_1.Background);
    familyBackgroundsRepository = database_1.AppDataSource.getRepository(background_model_1.FamilyBackground);
    vaccinesRepository = database_1.AppDataSource.getRepository(background_model_1.Vaccine);
    diseasesRepository = database_1.AppDataSource.getRepository(diseases_model_1.Disease);
    heartRateRepository = database_1.AppDataSource.getRepository(vitals_models_1.HeartRate);
    bloodPressureRepository = database_1.AppDataSource.getRepository(vitals_models_1.BloodPressure);
    bloodGlucoseRepository = database_1.AppDataSource.getRepository(vitals_models_1.BloodGlucose);
    bloodOxygenRepository = database_1.AppDataSource.getRepository(vitals_models_1.BloodOxygen);
    respiratoryRateRepository = database_1.AppDataSource.getRepository(vitals_models_1.RespiratoryRate);
    appointmentsRepository = database_1.AppDataSource.getRepository(appointment_model_1.Appointment);
    controlMedicineRepository = database_1.AppDataSource.getRepository(control_medicine_model_1.ControlMedicine);
    questionnaireResponseRepository = database_1.AppDataSource.getRepository(questionnaire_model_1.QuestionnaireResponse);
    /**
     * Obtiene los datos de salud de un paciente por su ID
     * @param patientId ID del paciente
     * @returns Datos de salud del paciente
     */
    async getHealthDataById(patientId) {
        // Verificar que el paciente existe
        const patient = await this.patientRepository.findOne({
            where: { id: patientId }
        });
        if (!patient) {
            return null;
        }
        // Obtener todos los datos de salud en paralelo para mejor rendimiento
        const [allergies, condition, backgrounds, familyBackgrounds, vaccines, diseases, appointments, heartRate, bloodPressure, bloodGlucose, bloodOxygen, respiratoryRate] = await Promise.all([
            // Información médica
            this.allergiesRepository.find({
                where: { id_paciente: patientId },
                order: { created_at: 'DESC' }
            }),
            this.conditionRepository.findOne({
                where: { id_paciente: patientId }
            }),
            this.backgroundsRepository.find({
                where: { id_paciente: patientId },
                order: { created_at: 'DESC' }
            }),
            this.familyBackgroundsRepository.find({
                where: { id_paciente: patientId },
                order: { created_at: 'DESC' }
            }),
            this.vaccinesRepository.find({
                where: { id_paciente: patientId },
                order: { created_at: 'DESC' }
            }),
            this.diseasesRepository.find({
                where: { id_paciente: patientId },
                order: { created_at: 'DESC' }
            }),
            // Citas médicas
            this.appointmentsRepository.find({
                where: { patient_id: patientId },
                order: { start_time: 'DESC' },
                relations: ['professional', 'appointmentType']
            }),
            // // Medicamentos controlados
            // this.controlMedicineRepository.find({
            //   where: { id_patient: patientId },
            //   order: { date_order: 'DESC' }
            // }),
            // Respuestas de cuestionarios
            // this.questionnaireResponseRepository.find({
            //   where: { patient_id: patientId },
            //   order: { completed_at: 'DESC' },
            //   relations: ['questionnaire', 'responses', 'responses.question']
            // }),
            // Signos vitales - obtener solo el más reciente para cada tipo
            this.heartRateRepository.findOne({
                where: { patient_id: patientId },
                order: { date: 'DESC' }
            }),
            this.bloodPressureRepository.findOne({
                where: { patient_id: patientId },
                order: { date: 'DESC' }
            }),
            this.bloodGlucoseRepository.findOne({
                where: { patient_id: patientId },
                order: { date: 'DESC' }
            }),
            this.bloodOxygenRepository.findOne({
                where: { patient_id: patientId },
                order: { date: 'DESC' }
            }),
            this.respiratoryRateRepository.findOne({
                where: { patient_id: patientId },
                order: { date: 'DESC' }
            })
        ]);
        // Estructurar los datos en el formato requerido
        return {
            vitals: {
                heartRate,
                bloodPressure,
                bloodGlucose,
                bloodOxygen,
                respiratoryRate
            },
            medical_info: {
                allergies,
                condition,
                backgrounds,
                familyBackgrounds,
                vaccines,
                diseases
            },
            appointments: appointments,
            // medications: controlMedicines,
            // questionnaire_responses: questionnaireResponses
        };
    }
}
exports.HealthDataRepository = HealthDataRepository;
