import { Entity, OneToOne, OneToMany, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Cart extends BaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}
