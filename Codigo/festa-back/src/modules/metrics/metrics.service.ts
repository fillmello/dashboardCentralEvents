import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/common/entities/post.entity';
import { PostStatusLog } from 'src/common/entities/post-status-log.entity';
import { User } from 'src/common/entities/user.entity';
import { PostType } from 'src/common/enums/post-type.enum';
import { PostStatus, PIPELINE_ORDER } from 'src/common/enums/post-status.enum';

export interface GeneralKpis {
  total: number;
  published: number;
  publishedPct: number;
  inProgress: number;
  notStarted: number;
  byStatus: Record<PostStatus, number>;
  byType: Record<PostType, number>;
}

export interface CollaboratorKpi {
  userId: number;
  fullName: string;
  assigned: number;
  published: number;
}

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostStatusLog)
    private logsRepository: Repository<PostStatusLog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // RF-14: consolidated counters in real time.
  async general(): Promise<GeneralKpis> {
    const posts = await this.postsRepository.find();
    const byStatus = Object.fromEntries(
      PIPELINE_ORDER.map((s) => [s, 0]),
    ) as Record<PostStatus, number>;
    const byType = Object.fromEntries(
      Object.values(PostType).map((t) => [t, 0]),
    ) as Record<PostType, number>;

    for (const post of posts) {
      byStatus[post.status]++;
      byType[post.type]++;
    }

    const total = posts.length;
    const published = byStatus[PostStatus.PUBLICADO];
    const notStarted = byStatus[PostStatus.NAO_INICIADO];
    const inProgress = total - published - notStarted;
    const publishedPct = total ? Math.round((published / total) * 100) : 0;

    return { total, published, publishedPct, inProgress, notStarted, byStatus, byType };
  }

  // RF-15: per-collaborator delivery (assigned vs published).
  async perCollaborator(): Promise<CollaboratorKpi[]> {
    const users = await this.usersRepository.find({
      select: { id: true, fullName: true },
      order: { fullName: 'ASC' },
    });
    const posts = await this.postsRepository.find({
      relations: { responsible: true },
    });

    const stats = new Map<number, CollaboratorKpi>(
      users.map((u) => [
        u.id,
        { userId: u.id, fullName: u.fullName, assigned: 0, published: 0 },
      ]),
    );

    for (const post of posts) {
      const owner = post.responsible;
      if (!owner) continue;
      const entry = stats.get(owner.id);
      if (!entry) continue;
      entry.assigned++;
      if (post.status === PostStatus.PUBLICADO) entry.published++;
    }

    return [...stats.values()];
  }

  /**
   * RF-16: average seconds spent per stage. Between two consecutive logs of a
   * post, the elapsed time is attributed to the status entered by the earlier
   * log. The current (still-open) stage of each post is excluded.
   */
  async stageTimes(): Promise<Record<PostStatus, number | null>> {
    const logs = await this.logsRepository.find({
      relations: { post: true },
      order: { createdAt: 'ASC' },
    });

    const byPost = new Map<number, PostStatusLog[]>();
    for (const log of logs) {
      if (!log.post) continue;
      const list = byPost.get(log.post.id) ?? [];
      list.push(log);
      byPost.set(log.post.id, list);
    }

    const acc = new Map<PostStatus, { sumMs: number; count: number }>();
    for (const entries of byPost.values()) {
      for (let i = 0; i < entries.length - 1; i++) {
        const stage = entries[i].toStatus;
        const ms =
          entries[i + 1].createdAt.getTime() - entries[i].createdAt.getTime();
        const cur = acc.get(stage) ?? { sumMs: 0, count: 0 };
        cur.sumMs += ms;
        cur.count += 1;
        acc.set(stage, cur);
      }
    }

    return Object.fromEntries(
      PIPELINE_ORDER.map((s) => {
        const cur = acc.get(s);
        return [s, cur && cur.count ? Math.round(cur.sumMs / cur.count / 1000) : null];
      }),
    ) as Record<PostStatus, number | null>;
  }

  // RF-17: quick CSV extraction of the post map for meetings/reports.
  async exportPostsCsv(): Promise<string> {
    const posts = await this.postsRepository.find({
      relations: { responsible: true },
      order: { createdAt: 'ASC' },
    });

    const header = [
      'id',
      'nome',
      'plataforma',
      'tipo',
      'formato',
      'status',
      'responsavel',
      'criadoEm',
      'atualizadoEm',
    ];
    const rows = posts.map((p) => [
      String(p.id),
      p.name,
      p.platform,
      p.type,
      p.format,
      p.status,
      p.responsible?.fullName ?? '',
      p.createdAt.toISOString(),
      p.updatedAt.toISOString(),
    ]);

    return [header, ...rows].map((cols) => cols.map(csvCell).join(',')).join('\n');
  }
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
