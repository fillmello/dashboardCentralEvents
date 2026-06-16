export enum PostStatus {
  NAO_INICIADO = 'nao_iniciado',
  // Deprecated: no longer part of the active flow (captação is assumed done).
  // Kept as an enum value only for backward compatibility / safe migration.
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
 * Active board column order (RF-05). The production path is type-dependent:
 * Criativo posts go NAO_INICIADO → CRIANDO → APROVACAO; Vídeo posts go
 * NAO_INICIADO → EDITANDO → APROVACAO. From APROVACAO on both share
 * COPY_CAPA → EM_PUBLICACAO → PUBLICADO. In COPY_CAPA the Copy and Capa tasks
 * are delivered in parallel (`copyDelivered`/`capaDelivered`); the post only
 * advances once every needed delivery is in.
 *
 * The deprecated CAPTANDO/COPY/CAPA are intentionally excluded from the flow.
 */
export const PIPELINE_ORDER: readonly PostStatus[] = [
  PostStatus.NAO_INICIADO,
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

// First production stage for a post, by type: Criativo creates, Vídeo edits.
export function firstProductionStatus(isCriativo: boolean): PostStatus {
  return isCriativo ? PostStatus.CRIANDO : PostStatus.EDITANDO;
}
