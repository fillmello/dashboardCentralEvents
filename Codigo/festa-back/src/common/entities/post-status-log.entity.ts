import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';
import { User } from './user.entity';
import { PostStatus } from 'src/common/enums/post-status.enum';

/**
 * Audit record written on every status change (RF-07). `createdAt` (from
 * BaseEntity) is the timestamp of the change; the from/to pair plus changedBy
 * power the bottleneck and average-stage-time KPIs (RF-16).
 */
@Entity('post_status_log')
export class PostStatusLog extends BaseEntity {
  @ManyToOne(() => Post, (post) => post.statusLogs, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Post;

  // Who performed the change. Kept (SET NULL) for audit even if the user goes.
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  changedBy: User | null;

  // Null when the post is first created (initial status has no prior state).
  @Column({ type: 'enum', enum: PostStatus, nullable: true })
  fromStatus: PostStatus | null;

  @Column({ type: 'enum', enum: PostStatus })
  toStatus: PostStatus;
}
