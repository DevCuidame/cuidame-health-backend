// src/models/time-block.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HealthProfessional } from './health-professional.model';

@Entity('time_blocks')
export class TimeBlock {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  professional_id!: number;

  @Column({ type: 'timestamp' })
  start_time!: Date;

  @Column({ type: 'timestamp' })
  end_time!: Date;

  @Column()
  reason!: string;

  @Column({ default: false })
  is_recurring!: boolean;

  @Column({ nullable: true })
  recurrence_pattern?: string; // JSON string para patrones de recurrencia

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => HealthProfessional)
  @JoinColumn({ name: 'professional_id' })
  professional!: HealthProfessional;
}