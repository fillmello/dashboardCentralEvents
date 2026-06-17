import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { SEED_EMAILS } from 'src/data/seed-accounts';
import { Post } from 'src/common/entities/post.entity';
import { PostStatusLog } from 'src/common/entities/post-status-log.entity';
import { User } from 'src/common/entities/user.entity';
import { PostType } from 'src/common/enums/post-type.enum';
import {
  PostFormat,
  FORMATS_BY_PLATFORM_TYPE,
} from 'src/common/enums/post-format.enum';
import { Platform } from 'src/common/enums/platform.enum';
import { PostStatus, PIPELINE_ORDER } from 'src/common/enums/post-status.enum';

export interface GeneralKpis {
  total: number;
  published: number;
  publishedPct: number;
  inProgress: number;
  notStarted: number;
  byStatus: Record<PostStatus, number>;
  byType: Record<PostType, number>;
  // Per-format counts, so the panel can break each type (Criativo/Vídeo) down
  // into its individual formats (RF-14).
  byFormat: Record<PostFormat, number>;
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
    const byFormat = Object.fromEntries(
      Object.values(PostFormat).map((f) => [f, 0]),
    ) as Record<PostFormat, number>;

    for (const post of posts) {
      byStatus[post.status]++;
      byType[post.type]++;
      byFormat[post.format]++;
    }

    const total = posts.length;
    const published = byStatus[PostStatus.PUBLICADO];
    const notStarted = byStatus[PostStatus.NAO_INICIADO];
    const inProgress = total - published - notStarted;
    const publishedPct = total ? Math.round((published / total) * 100) : 0;

