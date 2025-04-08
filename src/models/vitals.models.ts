import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../modules/patient/patient.model';

// Modelo para frecuencia cardíaca
@Entity('heart_rate')
export class HeartRate {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  patient_id!: number;

  @Column()
  rate!: number;

  @Column()
  date!: Date;

  @CreateDateColumn({ nullable: true })
  created_at?: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.heartRates)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}

// Modelo para presión arterial
@Entity('blood_pressure')
export class BloodPressure {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  patient_id!: number;

  @Column()
  systolic!: number;

  @Column()
  diastolic!: number;

  @Column()
  date!: Date;

  @CreateDateColumn({ nullable: true })
  created_at?: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.bloodPressures)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}

// Modelo para glucosa en sangre
@Entity('blood_glucose')
export class BloodGlucose {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  patient_id!: number;

  @Column()
  rate!: number;

  @Column()
  date!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.bloodGlucoses)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}

// Modelo para oxígeno en sangre
@Entity('blood_oxygen')
export class BloodOxygen {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  patient_id!: number;

  @Column()
  rate!: number;

  @Column()
  date!: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.bloodOxygens)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}

// Modelo para frecuencia respiratoria
@Entity('respiratory_rate')
export class RespiratoryRate {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  patient_id!: number;

  @Column()
  rate!: number;

  @Column()
  date!: Date;

  @CreateDateColumn({ nullable: true })
  created_at?: Date;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.respiratoryRates)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}