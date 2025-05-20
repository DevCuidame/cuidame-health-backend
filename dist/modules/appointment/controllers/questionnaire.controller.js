"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionnaireController = void 0;
const questionnaire_service_1 = require("../services/questionnaire.service");
const error_handler_1 = require("../../../utils/error-handler");
class QuestionnaireController {
    questionnaireService;
    constructor() {
        this.questionnaireService = new questionnaire_service_1.QuestionnaireService();
    }
    /**
     * Obtener todos los cuestionarios
     * @route GET /api/questionnaires
     */
    getAllQuestionnaires = async (req, res, next) => {
        try {
            const questionnaires = await this.questionnaireService.getAllQuestionnaires();
            const response = {
                success: true,
                data: questionnaires,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener cuestionarios activos
     * @route GET /api/questionnaires/active
     */
    getActiveQuestionnaires = async (req, res, next) => {
        try {
            const questionnaires = await this.questionnaireService.getActiveQuestionnaires();
            const response = {
                success: true,
                data: questionnaires,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener un cuestionario por ID
     * @route GET /api/questionnaires/:id
     */
    getQuestionnaireById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cuestionario inválido');
            }
            const questionnaire = await this.questionnaireService.getQuestionnaireById(id);
            const response = {
                success: true,
                data: questionnaire,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener cuestionarios por tipo de cita
     * @route GET /api/questionnaires/appointment-type/:id
     */
    getQuestionnairesByAppointmentType = async (req, res, next) => {
        try {
            const appointmentTypeId = parseInt(req.params.id);
            if (isNaN(appointmentTypeId)) {
                throw new error_handler_1.BadRequestError('ID de tipo de cita inválido');
            }
            const questionnaires = await this.questionnaireService.getQuestionnairesByAppointmentType(appointmentTypeId);
            const response = {
                success: true,
                data: questionnaires,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crear un nuevo cuestionario
     * @route POST /api/questionnaires
     */
    createQuestionnaire = async (req, res, next) => {
        try {
            const data = req.body;
            const questionnaire = await this.questionnaireService.createQuestionnaire(data);
            const response = {
                success: true,
                message: 'Cuestionario creado correctamente',
                data: questionnaire,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar un cuestionario
     * @route PUT /api/questionnaires/:id
     */
    updateQuestionnaire = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cuestionario inválido');
            }
            const data = req.body;
            const questionnaire = await this.questionnaireService.updateQuestionnaire(id, data);
            const response = {
                success: true,
                message: 'Cuestionario actualizado correctamente',
                data: questionnaire,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Desactivar un cuestionario
     * @route DELETE /api/questionnaires/:id
     */
    deactivateQuestionnaire = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de cuestionario inválido');
            }
            const result = await this.questionnaireService.deactivateQuestionnaire(id);
            const response = {
                success: true,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Añadir una pregunta a un cuestionario
     * @route POST /api/questionnaires/:id/questions
     */
    addQuestion = async (req, res, next) => {
        try {
            const questionnaireId = parseInt(req.params.id);
            if (isNaN(questionnaireId)) {
                throw new error_handler_1.BadRequestError('ID de cuestionario inválido');
            }
            const data = req.body;
            const question = await this.questionnaireService.addQuestion(questionnaireId, data);
            const response = {
                success: true,
                message: 'Pregunta añadida correctamente',
                data: question,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar una pregunta
     * @route PUT /api/questionnaires/questions/:id
     */
    updateQuestion = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de pregunta inválido');
            }
            const data = req.body;
            const question = await this.questionnaireService.updateQuestion(id, data);
            const response = {
                success: true,
                message: 'Pregunta actualizada correctamente',
                data: question,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar una pregunta
     * @route DELETE /api/questionnaires/questions/:id
     */
    deleteQuestion = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new error_handler_1.BadRequestError('ID de pregunta inválido');
            }
            const result = await this.questionnaireService.deleteQuestion(id);
            const response = {
                success: true,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Reordenar preguntas de un cuestionario
     * @route PUT /api/questionnaires/:id/questions/reorder
     */
    reorderQuestions = async (req, res, next) => {
        try {
            const questionnaireId = parseInt(req.params.id);
            if (isNaN(questionnaireId)) {
                throw new error_handler_1.BadRequestError('ID de cuestionario inválido');
            }
            const { questionIds } = req.body;
            if (!Array.isArray(questionIds)) {
                throw new error_handler_1.BadRequestError('Se requiere un array de IDs de preguntas');
            }
            const result = await this.questionnaireService.reorderQuestions(questionnaireId, questionIds);
            const response = {
                success: true,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener cuestionario para una cita específica
     * @route GET /api/questionnaires/appointment/:id
     */
    getQuestionnaireForAppointment = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            const questionnaire = await this.questionnaireService.getQuestionnaireForAppointment(appointmentId);
            const response = {
                success: true,
                data: questionnaire,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Guardar respuestas de un cuestionario para una cita
     * @route POST /api/questionnaires/appointment/:id/responses
     */
    saveQuestionnaireResponse = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            const { questionnaireId, patientId, responses } = req.body;
            if (!questionnaireId || !patientId || !responses) {
                throw new error_handler_1.BadRequestError('Faltan datos requeridos');
            }
            const questionnaireResponse = await this.questionnaireService.saveQuestionnaireResponse(appointmentId, questionnaireId, patientId, responses);
            const response = {
                success: true,
                message: 'Respuestas guardadas correctamente',
                data: questionnaireResponse,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener respuestas de cuestionario para una cita
     * @route GET /api/questionnaires/appointment/:id/responses
     */
    getQuestionnaireResponseForAppointment = async (req, res, next) => {
        try {
            const appointmentId = parseInt(req.params.id);
            if (isNaN(appointmentId)) {
                throw new error_handler_1.BadRequestError('ID de cita inválido');
            }
            const questionnaireResponse = await this.questionnaireService.getQuestionnaireResponseForAppointment(appointmentId);
            const response = {
                success: true,
                data: questionnaireResponse,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener respuestas de cuestionarios por paciente
     * @route GET /api/questionnaires/patient/:id/responses
     */
    getQuestionnaireResponsesByPatient = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            if (isNaN(patientId)) {
                throw new error_handler_1.BadRequestError('ID de paciente inválido');
            }
            const questionnaireResponses = await this.questionnaireService.getQuestionnaireResponsesByPatient(patientId);
            const response = {
                success: true,
                data: questionnaireResponses,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.QuestionnaireController = QuestionnaireController;
