import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { ProductRelease } from './product-release.entity';
import { Size, Gender } from '../enums/product.enums';
import { BaseEntity } from './base.entity';

@Entity()
export class OrderItem extends BaseEntity {
  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: Size })
  size: Size;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column()
  color: string;

  @ManyToOne(() => ProductRelease, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  productRelease: ProductRelease | null;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;
}
