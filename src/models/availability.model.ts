// src/models/availability.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HealthProfessional } from './health-professional.model';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  professional_id!: number;

  @Column({
    type: 'enum',
    enum: DayOfWeek
  })
  day_of_week!: DayOfWeek;

  @Column({ type: 'time' })
  start_time!: string;

  @Column({ type: 'time' })
  end_time!: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => HealthProfessional, professional => professional.id)
  @JoinColumn({ name: 'professional_id' })
  professional!: HealthProfessional;
}