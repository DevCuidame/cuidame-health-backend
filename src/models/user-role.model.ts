import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.model';
import { User } from './user.model';

@Entity('userrole')
export class UserRole {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  role_id!: number;

  // // Relaciones
  // @ManyToOne(() => User, user => user.userRoles)
  // @JoinColumn({ name: 'user_id' })
  // user!: User;

  @ManyToOne(() => Role, role => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role!: Role;
}