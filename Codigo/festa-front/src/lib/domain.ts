import type { Role } from "@/src/lib/auth-client";

// --- Event ------------------------------------------------------------------

// Programação starts here (20 June 2026, 14:00, local time). Drives the
// countdown shown on the dashboard. Month is 0-based, so 5 = June.
export const EVENT_START = new Date(2026, 5, 20, 14, 0, 0);

// --- Roles ------------------------------------------------------------------

export const ROLE_LABELS: Record<Role, string> = {
  gestao: "Coordenação",
  head: "Head",
  painel: "Painel",
  individual: "Operativo",
};

// Who can be made responsible for a demand (produção, copy or capa): only Head
// and Operativo. Coordenação (admin/organizers) and Painel never receive tasks.
export function isAssignableRole(role: Role): boolean {
  return role === "head" || role === "individual";
}

// A user can be made responsible only if its role allows it (Head or Operativo).
export function isAssignableUser(user: { role: Role }): boolean {
  return isAssignableRole(user.role);
}

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

export const POST_FORMATS = [
  // Instagram · Criativo
  "capa_reels",
  "post_unico",
  "galeria",
  "story_fotos",
  "story_informativo",
  // Instagram · Vídeo
  "reels",
  "reels_mobile",
  "video_galeria",
  // WhatsApp · Criativo
  "arte_informativa",
  "capa_video",
  // WhatsApp · Vídeo
  "video_informativo",
  // YouTube · Criativo
  "template_video",
  "capa_youtube",
  // YouTube · Vídeo
  "sameday",
  "conceito",
] as const;
export type PostFormat = (typeof POST_FORMATS)[number];
export const POST_FORMAT_LABELS: Record<PostFormat, string> = {
  capa_reels: "Capa Reels",
  post_unico: "Post Único",
  galeria: "Galeria",
  story_fotos: "Story Fotos",
  story_informativo: "Story Informativo",
  reels: "Reels",
  reels_mobile: "Reels Mobile",
  video_galeria: "Vídeo p/ Galeria",
  arte_informativa: "Arte Informativa",
  capa_video: "Capa de Vídeo",
  video_informativo: "Vídeo Informativo",
  template_video: "Template Vídeo",
  capa_youtube: "Capa YouTube",
  sameday: "SameDay",
  conceito: "Conceito",
};

// Which formats are valid per platform + type. The format options in the post
// form depend on this matrix; the backend enforces the same rule.
export const FORMATS_BY_PLATFORM_TYPE: Record<
  Platform,
  Record<PostType, PostFormat[]>
> = {
  instagram: {
    criativo: [
      "capa_reels",
      "post_unico",
      "galeria",
      "story_fotos",
      "story_informativo",
    ],
    video: ["reels", "reels_mobile", "video_galeria"],
  },
  whatsapp: {
    criativo: ["arte_informativa", "capa_video"],
    video: ["video_informativo"],
  },
  youtube: {
    criativo: ["template_video", "capa_youtube"],
    video: ["sameday", "conceito"],
  },
};

export function formatsFor(platform: Platform, type: PostType): PostFormat[] {
  return FORMATS_BY_PLATFORM_TYPE[platform][type];
}

// All formats that belong to a type, across every platform (each format maps to
// a single platform+type). Used by the KPI panel to break a type into formats.
export function formatsForType(type: PostType): PostFormat[] {
  const out: PostFormat[] = [];
  for (const platform of PLATFORMS) {
    for (const format of FORMATS_BY_PLATFORM_TYPE[platform][type])
      if (!out.includes(format)) out.push(format);
  }
  return out;
}

// --- Pipeline status (RF-05) ------------------------------------------------

// Board column order. The production path is type/format-dependent (Criativo →
// Criando, Vídeo → Editando, Reels Mobile → Captando → Editando); all share the
// rest. Copy & Capa are one parallel stage.
export const PIPELINE = [
  "nao_iniciado",
  "captando",
  "editando",
  "criando",
  "aprovacao",
  "copy_capa",
  "em_publicacao",
  "publicado",
] as const;
export type PostStatus = (typeof PIPELINE)[number];

export const STATUS_LABELS: Record<PostStatus, string> = {
  nao_iniciado: "Não iniciado",
  captando: "Captando",
  editando: "Editando",
  criando: "Criando",
  aprovacao: "Aprovação",
  copy_capa: "Copy & Capa",
  em_publicacao: "Em publicação",
  publicado: "Publicado",
};

