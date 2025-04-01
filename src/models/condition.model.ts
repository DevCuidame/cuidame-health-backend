import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.model';

@Entity('condicion')
export class Condition {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  id_paciente!: number;

  @Column({ nullable: true })
  discapacidad?: string;

  @Column({ nullable: true })
  embarazada?: string;

  @Column({ nullable: true, length: 1000 })
  cicatrices_descripcion?: string;

  @Column({ nullable: true, length: 1000 })
  tatuajes_descripcion?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.conditions)
  @JoinColumn({ name: 'id_paciente' })
  patient!: Patient;
}