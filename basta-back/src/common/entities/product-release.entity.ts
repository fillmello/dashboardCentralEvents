import { Release } from 'src/common/entities/release.entity';
import { Entity, ManyToMany, OneToMany } from 'typeorm';
import { CatalogItemFields } from './catalog-item-fields.entity';
import { Feedback } from './feedback.entity';

@Entity()
export class ProductRelease extends CatalogItemFields {
    @ManyToMany(() => Release, (release) => release.productReleases, {
      onDelete: 'CASCADE',
    })
    releases: Release[];

    @OneToMany(() => Feedback, (feedback) => feedback.productRelease)
      feedbacks: Feedback[];
}
