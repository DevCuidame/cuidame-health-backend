// src/models/appointment.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Patient } from './patient.model';
import { HealthProfessional } from './health-professional.model';
import { AppointmentType } from './appointment-type.model';
import { RecurringAppointment } from './recurring-appointment.model';
import { MedicalSpecialties } from './medical-specialties.model';

export enum AppointmentStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show'
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ nullable: false })
  patient_id!: number;

  @Column()
  professional_id?: number;

  @Column()
  appointment_type_id?: number;

  @Column({ type: 'timestamp' })
  start_time!: Date;

  @Column({ type: 'timestamp' })
  end_time!: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.REQUESTED
  })
  status!: AppointmentStatus;

  @Column({ nullable: true, length: 1000 })
  notes?: string;

  @Column({ nullable: true, length: 1000 })
  cancellation_reason?: string;

  @Column({ default: false })
  reminder_sent?: boolean;

  @Column({ nullable: true })
  specialty_id?: number; 

  @Column({ nullable: true })
  location?: string; 

  @Column({ nullable: true })
  modified_by_id?: number; 

  @Column({ nullable: true })
  recurring_appointment_id?: number;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
  

  // Relaciones
  @OneToOne(() => MedicalSpecialties)
  @JoinColumn({ name: 'specialty_id' })
  specialty!: MedicalSpecialties;
  
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => HealthProfessional)
  @JoinColumn({ name: 'professional_id' })
  professional?: HealthProfessional;

  @ManyToOne(() => AppointmentType)
  @JoinColumn({ name: 'appointment_type_id' })
  appointmentType?: AppointmentType;

  @ManyToOne(() => RecurringAppointment)
  @JoinColumn({ name: 'recurring_appointment_id' })
  recurring_appointment?: RecurringAppointment;
}