import { Role } from 'src/common/enums/role.enum';
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('usr')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.DESIGNER })
  role: Role;

  @Column({ type: 'text', select: false, nullable: true, default: null })
  refreshToken: string | null;
}
