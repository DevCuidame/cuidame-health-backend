import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Allergy } from './allergy.model';
import { Condition } from './condition.model';
import { Background, FamilyBackground, Vaccine } from './background.model';
import {
  HeartRate,
  BloodPressure,
  BloodGlucose,
  BloodOxygen,
  RespiratoryRate,
} from './vitals.models';
import { ControlMedicine } from './control-medicine.model';
import { User } from './user.model';
import { Disease } from './diseases.model';
@Entity('pacientes')
export class Patient {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  code?: string;

  @Column()
  nombre!: string;

  @Column()
  apellido!: string;

  @Column()
  tipoid!: string;

  @Column()
  numeroid!: string;

  @Column()
  telefono!: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento?: Date;

  @Column()
  genero!: string;

  @Column()
  ciudad?: string;

  @Column()
  departamento?: string;

  @Column()
  direccion!: string;

  @Column()
  rh?: string;

  @Column({ nullable: true })
  eps?: string;

  @Column({ nullable: true })
  prepagada?: string;

  @Column({ nullable: true })
  arl?: string;

  @Column({ nullable: true })
  seguro_funerario?: string;

  @Column()
  a_cargo_id!: number;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  enterprise?: string;

  @Column({ nullable: true })
  nit?: string;

  @Column({ nullable: true })
  city_id?: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  photourl?: string;

  @Column({ nullable: true, type: 'text' })
  imagebs64?: string | null;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'a_cargo_id' })
  caregiver!: User;

  @OneToMany(() => Allergy, (allergy) => allergy.patient)
  allergies!: Allergy[];

  @OneToMany(() => Condition, (condition) => condition.patient)
  conditions!: Condition[];

  @OneToMany(() => Disease, (disease) => disease.patient)
  diseases!: Disease[];

  @OneToMany(
    () => FamilyBackground,
    (familyBackground) => familyBackground.patient
  )
  familyBackgrounds!: FamilyBackground[];

  @OneToMany(() => Background, (background) => background.patient)
  backgrounds!: Background[];

  @OneToMany(() => HeartRate, (heartRate) => heartRate.patient)
  heartRates!: HeartRate[];

  @OneToMany(() => BloodPressure, (bloodPressure) => bloodPressure.patient)
  bloodPressures!: BloodPressure[];

  @OneToMany(() => BloodGlucose, (bloodGlucose) => bloodGlucose.patient)
  bloodGlucoses!: BloodGlucose[];

  @OneToMany(() => BloodOxygen, (bloodOxygen) => bloodOxygen.patient)
  bloodOxygens!: BloodOxygen[];

  @OneToMany(
    () => RespiratoryRate,
    (respiratoryRate) => respiratoryRate.patient
  )
  respiratoryRates!: RespiratoryRate[];

  @OneToMany(() => Vaccine, (vaccine) => vaccine.patient)
  vaccines!: Vaccine[];

  @OneToMany(
    () => ControlMedicine,
    (controlMedicine) => controlMedicine.patient
  )
  medicines!: ControlMedicine[];
}
