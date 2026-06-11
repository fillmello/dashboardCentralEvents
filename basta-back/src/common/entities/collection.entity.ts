import { Product } from 'src/common/entities/product.entity';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Collection extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @ManyToMany(() => Product, (product) => product.collections, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'collection_product' })
  products: Product[];
}
