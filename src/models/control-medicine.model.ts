import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../modules/patient/patient.model';

@Entity('controlMedicines')
export class ControlMedicine {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  medicament_name!: string;

  @Column({ type: 'date' })
  date_order!: Date;

  @Column({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  dose?: string;

  @Column({ nullable: true })
  frequency?: string;

  @Column({ nullable: true })
  quantity?: string;

  @Column({ default: false })
  authorized!: boolean;

  @Column({ default: false })
  mipres!: boolean;

  @Column({ default: false })
  controlled_substances!: boolean;

  @Column({ default: false })
  eps_authorization!: boolean;

  @Column({ nullable: true })
  pharmacy?: string;

  @Column({ type: 'date', nullable: true })
  date_auth?: Date;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true, type: 'text' })
  address?: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true })
  delivery_status?: string;

  @Column({ type: 'date', nullable: true })
  delivery_date?: Date;

  @Column({ nullable: true, type: 'text' })
  comments?: string;

  @Column()
  id_patient!: number;

  // Relaciones
  @ManyToOne(() => Patient, patient => patient.medicines)
  @JoinColumn({ name: 'id_patient' })
  patient!: Patient;

  @OneToMany(() => FileMedicine, fileMedicine => fileMedicine.order)
  files!: FileMedicine[];
}

@Entity('filemedicine')
export class FileMedicine {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  path!: string;

  @Column()
  category!: string;

  @Column()
  id_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ nullable: true, type: 'text', default: '' })
  base64?: string;

  // Relaciones
  @ManyToOne(() => ControlMedicine, order => order.files)
  @JoinColumn({ name: 'id_order' })
  order!: ControlMedicine;
}

@Entity('medicine_changes_history')
export class MedicineChangesHistory {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  table_name!: string;

  @Column()
  record_id!: number;

  @Column()
  change_type!: string;

  @CreateDateColumn()
  changed_at!: Date;

  @Column({ nullable: true })
  user_name?: string;

  @Column({ type: 'jsonb', nullable: true })
  old_data?: object;

  @Column({ type: 'jsonb', nullable: true })
  new_data?: object;
}