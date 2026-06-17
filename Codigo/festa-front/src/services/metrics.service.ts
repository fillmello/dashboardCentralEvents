import api from "@/src/lib/api";
import type { PostFormat, PostStatus, PostType } from "@/src/lib/domain";

export type GeneralKpis = {
  total: number;
  published: number;
  publishedPct: number;
  inProgress: number;
  notStarted: number;
  byStatus: Record<PostStatus, number>;
  byType: Record<PostType, number>;
  byFormat: Record<PostFormat, number>;
};

export type CollaboratorKpi = {
  userId: number;
  fullName: string;
  assigned: number;
  published: number;
};

export type StageTimes = Record<PostStatus, number | null>;

export const metricsService = {
  general: () => api.get("/metrics/general") as unknown as Promise<GeneralKpis>,
  collaborators: () =>
    api.get("/metrics/collaborators") as unknown as Promise<CollaboratorKpi[]>,
  stageTimes: () =>
    api.get("/metrics/stage-times") as unknown as Promise<StageTimes>,
  // The spreadsheet needs the raw binary response + auth header, so it bypasses
  // the unwrapping axios instance and is fetched directly with the stored token.
  exportXlsxUrl: () => `${process.env.NEXT_PUBLIC_API_URL}/metrics/export.xlsx`,
};
