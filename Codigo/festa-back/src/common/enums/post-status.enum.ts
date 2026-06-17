import { PostType } from './post-type.enum';
import { PostFormat } from './post-format.enum';

export enum PostStatus {
  NAO_INICIADO = 'nao_iniciado',
  // Capture stage — only the Reels Mobile flow uses it (footage is shot at the
  // Central and uploaded before editing).
  CAPTANDO = 'captando',
  EDITANDO = 'editando', // Vídeo production path
  CRIANDO = 'criando', // Criativo production path
  APROVACAO = 'aprovacao',
  // Deprecated: the separate Copy/Capa stages were merged into COPY_CAPA, where
  // both are delivered in parallel. Kept only for back-compat.
  COPY = 'copy',
  CAPA = 'capa',
  COPY_CAPA = 'copy_capa',
  EM_PUBLICACAO = 'em_publicacao',
  PUBLICADO = 'publicado',
}

/**
 * Active board column order (RF-05). The production path is type/format-dependent:
 * Criativo → NAO_INICIADO → CRIANDO → APROVACAO; Vídeo → NAO_INICIADO → EDITANDO
 * → APROVACAO; Reels Mobile → NAO_INICIADO → CAPTANDO → EDITANDO → APROVACAO.
 * From APROVACAO on all share COPY_CAPA → EM_PUBLICACAO → PUBLICADO. In COPY_CAPA
 * the Copy and Capa tasks are delivered in parallel (`copyDelivered`/
 * `capaDelivered`); the post only advances once every needed delivery is in.
 *
 * The deprecated COPY/CAPA are intentionally excluded from the flow.
 */
export const PIPELINE_ORDER: readonly PostStatus[] = [
  PostStatus.NAO_INICIADO,
  PostStatus.CAPTANDO,
  PostStatus.EDITANDO,
  PostStatus.CRIANDO,
  PostStatus.APROVACAO,
  PostStatus.COPY_CAPA,
  PostStatus.EM_PUBLICACAO,
  PostStatus.PUBLICADO,
];

export function pipelineIndex(status: PostStatus): number {
  return PIPELINE_ORDER.indexOf(status);
}

// Production flow by type/format. Only Reels Mobile carries the CAPTANDO step.
const CRIATIVO_FLOW: readonly PostStatus[] = [
  PostStatus.NAO_INICIADO,
  PostStatus.CRIANDO,
  PostStatus.APROVACAO,
  PostStatus.COPY_CAPA,
  PostStatus.EM_PUBLICACAO,
  PostStatus.PUBLICADO,
];
const VIDEO_FLOW: readonly PostStatus[] = [
  PostStatus.NAO_INICIADO,
  PostStatus.EDITANDO,
  PostStatus.APROVACAO,
  PostStatus.COPY_CAPA,
  PostStatus.EM_PUBLICACAO,
  PostStatus.PUBLICADO,
];
const REELS_MOBILE_FLOW: readonly PostStatus[] = [
  PostStatus.NAO_INICIADO,
  PostStatus.CAPTANDO,
  PostStatus.EDITANDO,
  PostStatus.APROVACAO,
  PostStatus.COPY_CAPA,
  PostStatus.EM_PUBLICACAO,
  PostStatus.PUBLICADO,
];

export function flowFor(
  type: PostType,
  format: PostFormat,
): readonly PostStatus[] {
  if (type === PostType.CRIATIVO) return CRIATIVO_FLOW;
  if (format === PostFormat.REELS_MOBILE) return REELS_MOBILE_FLOW;
  return VIDEO_FLOW;
}

// Production steps: flow stages strictly between NAO_INICIADO and APROVACAO.
// Usually one step; Reels Mobile has two (CAPTANDO → EDITANDO).
export function productionStatuses(
  type: PostType,
  format: PostFormat,
): readonly PostStatus[] {
  const flow = flowFor(type, format);
  return flow.slice(1, flow.indexOf(PostStatus.APROVACAO));
}

// First production stage a post enters when started.
export function firstProductionStatus(
  type: PostType,
  format: PostFormat,
): PostStatus {
  return productionStatuses(type, format)[0];
}
