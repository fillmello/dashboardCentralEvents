import type { Role } from "@/src/lib/auth-client";

// --- Event ------------------------------------------------------------------

// Programação starts here (20 June 2026, 14:00, local time). Drives the
// countdown shown on the dashboard. Month is 0-based, so 5 = June.
export const EVENT_START = new Date(2026, 5, 20, 14, 0, 0);

// --- Roles ------------------------------------------------------------------

export const ROLE_LABELS: Record<Role, string> = {
  gestao: "Gestão",
  painel: "Painel",
  individual: "Individual",
};

// --- Platform / Type / Format ----------------------------------------------

export const PLATFORMS = ["instagram", "whatsapp", "youtube"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
};

export const POST_TYPES = ["criativo", "video"] as const;
export type PostType = (typeof POST_TYPES)[number];
export const POST_TYPE_LABELS: Record<PostType, string> = {
  criativo: "Criativo",
  video: "Vídeo",
};

export const POST_FORMATS = ["feed", "story", "reels", "capa"] as const;
export type PostFormat = (typeof POST_FORMATS)[number];
export const POST_FORMAT_LABELS: Record<PostFormat, string> = {
  feed: "Feed",
  story: "Story",
  reels: "Reels",
  capa: "Capa",
};

// --- Pipeline status (RF-05) ------------------------------------------------

export const PIPELINE = [
  "nao_iniciado",
  "captando",
  "editando",
  "aprovacao",
  "copy",
  "capa",
  "em_publicacao",
  "publicado",
] as const;
export type PostStatus = (typeof PIPELINE)[number];

export const STATUS_LABELS: Record<PostStatus, string> = {
  nao_iniciado: "Não iniciado",
  captando: "Captando",
  editando: "Editando",
  aprovacao: "Aprovação",
  copy: "Copy",
  capa: "Capa",
  em_publicacao: "Em publicação",
  publicado: "Publicado",
};

// Column accent per stage — used by the board legend (RNF: fixed legend).
export const STATUS_COLOR: Record<PostStatus, string> = {
  nao_iniciado: "#b0b0b0",
  captando: "#8a6d3b",
  editando: "#c58a00",
  aprovacao: "#6a1b9a",
  copy: "#184888",
  capa: "#00695c",
  em_publicacao: "#2a622a",
  publicado: "#000000",
};

export function statusIndex(status: PostStatus): number {
  return PIPELINE.indexOf(status);
}

export function nextStatus(status: PostStatus): PostStatus | null {
  const idx = statusIndex(status);
  return idx >= 0 && idx < PIPELINE.length - 1 ? PIPELINE[idx + 1] : null;
}

export function prevStatus(status: PostStatus): PostStatus | null {
  const idx = statusIndex(status);
  return idx > 0 ? PIPELINE[idx - 1] : null;
}

// The Aprovação stage isn't a plain "advance": the Gestão opens the approval
// modal there to decide Copy/Capa + assignees. Board advance/revert skip it.
export const APPROVAL_STATUS: PostStatus = "aprovacao";

export function isApprovalStage(status: PostStatus): boolean {
  return status === APPROVAL_STATUS;
}

// Board controls are Gestão-only (Painel is read-only). Gestão moves freely,
// except at Aprovação where the approval modal takes over the forward move.
export function canAdvance(role: Role, status: PostStatus): boolean {
  return (
    role === "gestao" && !isApprovalStage(status) && nextStatus(status) !== null
  );
}

export function canRevert(role: Role): boolean {
  return role === "gestao";
}

// Individual production actions: "Começar" (Não iniciado → Captando) and
// "Entregar" (Captando/Editando → Aprovação). After delivering, the post leaves
// the individual's hands and shows as "Entregue". Mirrors the backend rules.
export const STARTED_STATUS: PostStatus = "captando";
export const PRODUCTION_DELIVER_STATUS: PostStatus = "aprovacao";

export function canStart(status: PostStatus): boolean {
  return status === "nao_iniciado";
}

export function canDeliverProduction(status: PostStatus): boolean {
  return status === "captando" || status === "editando";
}

// Copy/Capa completion targets. Completing Copy jumps to Capa when it's needed,
// otherwise straight to Em publicação; completing Capa always goes to publicação.
export function copyNextStatus(needsCapa: boolean): PostStatus {
  return needsCapa ? "capa" : "em_publicacao";
}

export const CAPA_NEXT_STATUS: PostStatus = "em_publicacao";
