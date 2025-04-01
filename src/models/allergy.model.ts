import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.model';

@Entity('alergias')
export class Allergy {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  id_paciente!: number;

  @Column({ nullable: true })
  tipo_alergia?: string;

  @Column({ nullable: true, length: 1000 })
  descripcion?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.allergies)
  @JoinColumn({ name: 'id_paciente' })
  patient!: Patient;
}