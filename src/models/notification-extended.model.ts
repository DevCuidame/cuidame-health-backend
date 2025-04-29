// src/models/notification-extended.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NotificationType, NotificationStatus, Notification } from './notification.model';

/**
 * Modelo para plantillas de notificaciones
 */
@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type!: NotificationType;

  @Column()
  subject!: string;

  @Column({ type: 'text' })
  body_template!: string;

  @Column({ type: 'jsonb', nullable: true })
  variables?: string[];

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

/**
 * Modelo para preferencias de notificaciones de usuarios
 */
@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  user_id!: number;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  notification_type!: NotificationType;

  @Column({ default: true })
  email_enabled!: boolean;

  @Column({ default: true })
  push_enabled!: boolean;

  @Column({ default: true })
  inapp_enabled!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

/**
 * Modelo para la cola de notificaciones
 */
@Entity('notification_queue')
export class NotificationQueue {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  notification_id!: number;

  @Column()
  delivery_type!: string; // 'email', 'push', 'inapp'

  @Column({ type: 'jsonb' })
  payload!: any;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  status!: string;

  @Column({ default: 0 })
  retries!: number;

  @Column({ default: 3 })
  max_retries!: number;

  @Column({ nullable: true })
  next_retry?: Date;

  @Column({ nullable: true, type: 'text' })
  error?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification!: Notification;
}

/**
 * Modelo para registrar eventos de entrega de notificaciones
 */
@Entity('notification_delivery_logs')
export class NotificationDeliveryLog {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  notification_id!: number;

  @Column()
  delivery_type!: string; // 'email', 'push', 'inapp'

  @Column({
    type: 'enum',
    enum: ['success', 'failure'],
    default: 'success'
  })
  status!: string;

  @Column({ nullable: true, type: 'text' })
  details?: string;

  @Column({ nullable: true })
  recipient?: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification!: Notification;
}