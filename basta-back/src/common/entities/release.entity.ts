import { ProductRelease } from 'src/common/entities/product-release.entity';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Release extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column({ type: 'int', default: 0 })
  soldQuantity: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @ManyToMany(
    () => ProductRelease,
    (productRelease) => productRelease.releases,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinTable({ name: 'release_product' })
  productReleases: ProductRelease[];
}
