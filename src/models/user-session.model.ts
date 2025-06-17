import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  user_id!: number;

  @Column({ type: 'text' })
  access_token!: string;

  @Column({ type: 'text' })
  refresh_token!: string;

  @Column({ nullable: true })
  device_info?: string;

  @Column({ nullable: true })
  device_name?: string;

  @Column({ nullable: true })
  device_type?: string;

  @Column({ nullable: true })
  ip_address?: string;

  @Column({ nullable: true })
  user_agent?: string;

  @Column()
  expires_at!: Date;

  @Column()
  refresh_expires_at!: Date;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  last_used_at?: Date;

  // Relación con User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}