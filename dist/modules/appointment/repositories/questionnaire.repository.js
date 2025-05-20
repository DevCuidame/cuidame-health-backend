"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionResponseRepository = exports.QuestionnaireResponseRepository = exports.QuestionnaireQuestionRepository = exports.QuestionnaireRepository = void 0;
// src/modules/appointment/repositories/questionnaire.repository.ts
const base_repository_1 = require("../../../core/repositories/base.repository");
const questionnaire_model_1 = require("../../../models/questionnaire.model");
class QuestionnaireRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(questionnaire_model_1.Questionnaire);
    }
    /**
     * Buscar cuestionarios por tipo de cita
     * @param appointmentTypeId ID del tipo de cita
     * @returns Lista de cuestionarios asociados al tipo de cita
     */
    async findByAppointmentType(appointmentTypeId) {
        return await this.repository.find({
            where: { appointment_type_id: appointmentTypeId, is_active: true },
            relations: ['questions'],
            order: { created_at: 'DESC' }
        });
    }
    /**
     * Buscar cuestionarios activos
     * @returns Lista de cuestionarios activos
     */
    async findActiveQuestionnaires() {
        return await this.repository.find({
            where: { is_active: true },
            order: { title: 'ASC' }
        });
    }
}
exports.QuestionnaireRepository = QuestionnaireRepository;
class QuestionnaireQuestionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(questionnaire_model_1.QuestionnaireQuestion);
    }
    /**
     * Buscar preguntas por cuestionario
     * @param questionnaireId ID del cuestionario
     * @returns Lista de preguntas ordenadas por display_order
     */
    async findByQuestionnaire(questionnaireId) {
        return await this.repository.find({
            where: { questionnaire_id: questionnaireId },
            order: { display_order: 'ASC' }
        });
    }
}
exports.QuestionnaireQuestionRepository = QuestionnaireQuestionRepository;
class QuestionnaireResponseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(questionnaire_model_1.QuestionnaireResponse);
    }
    /**
     * Buscar respuestas de cuestionario por cita
     * @param appointmentId ID de la cita
     * @returns Respuesta del cuestionario con sus respuestas a preguntas
     */
    async findByAppointment(appointmentId) {
        return await this.repository.findOne({
            where: { appointment_id: appointmentId },
            relations: ['responses', 'responses.question', 'questionnaire', 'questionnaire.questions']
        });
    }
    /**
     * Buscar respuestas de cuestionario por paciente
     * @param patientId ID del paciente
     * @returns Lista de respuestas de cuestionarios del paciente
     */
    async findByPatient(patientId) {
        return await this.repository.find({
            where: { patient_id: patientId },
            relations: ['questionnaire'],
            order: { completed_at: 'DESC' }
        });
    }
}
exports.QuestionnaireResponseRepository = QuestionnaireResponseRepository;
class QuestionResponseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(questionnaire_model_1.QuestionResponse);
    }
    /**
     * Buscar respuestas por cuestionario respondido
     * @param questionnaireResponseId ID de la respuesta del cuestionario
     * @returns Lista de respuestas a preguntas
     */
    async findByQuestionnaireResponse(questionnaireResponseId) {
        return await this.repository.find({
            where: { questionnaire_response_id: questionnaireResponseId },
            relations: ['question']
        });
    }
}
exports.QuestionResponseRepository = QuestionResponseRepository;
