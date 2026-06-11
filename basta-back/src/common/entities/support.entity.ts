import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { SupportMessage } from './support-message.entity';
import { SupportCategory } from '../enums/support-category.enum';
import { SupportStatus } from '../enums/support-status.enum';
import { SupportFileType } from '../enums/support-file-type.enum';

@Entity()
export class Support extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: SupportCategory,
    default: SupportCategory.PROBLEMA,
  })
  category: SupportCategory;

  @Column({
    type: 'enum',
    enum: SupportStatus,
    default: SupportStatus.OPEN,
  })
  status: SupportStatus;

  @Column({ type: 'text', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'enum', enum: SupportFileType, nullable: true })
  fileType: SupportFileType | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => SupportMessage, (message) => message.support, {
    cascade: true,
  })
  messages: SupportMessage[];
}
