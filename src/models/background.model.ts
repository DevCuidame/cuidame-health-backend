import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.model';

// Modelo para antecedentes médicos
@Entity('antecedentes')
export class Background {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  id_paciente!: number;

  @Column({ nullable: true })
  tipo_antecedente?: string;

  @Column({ nullable: true, length: 1000 })
  descripcion_antecedente?: string;

  @Column({ type: 'date', nullable: true })
  fecha_antecedente?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.backgrounds)
  @JoinColumn({ name: 'id_paciente' })
  patient!: Patient;
}

// Modelo para antecedentes familiares
@Entity('atecedentes_familiares')
export class FamilyBackground {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  id_paciente!: number;

  @Column({ nullable: true })
  tipo_antecedente?: string;

  @Column({ nullable: true })
  parentesco?: string;

  @Column({ nullable: true, length: 1000 })
  descripcion_antecedente?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.familyBackgrounds)
  @JoinColumn({ name: 'id_paciente' })
  patient!: Patient;
}

// Modelo para vacunas
@Entity('vacunas')
export class Vaccine {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  id_paciente!: number;

  @Column({ nullable: true })
  vacuna?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.vaccines)
  @JoinColumn({ name: 'id_paciente' })
  patient!: Patient;
}