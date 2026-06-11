import { Column, Entity, ManyToOne } from 'typeorm';
import { ProductRelease } from './product-release.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Feedback extends BaseEntity {
    @Column()
    description: string;

    @Column({ type: 'text', nullable: true, default: null })
    adminResponse: string | null;

    @Column({ type: 'timestamp', nullable: true, default: null })
    respondedAt: Date | null;

    @ManyToOne(() => ProductRelease, (productRelease) => productRelease.feedbacks, { onDelete: 'CASCADE' })
    productRelease: ProductRelease;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    usr: User;
}