import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { BaseEntity } from './base.entity';

@Entity()
export class Order extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.RESERVADO })
  status: OrderStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user: User | null;

  @ManyToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  address: Address | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;

  @Column({ type: 'timestamptz', nullable: true })
  emSeparacaoAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  enviadoAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  entregueAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  canceladoAt: Date | null;
}
