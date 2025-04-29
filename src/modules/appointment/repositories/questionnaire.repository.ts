// src/modules/appointment/repositories/questionnaire.repository.ts
import { BaseRepository } from '../../../core/repositories/base.repository';
import { Questionnaire, QuestionnaireQuestion, QuestionnaireResponse, QuestionResponse } from '../../../models/questionnaire.model';

export class QuestionnaireRepository extends BaseRepository<Questionnaire> {
  constructor() {
    super(Questionnaire);
  }

  /**
   * Buscar cuestionarios por tipo de cita
   * @param appointmentTypeId ID del tipo de cita
   * @returns Lista de cuestionarios asociados al tipo de cita
   */
  async findByAppointmentType(appointmentTypeId: number): Promise<Questionnaire[]> {
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
  async findActiveQuestionnaires(): Promise<Questionnaire[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { title: 'ASC' }
    });
  }
}

export class QuestionnaireQuestionRepository extends BaseRepository<QuestionnaireQuestion> {
  constructor() {
    super(QuestionnaireQuestion);
  }

  /**
   * Buscar preguntas por cuestionario
   * @param questionnaireId ID del cuestionario
   * @returns Lista de preguntas ordenadas por display_order
   */
  async findByQuestionnaire(questionnaireId: number): Promise<QuestionnaireQuestion[]> {
    return await this.repository.find({
      where: { questionnaire_id: questionnaireId },
      order: { display_order: 'ASC' }
    });
  }
}

export class QuestionnaireResponseRepository extends BaseRepository<QuestionnaireResponse> {
  constructor() {
    super(QuestionnaireResponse);
  }

  /**
   * Buscar respuestas de cuestionario por cita
   * @param appointmentId ID de la cita
   * @returns Respuesta del cuestionario con sus respuestas a preguntas
   */
  async findByAppointment(appointmentId: number): Promise<QuestionnaireResponse | null> {
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
  async findByPatient(patientId: number): Promise<QuestionnaireResponse[]> {
    return await this.repository.find({
      where: { patient_id: patientId },
      relations: ['questionnaire'],
      order: { completed_at: 'DESC' }
    });
  }
}

export class QuestionResponseRepository extends BaseRepository<QuestionResponse> {
  constructor() {
    super(QuestionResponse);
  }

  /**
   * Buscar respuestas por cuestionario respondido
   * @param questionnaireResponseId ID de la respuesta del cuestionario
   * @returns Lista de respuestas a preguntas
   */
  async findByQuestionnaireResponse(questionnaireResponseId: number): Promise<QuestionResponse[]> {
    return await this.repository.find({
      where: { questionnaire_response_id: questionnaireResponseId },
      relations: ['question']
    });
  }
}