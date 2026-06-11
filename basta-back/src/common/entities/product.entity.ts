import { Collection } from 'src/common/entities/collection.entity';
import { Entity, ManyToMany } from 'typeorm';
import { CatalogItemFields } from './catalog-item-fields.entity';

@Entity()
export class Product extends CatalogItemFields {
  @ManyToMany(() => Collection, (collection) => collection.products, {
    onDelete: 'CASCADE',
  })
  collections: Collection[];
}
