    // src/models/appointment-type.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Appointment } from './appointment.model';

@Entity('appointment_types')
export class AppointmentType {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true, length: 1000 })
  description?: string;

  @Column({ default: 30 })
  default_duration!: number; // en minutos

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  color_code?: string; // Para representación visual

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @OneToMany(() => Appointment, appointment => appointment.appointmentType)
  appointments!: Appointment[];
}