    return {
      total,
      published,
      publishedPct,
      inProgress,
      notStarted,
      byStatus,
      byType,
      byFormat,
    };
  }

  // RF-15: per-collaborator delivery (assigned vs published). The seed/backup
  // accounts are excluded from the statistics.
  async perCollaborator(): Promise<CollaboratorKpi[]> {
    const users = await this.usersRepository.find({
      where: { email: Not(In([...SEED_EMAILS])) },
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
        return [
          s,
          cur && cur.count ? Math.round(cur.sumMs / cur.count / 1000) : null,
        ];
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

    return [header, ...rows]
      .map((cols) => cols.map(csvCell).join(','))
      .join('\n');
  }

  // RF-17 (planilha): a real .xlsx report that opens directly in Google Sheets /
  // Excel. Sheet 1 "Resumo" is the general report (totals + published, broken
  // down by type and format, plus average time per stage); sheet 2 "Mapa de
  // Posts" keeps the full post list.
  async exportPostsXlsx(): Promise<Buffer> {
    const posts = await this.postsRepository.find({
      relations: { responsible: true },
      order: { createdAt: 'ASC' },
    });
    const stageTimes = await this.stageTimes();

    const isPublished = (p: Post) => p.status === PostStatus.PUBLICADO;
    const total = posts.length;
    const published = posts.filter(isPublished).length;
    const notStarted = posts.filter(
      (p) => p.status === PostStatus.NAO_INICIADO,
    ).length;
    const inProgress = total - published - notStarted;
    const pct = total ? Math.round((published / total) * 100) : 0;

    const typeTotal = new Map<PostType, number>();
    const typePublished = new Map<PostType, number>();
    const formatTotal = new Map<PostFormat, number>();
    const formatPublished = new Map<PostFormat, number>();
    const bump = (m: Map<string, number>, k: string) =>
      m.set(k, (m.get(k) ?? 0) + 1);
    for (const p of posts) {
      bump(typeTotal as Map<string, number>, p.type);
      bump(formatTotal as Map<string, number>, p.format);
      if (isPublished(p)) {
        bump(typePublished as Map<string, number>, p.type);
        bump(formatPublished as Map<string, number>, p.format);
      }
    }

    const workbook = new ExcelJS.Workbook();
    workbook.created = new Date();

    // --- Sheet 1: Resumo (relatório geral) ---
    const summary = workbook.addWorksheet('Resumo');
    summary.columns = [{ width: 34 }, { width: 14 }, { width: 14 }];
    const sectionRow = (cells: (string | number)[]) => {
      const row = summary.addRow(cells);
      row.font = { bold: true };
      return row;
    };

    summary.addRow(['RELATÓRIO GERAL']).font = { bold: true, size: 14 };
    summary.addRow([]);
    summary.addRow(['Total de posts', total]);
    summary.addRow(['Publicados', published, `${pct}%`]);
    summary.addRow(['Em andamento', inProgress]);
    summary.addRow(['Não iniciados', notStarted]);
    summary.addRow([]);

    sectionRow(['POR TIPO', 'Total', 'Publicados']);
    for (const t of Object.values(PostType)) {
      summary.addRow([
        TYPE_LABELS[t],
        typeTotal.get(t) ?? 0,
        typePublished.get(t) ?? 0,
      ]);
    }
    summary.addRow([]);

    sectionRow(['POR FORMATO', 'Total', 'Publicados']);
    for (const t of Object.values(PostType)) {
      summary.addRow([TYPE_LABELS[t]]).font = { italic: true, bold: true };
      for (const f of formatsForType(t)) {
        summary.addRow([
          `   ${FORMAT_LABELS[f]}`,
          formatTotal.get(f) ?? 0,
          formatPublished.get(f) ?? 0,
        ]);
      }
    }
    summary.addRow([]);

    sectionRow(['TEMPO MÉDIO POR ETAPA', 'Tempo']);
    for (const s of PIPELINE_ORDER) {
      summary.addRow([STATUS_LABELS[s], formatDuration(stageTimes[s])]);
    }

    // --- Sheet 2: Mapa de Posts (lista completa) ---
    const sheet = workbook.addWorksheet('Mapa de Posts');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nome', key: 'name', width: 40 },
      { header: 'Plataforma', key: 'platform', width: 14 },
      { header: 'Tipo', key: 'type', width: 12 },
      { header: 'Formato', key: 'format', width: 18 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Responsável', key: 'responsible', width: 24 },
      { header: 'Criado em', key: 'createdAt', width: 22 },
      { header: 'Atualizado em', key: 'updatedAt', width: 22 },
    ];
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEEEEEE' },
    };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    for (const p of posts) {
      sheet.addRow({
        id: p.id,
        name: p.name,
        platform: PLATFORM_LABELS[p.platform],
        type: TYPE_LABELS[p.type],
        format: FORMAT_LABELS[p.format],
        status: STATUS_LABELS[p.status],
        responsible: p.responsible?.fullName ?? '',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

// All formats that belong to a type, across every platform.
function formatsForType(type: PostType): PostFormat[] {
  const out: PostFormat[] = [];
  for (const platform of Object.values(Platform)) {
    for (const f of FORMATS_BY_PLATFORM_TYPE[platform][type])
      if (!out.includes(f)) out.push(f);
  }
  return out;
}

// Human-readable average duration (seconds → "1h 5m" / "12m 3s" / "45s" / "—").
function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

// Display labels (PT-BR) for the report. Enum values are stored in English/snake;
// these mirror the frontend labels for a readable spreadsheet.
const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.INSTAGRAM]: 'Instagram',
  [Platform.WHATSAPP]: 'WhatsApp',
  [Platform.YOUTUBE]: 'YouTube',
};
const TYPE_LABELS: Record<PostType, string> = {
  [PostType.CRIATIVO]: 'Criativo',
  [PostType.VIDEO]: 'Vídeo',
};
const FORMAT_LABELS: Record<PostFormat, string> = {
  [PostFormat.CAPA_REELS]: 'Capa Reels',
  [PostFormat.POST_UNICO]: 'Post Único',
  [PostFormat.GALERIA]: 'Galeria',
  [PostFormat.STORY_FOTOS]: 'Story Fotos',
  [PostFormat.STORY_INFORMATIVO]: 'Story Informativo',
  [PostFormat.REELS]: 'Reels',
  [PostFormat.REELS_MOBILE]: 'Reels Mobile',
  [PostFormat.VIDEO_GALERIA]: 'Vídeo p/ Galeria',
  [PostFormat.ARTE_INFORMATIVA]: 'Arte Informativa',
  [PostFormat.CAPA_VIDEO]: 'Capa de Vídeo',
  [PostFormat.VIDEO_INFORMATIVO]: 'Vídeo Informativo',
  [PostFormat.TEMPLATE_VIDEO]: 'Template Vídeo',
  [PostFormat.CAPA_YOUTUBE]: 'Capa YouTube',
  [PostFormat.SAMEDAY]: 'SameDay',
  [PostFormat.CONCEITO]: 'Conceito',
};
const STATUS_LABELS: Record<PostStatus, string> = {
  [PostStatus.NAO_INICIADO]: 'Não iniciado',
  [PostStatus.CAPTANDO]: 'Captando',
  [PostStatus.EDITANDO]: 'Editando',
  [PostStatus.CRIANDO]: 'Criando',
  [PostStatus.APROVACAO]: 'Aprovação',
  [PostStatus.COPY]: 'Copy',
  [PostStatus.CAPA]: 'Capa',
  [PostStatus.COPY_CAPA]: 'Copy & Capa',
  [PostStatus.EM_PUBLICACAO]: 'Em publicação',
  [PostStatus.PUBLICADO]: 'Publicado',
};
