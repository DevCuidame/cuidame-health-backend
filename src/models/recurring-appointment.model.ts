// src/models/recurring-appointment.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { HealthProfessional } from './health-professional.model';
import { Patient } from './patient.model';
import { AppointmentType } from './appointment-type.model';
import { Appointment } from './appointment.model';

export enum RecurrencePattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export enum RecurrenceEndType {
  NEVER = 'never',
  AFTER_OCCURRENCES = 'after_occurrences',
  ON_DATE = 'on_date'
}

@Entity('recurring_appointments')
export class RecurringAppointment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  patient_id!: number;

  @Column()
  professional_id!: number;

  @Column()
  appointment_type_id!: number;

  @Column({ type: 'timestamp' })
  start_time!: Date; // Hora de inicio de la primera cita

  @Column({ type: 'timestamp' })
  end_time!: Date; // Hora de fin de la primera cita

  @Column({
    type: 'enum',
    enum: RecurrencePattern,
    default: RecurrencePattern.WEEKLY
  })
  recurrence_pattern!: RecurrencePattern;

  @Column({ default: 1 })
  recurrence_interval!: number; // Intervalo de recurrencia (cada X días/semanas/meses)

  @Column({ type: 'simple-array', nullable: true })
  days_of_week?: number[]; // Para recurrencia semanal (0-6, donde 0 es domingo)

  @Column({ nullable: true })
  day_of_month?: number; // Para recurrencia mensual

  @Column({
    type: 'enum',
    enum: RecurrenceEndType,
    default: RecurrenceEndType.AFTER_OCCURRENCES
  })
  end_type!: RecurrenceEndType;

  @Column({ nullable: true })
  occurrences?: number; // Número de ocurrencias si end_type es AFTER_OCCURRENCES

  @Column({ type: 'timestamp', nullable: true })
  end_date?: Date; // Fecha de fin si end_type es ON_DATE

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true, length: 1000 })
  notes?: string;

  @Column({ nullable: true })
  modified_by_id?: number; // ID del usuario que modificó la recurrencia por última vez

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => HealthProfessional)
  @JoinColumn({ name: 'professional_id' })
  professional!: HealthProfessional;

  @ManyToOne(() => AppointmentType)
  @JoinColumn({ name: 'appointment_type_id' })
  appointmentType!: AppointmentType;

  @OneToMany(() => Appointment, appointment => appointment.recurring_appointment)
  appointments!: Appointment[];
}