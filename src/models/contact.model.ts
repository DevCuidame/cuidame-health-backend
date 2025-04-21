import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';

@Entity('contactos')
export class Contact {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  id_usuario!: number;

  @Column({ nullable: true })
  nombre1?: string;

  @Column({ nullable: true })
  telefono1?: string;

  @Column({ nullable: true })
  nombre2?: string;

  @Column({ nullable: true })
  telefono2?: string;

  @Column({ nullable: true })
  nombre3?: string;

  @Column({ nullable: true })
  telefono3?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relación con el usuario
  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_usuario' })
  user!: User;
}