// src/models/code.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('codes')
export class Code {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column({ unique: true })
  hashcode!: string;

  @Column()
  license!: string;

  @Column({ nullable: true })
  agreement?: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ nullable: true })
  status?: string;
}