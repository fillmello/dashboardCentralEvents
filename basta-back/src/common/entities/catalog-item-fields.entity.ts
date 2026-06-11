import { Column } from 'typeorm';
import { Gender, Size } from 'src/common/enums/product.enums';
import { BaseEntity } from './base.entity';

export abstract class CatalogItemFields extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: Size, array: true, default: [] })
  size: Size[];

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column()
  description: string;

  @Column('text', { array: true })
  colors: string[];

  @Column({ type: 'text', nullable: true })
  imageFrontUrl: string | null;

  @Column({ type: 'text', nullable: true })
  imageBackUrl: string | null;

  @Column('text', { array: true, default: '{}' })
  additionalImageUrls: string[];
}
