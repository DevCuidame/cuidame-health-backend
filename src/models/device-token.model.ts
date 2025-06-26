import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';

export enum DevicePlatform {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web'
}

@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  user_id!: number;

  @Column({ unique: true })
  token!: string;

  @Column({
    type: 'enum',
    enum: DevicePlatform
  })
  platform!: DevicePlatform;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  device_info?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}