// Column accent per stage — used by the board legend (RNF: fixed legend).
export const STATUS_COLOR: Record<PostStatus, string> = {
  nao_iniciado: "#b0b0b0",
  captando: "#5a6e8a",
  editando: "#c58a00",
  criando: "#8a6d3b",
  aprovacao: "#6a1b9a",
  copy_capa: "#184888",
  em_publicacao: "#2a622a",
  publicado: "#000000",
};

export function statusIndex(status: PostStatus): number {
  return PIPELINE.indexOf(status);
}

// Production path by type/format: Criativo creates ("Criando"); Vídeo edits
// ("Editando"); Reels Mobile captures first, then edits ("Captando" → "Editando")
// because the footage is shot at the Central and uploaded before editing.
const CRIATIVO_FLOW: PostStatus[] = [
  "nao_iniciado",
  "criando",
  "aprovacao",
  "copy_capa",
  "em_publicacao",
  "publicado",
];
const VIDEO_FLOW: PostStatus[] = [
  "nao_iniciado",
  "editando",
  "aprovacao",
  "copy_capa",
  "em_publicacao",
  "publicado",
];
const REELS_MOBILE_FLOW: PostStatus[] = [
  "nao_iniciado",
  "captando",
  "editando",
  "aprovacao",
  "copy_capa",
  "em_publicacao",
  "publicado",
];

export function flowFor(type: PostType, format: PostFormat): PostStatus[] {
  if (type === "criativo") return CRIATIVO_FLOW;
  if (format === "reels_mobile") return REELS_MOBILE_FLOW;
  return VIDEO_FLOW;
}

// Production steps: the flow stages strictly between "nao_iniciado" and
// "aprovacao". Usually a single step; Reels Mobile has two (Captando → Editando).
export function productionStatuses(
  type: PostType,
  format: PostFormat,
): PostStatus[] {
  const flow = flowFor(type, format);
  return flow.slice(1, flow.indexOf("aprovacao"));
}

// First production stage a post enters when started.
export function firstProductionStatus(
  type: PostType,
  format: PostFormat,
): PostStatus {
  return productionStatuses(type, format)[0];
}

export function nextStatus(
  status: PostStatus,
  type: PostType,
  format: PostFormat,
): PostStatus | null {
  const flow = flowFor(type, format);
  const idx = flow.indexOf(status);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}

export function prevStatus(
  status: PostStatus,
  type: PostType,
  format: PostFormat,
): PostStatus | null {
  // Approval is final: once in Copy & Capa a post can't be reverted to Aprovação
  // (its only previous stage), so revert is disabled there.
  if (status === "copy_capa") return null;
  const flow = flowFor(type, format);
  const idx = flow.indexOf(status);
  return idx > 0 ? flow[idx - 1] : null;
}

// The Aprovação stage isn't a plain "advance": the Coordenação/Head opens the
// approval modal there to decide Copy/Capa + assignees. Board advance skips it.
export const APPROVAL_STATUS: PostStatus = "aprovacao";

export function isApprovalStage(status: PostStatus): boolean {
  return status === APPROVAL_STATUS;
}

// Combined Copy & Capa stage, where both are delivered in parallel.
export const COPY_CAPA_STATUS: PostStatus = "copy_capa";

// Board controls belong to Coordenação + Head (Painel is read-only). They move
// freely, except at Aprovação where the approval modal takes over the forward
// move.
export function managesBoard(role: Role | null): boolean {
  return role === "gestao" || role === "head";
}

export function canAdvance(
  role: Role,
  status: PostStatus,
  type: PostType,
  format: PostFormat,
): boolean {
  return (
    managesBoard(role) &&
    !isApprovalStage(status) &&
    nextStatus(status, type, format) !== null
  );
}

export function canRevert(role: Role): boolean {
  return managesBoard(role);
}

// Production responsible's actions: "Começar" (Não iniciado → Criando/Editando)
// and "Entregar" (→ Aprovação). Copy/Capa are delivered via the deliver endpoint.
export function canStart(status: PostStatus): boolean {
  return status === "nao_iniciado";
}

export function canDeliverProduction(
  status: PostStatus,
  type: PostType,
  format: PostFormat,
): boolean {
  const prod = productionStatuses(type, format);
  return status === prod[prod.length - 1];
}
