import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductRelease } from './product-release.entity';
import { Size, Gender } from '../enums/product.enums';
import { BaseEntity } from './base.entity';

@Entity()
export class CartItem extends BaseEntity {
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

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  cart: Cart;

  @ManyToOne(() => ProductRelease, { onDelete: 'CASCADE' })
  @JoinColumn()
  productRelease: ProductRelease;
}
