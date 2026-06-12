export enum PostStatus {
  NAO_INICIADO = 'nao_iniciado',
  CAPTANDO = 'captando',
  EDITANDO = 'editando',
  CRIANDO = 'criando',
  APROVACAO = 'aprovacao',
  CAPA_COPY = 'capa_copy',
  EM_PUBLICACAO = 'em_publicacao',
  PUBLICADO = 'publicado',
}

/**
 * Ordered production pipeline (RF-05). The index in this array defines the
 * sequence; transition validation and stage-time KPIs rely on this order.
 */
export const PIPELINE_ORDER: readonly PostStatus[] = [
  PostStatus.NAO_INICIADO,
  PostStatus.CAPTANDO,
  PostStatus.EDITANDO,
  PostStatus.CRIANDO,
  PostStatus.APROVACAO,
  PostStatus.CAPA_COPY,
  PostStatus.EM_PUBLICACAO,
  PostStatus.PUBLICADO,
];

export function pipelineIndex(status: PostStatus): number {
  return PIPELINE_ORDER.indexOf(status);
}
