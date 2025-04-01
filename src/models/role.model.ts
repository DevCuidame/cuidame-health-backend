import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.model';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column()
  status!: boolean;

  // Relaciones
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles!: UserRole[];
}