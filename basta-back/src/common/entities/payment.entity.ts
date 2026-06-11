import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { BaseEntity } from './base.entity';

@Entity()
export class Payment extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  providerPaymentId: string | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  qrCode: string | null;

  @Column({ type: 'text', nullable: true })
  qrCodeBase64: string | null;

  @Column({ type: 'text', nullable: true })
  ticketUrl: string | null;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Order;
}
