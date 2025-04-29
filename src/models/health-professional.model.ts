// src/models/health-professional.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';
import { Appointment } from './appointment.model';

@Entity('health_professionals')
export class HealthProfessional {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  specialty!: string;

  @Column()
  license_number!: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  consultation_fee?: number;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ default: 30 })
  default_appointment_duration!: number; // en minutos

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Appointment, appointment => appointment.professional)
  appointments!: Appointment[];
}