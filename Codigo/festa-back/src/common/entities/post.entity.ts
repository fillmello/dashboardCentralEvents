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

  // The "responsável" pela produção (captação/edição). Owner-scoping (RF-08) is
  // done against this relation. SET NULL keeps the post (and its audit trail)
  // if the user is deleted.
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  responsible: User | null;

  // Assigned on approval — who does the Copy / Capa steps. A post may not need a
  // step at all (needsCopy/needsCapa = false); the pipeline then skips it and no
  // responsible is set.
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  copyResponsible: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  capaResponsible: User | null;

  @Column({ type: 'boolean', default: true })
  needsCopy: boolean;

  @Column({ type: 'boolean', default: true })
  needsCapa: boolean;

  // In the combined COPY_CAPA stage, Copy and Capa are delivered independently.
  // The post advances to EM_PUBLICACAO only once every needed delivery is done.
  @Column({ type: 'boolean', default: false })
  copyDelivered: boolean;

  @Column({ type: 'boolean', default: false })
  capaDelivered: boolean;

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
