import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from './user-role.model';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true, nullable: true })
  code?: string;

  @Column({ unique: true, nullable: true })
  hashcode?: string;

  @Column()
  name!: string;

  @Column()
  lastname!: string;

  @Column()
  typeid!: string;

  @Column({ nullable: true })
  numberid?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  birth_date?: string;

  @Column({ nullable: true })
  city_id?: number;

  @Column()
  phone!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  parentesco?: string;

  @Column({ unique: true, nullable: true })
  notificationid?: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ nullable: true })
  session_token?: string;

  @Column()
  verificado!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  pubname?: string;

  @Column({ nullable: true })
  privname?: string;

  @Column({ nullable: true, type: 'text' })
  imagebs64?: string;

  @Column({ nullable: true })
  path?: string;

}