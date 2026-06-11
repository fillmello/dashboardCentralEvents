import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Support } from './support.entity';
import { SupportFileType } from '../enums/support-file-type.enum';

@Entity()
export class SupportMessage extends BaseEntity {
  @Column()
  isUser: boolean;

  @Column({ type: 'text', nullable: true })
  text: string | null;

  @Column({ type: 'text', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'enum', enum: SupportFileType, nullable: true })
  fileType: SupportFileType | null;

  @Column({ default: false })
  visualized: boolean;

  @ManyToOne(() => Support, (support) => support.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  support: Support;
}
