import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Address extends BaseEntity {
  @Column()
  cep: string;

  @Column()
  neighborhood: string;

  @Column()
  street: string;

  @Column()
  state: string;

  @Column()
  city: string;

  @Column()
  number: string;

  @Column({ type: 'text', nullable: true })
  complement: string | null;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
