import { Role } from 'src/common/enums/role.enum';
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('usr')
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  // Self-registered users are always INDIVIDUAL (sees only own tasks). Gestão and
  // Painel accounts are created by the system / an existing Gestão.
  @Column({ type: 'enum', enum: Role, default: Role.INDIVIDUAL })
  role: Role;

  @Column({ type: 'text', select: false, nullable: true })
  refreshToken: string | null;
}
