import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { PostStatusLog } from './post-status-log.entity';
import { Platform } from 'src/common/enums/platform.enum';
import { PostType } from 'src/common/enums/post-type.enum';
import { PostFormat } from 'src/common/enums/post-format.enum';
import { PostStatus } from 'src/common/enums/post-status.enum';

/**
 * A demanda on the "mapa de posts" (RF-01). Moves through the production
 * pipeline (RF-05); every status change is recorded in PostStatusLog (RF-07).
 */
@Entity('post')
export class Post extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // The "responsável". Owner-scoping (RF-08) is done against this relation.
  // SET NULL keeps the post (and its audit trail) if the user is deleted.
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  responsible: User | null;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'enum', enum: PostType })
  type: PostType;

  @Column({ type: 'enum', enum: PostFormat })
  format: PostFormat;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.NAO_INICIADO })
  status: PostStatus;

  @OneToMany(() => PostStatusLog, (log) => log.post)
  statusLogs: PostStatusLog[];
}
