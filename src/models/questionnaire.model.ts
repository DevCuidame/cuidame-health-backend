// src/models/questionnaire.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppointmentType } from './appointment-type.model';

export enum QuestionType {
  TEXT = 'text',
  MULTIPLE_CHOICE = 'multiple_choice',
  CHECKBOX = 'checkbox',
  SCALE = 'scale',
  DATE = 'date',
  FILE = 'file'
}

@Entity('questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true, length: 1000 })
  description?: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  appointment_type_id?: number; // Tipo de cita asociado (opcional)

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => AppointmentType, { nullable: true })
  @JoinColumn({ name: 'appointment_type_id' })
  appointmentType?: AppointmentType;

  @OneToMany(() => QuestionnaireQuestion, question => question.questionnaire)
  questions!: QuestionnaireQuestion[];
}

@Entity('questionnaire_questions')
export class QuestionnaireQuestion {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  questionnaire_id!: number;

  @Column()
  question_text!: string;

  @Column({ nullable: true, length: 1000 })
  help_text?: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.TEXT
  })
  question_type!: QuestionType;

  @Column({ type: 'simple-json', nullable: true })
  options?: { [key: string]: any }; // Opciones para preguntas de selección

  @Column({ default: false })
  is_required!: boolean;

  @Column({ default: 0 })
  display_order!: number; // Orden de visualización

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Questionnaire, questionnaire => questionnaire.questions)
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire!: Questionnaire;
}

@Entity('questionnaire_responses')
export class QuestionnaireResponse {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  questionnaire_id!: number;

  @Column()
  appointment_id!: number;

  @Column()
  patient_id!: number;

  @Column({ type: 'timestamp' })
  completed_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Questionnaire)
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire!: Questionnaire;

  @OneToMany(() => QuestionResponse, response => response.questionnaire_response)
  responses!: QuestionResponse[];
}

@Entity('question_responses')
export class QuestionResponse {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  questionnaire_response_id!: number;

  @Column()
  question_id!: number;

  @Column({ type: 'text', nullable: true })
  response_text?: string;

  @Column({ type: 'simple-json', nullable: true })
  response_data?: { [key: string]: any }; // Para respuestas complejas

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => QuestionnaireResponse, qr => qr.responses)
  @JoinColumn({ name: 'questionnaire_response_id' })
  questionnaire_response!: QuestionnaireResponse;

  @ManyToOne(() => QuestionnaireQuestion)
  @JoinColumn({ name: 'question_id' })
  question!: QuestionnaireQuestion;
}