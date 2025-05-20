"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionnaireService = void 0;
// src/modules/appointment/services/questionnaire.service.ts
const questionnaire_repository_1 = require("../repositories/questionnaire.repository");
const appointment_service_1 = require("./appointment.service");
const appointment_type_service_1 = require("./appointment-type.service");
const error_handler_1 = require("../../../utils/error-handler");
const typeorm_1 = require("typeorm");
class QuestionnaireService {
    questionnaireRepository;
    questionRepository;
    responseRepository;
    questionResponseRepository;
    appointmentService;
    appointmentTypeService;
    constructor() {
        this.questionnaireRepository = new questionnaire_repository_1.QuestionnaireRepository();
        this.questionRepository = new questionnaire_repository_1.QuestionnaireQuestionRepository();
        this.responseRepository = new questionnaire_repository_1.QuestionnaireResponseRepository();
        this.questionResponseRepository = new questionnaire_repository_1.QuestionResponseRepository();
        this.appointmentService = new appointment_service_1.AppointmentService();
        this.appointmentTypeService = new appointment_type_service_1.AppointmentTypeService();
    }
    /**
     * Obtener todos los cuestionarios
     */
    async getAllQuestionnaires() {
        return await this.questionnaireRepository.findAll({
            relations: ['appointmentType']
        });
    }
    /**
     * Obtener cuestionarios activos
     */
    async getActiveQuestionnaires() {
        return await this.questionnaireRepository.findActiveQuestionnaires();
    }
    /**
     * Obtener un cuestionario por ID
     */
    async getQuestionnaireById(id) {
        const questionnaire = await this.questionnaireRepository.findById(id, {
            relations: ['questions', 'appointmentType']
        });
        if (!questionnaire) {
            throw new error_handler_1.NotFoundError(`Cuestionario con ID ${id} no encontrado`);
        }
        // Ordenar preguntas por display_order
        if (questionnaire.questions) {
            questionnaire.questions.sort((a, b) => a.display_order - b.display_order);
        }
        return questionnaire;
    }
    /**
     * Obtener cuestionarios por tipo de cita
     */
    async getQuestionnairesByAppointmentType(appointmentTypeId) {
        // Verificar que el tipo de cita existe
        await this.appointmentTypeService.getTypeById(appointmentTypeId);
        return await this.questionnaireRepository.findByAppointmentType(appointmentTypeId);
    }
    /**
     * Crear un nuevo cuestionario
     */
    async createQuestionnaire(data) {
        // Verificar datos requeridos
        if (!data.title) {
            throw new error_handler_1.BadRequestError('El título del cuestionario es requerido');
        }
        // Si se especifica un tipo de cita, verificar que existe
        if (data.appointment_type_id) {
            await this.appointmentTypeService.getTypeById(data.appointment_type_id);
        }
        return await this.questionnaireRepository.create(data);
    }
    /**
     * Actualizar un cuestionario
     */
    async updateQuestionnaire(id, data) {
        // Verificar que el cuestionario existe
        await this.getQuestionnaireById(id);
        // Si se está actualizando el tipo de cita, verificar que existe
        if (data.appointment_type_id) {
            await this.appointmentTypeService.getTypeById(data.appointment_type_id);
        }
        return await this.questionnaireRepository.update(id, data, 'Cuestionario');
    }
    /**
     * Desactivar un cuestionario
     */
    async deactivateQuestionnaire(id) {
        // Verificar que el cuestionario existe
        await this.getQuestionnaireById(id);
        // Desactivar el cuestionario
        await this.questionnaireRepository.update(id, { is_active: false }, 'Cuestionario');
        return {
            success: true,
            message: 'Cuestionario desactivado correctamente'
        };
    }
    /**
     * Añadir una pregunta a un cuestionario
     */
    async addQuestion(questionnaireId, data) {
        // Verificar que el cuestionario existe
        await this.getQuestionnaireById(questionnaireId);
        // Asignar el ID del cuestionario
        data.questionnaire_id = questionnaireId;
        // Verificar datos requeridos
        if (!data.question_text || !data.question_type) {
            throw new error_handler_1.BadRequestError('El texto y tipo de pregunta son requeridos');
        }
        // Obtener el orden máximo actual para añadir la pregunta al final
        const questions = await this.questionRepository.findByQuestionnaire(questionnaireId);
        const maxOrder = questions.length > 0 ? Math.max(...questions.map(q => q.display_order)) : -1;
        data.display_order = maxOrder + 1;
        return await this.questionRepository.create(data);
    }
    /**
     * Actualizar una pregunta
     */
    async updateQuestion(id, data) {
        // Verificar que la pregunta existe
        const question = await this.questionRepository.findById(id);
        if (!question) {
            throw new error_handler_1.NotFoundError(`Pregunta con ID ${id} no encontrada`);
        }
        // No permitir cambiar el cuestionario al que pertenece
        if (data.questionnaire_id && data.questionnaire_id !== question.questionnaire_id) {
            throw new error_handler_1.BadRequestError('No se puede cambiar el cuestionario al que pertenece la pregunta');
        }
        return await this.questionRepository.update(id, data, 'Pregunta');
    }
    /**
     * Eliminar una pregunta
     */
    async deleteQuestion(id) {
        // Verificar que la pregunta existe
        const question = await this.questionRepository.findById(id);
        if (!question) {
            throw new error_handler_1.NotFoundError(`Pregunta con ID ${id} no encontrada`);
        }
        // Eliminar la pregunta
        await this.questionRepository.delete(id, 'Pregunta');
        // Reordenar las preguntas restantes
        const questions = await this.questionRepository.findByQuestionnaire(question.questionnaire_id);
        for (let i = 0; i < questions.length; i++) {
            await this.questionRepository.update(questions[i].id, { display_order: i }, 'Pregunta');
        }
        return {
            success: true,
            message: 'Pregunta eliminada correctamente'
        };
    }
    /**
     * Reordenar preguntas de un cuestionario
     */
    async reorderQuestions(questionnaireId, questionIds) {
        // Verificar que el cuestionario existe
        await this.getQuestionnaireById(questionnaireId);
        // Verificar que todas las preguntas pertenecen al cuestionario
        const questions = await this.questionRepository.findByQuestionnaire(questionnaireId);
        const questionMap = new Map(questions.map(q => [q.id, q]));
        for (const id of questionIds) {
            if (!questionMap.has(id)) {
                throw new error_handler_1.BadRequestError(`La pregunta con ID ${id} no pertenece a este cuestionario`);
            }
        }
        // Actualizar el orden de las preguntas
        for (let i = 0; i < questionIds.length; i++) {
            await this.questionRepository.update(questionIds[i], { display_order: i }, 'Pregunta');
        }
        return {
            success: true,
            message: 'Preguntas reordenadas correctamente'
        };
    }
    /**
     * Obtener cuestionario para una cita específica
     */
    async getQuestionnaireForAppointment(appointmentId) {
        // Obtener la cita
        const appointment = await this.appointmentService.getAppointmentById(appointmentId);
        // Buscar cuestionarios asociados al tipo de cita
        const questionnaires = await this.questionnaireRepository.findByAppointmentType(appointment.appointment_type_id);
        // Si no hay cuestionarios específicos para este tipo de cita, buscar cuestionarios generales
        if (!questionnaires || questionnaires.length === 0) {
            const generalQuestionnaires = await this.questionnaireRepository.findAll({
                where: { appointment_type_id: (0, typeorm_1.IsNull)(), is_active: true },
                relations: ['questions']
            });
            // Devolver el primer cuestionario general si existe
            return generalQuestionnaires.length > 0 ? generalQuestionnaires[0] : null;
        }
        // Devolver el primer cuestionario específico
        return questionnaires[0];
    }
    /**
     * Guardar respuestas de un cuestionario para una cita
     */
    async saveQuestionnaireResponse(appointmentId, questionnaireId, patientId, responses) {
        // Verificar que la cita existe
        await this.appointmentService.getAppointmentById(appointmentId);
        // Verificar que el cuestionario existe
        const questionnaire = await this.getQuestionnaireById(questionnaireId);
        // Verificar que todas las preguntas pertenecen al cuestionario
        const questionIds = questionnaire.questions.map(q => q.id);
        for (const response of responses) {
            if (!questionIds.includes(response.question_id)) {
                throw new error_handler_1.BadRequestError(`La pregunta con ID ${response.question_id} no pertenece a este cuestionario`);
            }
        }
        // Verificar si ya existe una respuesta para esta cita
        const existingResponse = await this.responseRepository.findByAppointment(appointmentId);
        if (existingResponse) {
            // Eliminar respuestas anteriores
            const existingQuestionResponses = await this.questionResponseRepository.findByQuestionnaireResponse(existingResponse.id);
            for (const qr of existingQuestionResponses) {
                await this.questionResponseRepository.delete(qr.id, 'Respuesta de cuestionario');
            }
            // Actualizar la respuesta existente
            await this.responseRepository.update(existingResponse.id, {
                completed_at: new Date()
            }, 'Respuesta de cuestionario');
            // Guardar las nuevas respuestas
            for (const response of responses) {
                await this.questionResponseRepository.create({
                    questionnaire_response_id: existingResponse.id,
                    question_id: response.question_id,
                    response_text: response.response_text,
                    response_data: response.response_data
                });
            }
            return await this.responseRepository.findById(existingResponse.id, {
                relations: ['responses', 'responses.question', 'questionnaire']
            });
        }
        // Crear una nueva respuesta de cuestionario
        const questionnaireResponse = await this.responseRepository.create({
            questionnaire_id: questionnaireId,
            appointment_id: appointmentId,
            patient_id: patientId,
            completed_at: new Date()
        });
        // Guardar las respuestas individuales
        for (const response of responses) {
            await this.questionResponseRepository.create({
                questionnaire_response_id: questionnaireResponse.id,
                question_id: response.question_id,
                response_text: response.response_text,
                response_data: response.response_data
            });
        }
        return await this.responseRepository.findById(questionnaireResponse.id, {
            relations: ['responses', 'responses.question', 'questionnaire']
        });
    }
    /**
     * Obtener respuestas de cuestionario para una cita
     */
    async getQuestionnaireResponseForAppointment(appointmentId) {
        return await this.responseRepository.findByAppointment(appointmentId);
    }
    /**
     * Obtener respuestas de cuestionarios por paciente
     */
    async getQuestionnaireResponsesByPatient(patientId) {
        return await this.responseRepository.findByPatient(patientId);
    }
}
exports.QuestionnaireService = QuestionnaireService;
