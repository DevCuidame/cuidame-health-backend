import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.model';

@Entity('enfermedades')
export class Disease {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  id_paciente!: number;

  @Column({ nullable: true })
  enfermedad?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.diseases)
  @JoinColumn({ name: 'id_paciente' })
  patient!: Patient;
}