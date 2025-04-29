// src/modules/appointment/controllers/questionnaire.controller.ts
import { Request, Response, NextFunction } from 'express';
import { QuestionnaireService } from '../services/questionnaire.service';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { BadRequestError } from '../../../utils/error-handler';

export class QuestionnaireController {
  private questionnaireService: QuestionnaireService;

  constructor() {
    this.questionnaireService = new QuestionnaireService();
  }

  /**
   * Obtener todos los cuestionarios
   * @route GET /api/questionnaires
   */
  getAllQuestionnaires = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionnaires = await this.questionnaireService.getAllQuestionnaires();
      
      const response: ApiResponse = {
        success: true,
        data: questionnaires,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener cuestionarios activos
   * @route GET /api/questionnaires/active
   */
  getActiveQuestionnaires = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionnaires = await this.questionnaireService.getActiveQuestionnaires();
      
      const response: ApiResponse = {
        success: true,
        data: questionnaires,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener un cuestionario por ID
   * @route GET /api/questionnaires/:id
   */
  getQuestionnaireById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cuestionario inválido');
      }
      
      const questionnaire = await this.questionnaireService.getQuestionnaireById(id);
      
      const response: ApiResponse = {
        success: true,
        data: questionnaire,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener cuestionarios por tipo de cita
   * @route GET /api/questionnaires/appointment-type/:id
   */
  getQuestionnairesByAppointmentType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentTypeId = parseInt(req.params.id);
      
      if (isNaN(appointmentTypeId)) {
        throw new BadRequestError('ID de tipo de cita inválido');
      }
      
      const questionnaires = await this.questionnaireService.getQuestionnairesByAppointmentType(appointmentTypeId);
      
      const response: ApiResponse = {
        success: true,
        data: questionnaires,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear un nuevo cuestionario
   * @route POST /api/questionnaires
   */
  createQuestionnaire = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      
      const questionnaire = await this.questionnaireService.createQuestionnaire(data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Cuestionario creado correctamente',
        data: questionnaire,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar un cuestionario
   * @route PUT /api/questionnaires/:id
   */
  updateQuestionnaire = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cuestionario inválido');
      }
      
      const data = req.body;
      
      const questionnaire = await this.questionnaireService.updateQuestionnaire(id, data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Cuestionario actualizado correctamente',
        data: questionnaire,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Desactivar un cuestionario
   * @route DELETE /api/questionnaires/:id
   */
  deactivateQuestionnaire = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de cuestionario inválido');
      }
      
      const result = await this.questionnaireService.deactivateQuestionnaire(id);
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Añadir una pregunta a un cuestionario
   * @route POST /api/questionnaires/:id/questions
   */
  addQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionnaireId = parseInt(req.params.id);
      
      if (isNaN(questionnaireId)) {
        throw new BadRequestError('ID de cuestionario inválido');
      }
      
      const data = req.body;
      
      const question = await this.questionnaireService.addQuestion(questionnaireId, data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Pregunta añadida correctamente',
        data: question,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualizar una pregunta
   * @route PUT /api/questionnaires/questions/:id
   */
  updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de pregunta inválido');
      }
      
      const data = req.body;
      
      const question = await this.questionnaireService.updateQuestion(id, data);
      
      const response: ApiResponse = {
        success: true,
        message: 'Pregunta actualizada correctamente',
        data: question,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar una pregunta
   * @route DELETE /api/questionnaires/questions/:id
   */
  deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw new BadRequestError('ID de pregunta inválido');
      }
      
      const result = await this.questionnaireService.deleteQuestion(id);
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reordenar preguntas de un cuestionario
   * @route PUT /api/questionnaires/:id/questions/reorder
   */
  reorderQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questionnaireId = parseInt(req.params.id);
      
      if (isNaN(questionnaireId)) {
        throw new BadRequestError('ID de cuestionario inválido');
      }
      
      const { questionIds } = req.body;
      
      if (!Array.isArray(questionIds)) {
        throw new BadRequestError('Se requiere un array de IDs de preguntas');
      }
      
      const result = await this.questionnaireService.reorderQuestions(questionnaireId, questionIds);
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener cuestionario para una cita específica
   * @route GET /api/questionnaires/appointment/:id
   */
  getQuestionnaireForAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      const questionnaire = await this.questionnaireService.getQuestionnaireForAppointment(appointmentId);
      
      const response: ApiResponse = {
        success: true,
        data: questionnaire,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Guardar respuestas de un cuestionario para una cita
   * @route POST /api/questionnaires/appointment/:id/responses
   */
  saveQuestionnaireResponse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      const { questionnaireId, patientId, responses } = req.body;
      
      if (!questionnaireId || !patientId || !responses) {
        throw new BadRequestError('Faltan datos requeridos');
      }
      
      const questionnaireResponse = await this.questionnaireService.saveQuestionnaireResponse(
        appointmentId,
        questionnaireId,
        patientId,
        responses
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Respuestas guardadas correctamente',
        data: questionnaireResponse,
        timestamp: new Date().toISOString()
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener respuestas de cuestionario para una cita
   * @route GET /api/questionnaires/appointment/:id/responses
   */
  getQuestionnaireResponseForAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        throw new BadRequestError('ID de cita inválido');
      }
      
      const questionnaireResponse = await this.questionnaireService.getQuestionnaireResponseForAppointment(appointmentId);
      
      const response: ApiResponse = {
        success: true,
        data: questionnaireResponse,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener respuestas de cuestionarios por paciente
   * @route GET /api/questionnaires/patient/:id/responses
   */
  getQuestionnaireResponsesByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        throw new BadRequestError('ID de paciente inválido');
      }
      
      const questionnaireResponses = await this.questionnaireService.getQuestionnaireResponsesByPatient(patientId);
      
      const response: ApiResponse = {
        success: true,
        data: questionnaireResponses,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}