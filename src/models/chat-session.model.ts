// src/modules/chat/models/chat-session.model.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
  } from 'typeorm';
  import { Patient } from './patient.model';
  
  export enum ChatSessionStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned'
  }
  
  export enum ChatStepType {
    VALIDATE_DOCUMENT = 'validateDocument',
    SELECT_CITY = 'selectCity',
    SELECT_SPECIALTY = 'selectSpecialty',
    SELECT_APPOINTMENT_TYPE ='selectAppointmentType',
    // SELECT_PROFESSIONAL = 'selectProfessional',
    // SELECT_DATE = 'selectDate',
    // SELECT_TIME = 'selectTime',
    CONFIRM_APPOINTMENT = 'confirmAppointment',
    COMPLETED = 'completed'
  }
  
  @Entity('chat_sessions')
  export class ChatSession {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ unique: true })
    session_id!: string;
  
    @Column({ nullable: true })
    patient_id!: number;
  
    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient!: Patient;
  
    @Column({ nullable: true })
    document_number!: string;
  
    @Column({
      type: 'enum',
      enum: ChatStepType,
      default: ChatStepType.VALIDATE_DOCUMENT
    })
    current_step!: ChatStepType;
  
    @Column({ type: 'json', nullable: true })
    chat_data: any;
  
    @Column({
      type: 'enum',
      enum: ChatSessionStatus,
      default: ChatSessionStatus.ACTIVE
    })
    status!: ChatSessionStatus;
  
    @Column({ nullable: true })
    appointment_id!: number;
  
    @CreateDateColumn()
    created_at?: Date;
  
    @UpdateDateColumn()
    updated_at?: Date;
  
    @Column({ nullable: true })
    last_interaction_at?: Date;
  }
  