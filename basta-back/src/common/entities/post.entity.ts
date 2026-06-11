import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { PostStatus, PostType, PostFormat, Platform } from '../enums/post.enum';

@Entity('posts')
export class Post extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'enum', enum: PostType })
  type: PostType;

  @Column({ type: 'enum', enum: PostFormat })
  format: PostFormat;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.NaoIniciado,
  })
  status: PostStatus;

  @Column({ type: 'uuid' })
  responsibleId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsibleId' })
  responsible: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  updatedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ type: 'uuid', nullable: true })
  eventoId: string;

  @OneToMany(() => PostStatusHistory, (history) => history.post, {
    cascade: true,
  })
  statusHistory: PostStatusHistory[];
}

@Entity('post_status_history')
export class PostStatusHistory extends BaseEntity {
  @Column({ type: 'enum', enum: PostStatus })
  previousStatus: PostStatus;

  @Column({ type: 'enum', enum: PostStatus })
  newStatus: PostStatus;

  @Column({ type: 'uuid' })
  postId: string;

  @ManyToOne(() => Post, (post) => post.statusHistory)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'uuid' })
  changedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changedById' })
  changedBy: User;

  @Column({ type: 'text', nullable: true })
  reason: string;
}
