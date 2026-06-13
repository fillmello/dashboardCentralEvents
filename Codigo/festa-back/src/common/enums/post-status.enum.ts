export enum PostStatus {
  NAO_INICIADO = 'nao_iniciado',
  CAPTANDO = 'captando',
  EDITANDO = 'editando',
  APROVACAO = 'aprovacao',
  COPY = 'copy',
  CAPA = 'capa',
  EM_PUBLICACAO = 'em_publicacao',
  PUBLICADO = 'publicado',
}

/**
 * Ordered production pipeline (RF-05). The index in this array defines the
 * sequence; transition validation and stage-time KPIs rely on this order.
 *
 * After APROVACAO, Copy and Capa are independent steps: on approval the Gestão
 * decides whether each is needed (`needsCopy`/`needsCapa`) and a post may skip
 * one or both, jumping straight to the next required stage.
 */
export const PIPELINE_ORDER: readonly PostStatus[] = [
  PostStatus.NAO_INICIADO,
  PostStatus.CAPTANDO,
  PostStatus.EDITANDO,
  PostStatus.APROVACAO,
  PostStatus.COPY,
  PostStatus.CAPA,
  PostStatus.EM_PUBLICACAO,
  PostStatus.PUBLICADO,
];

export function pipelineIndex(status: PostStatus): number {
  return PIPELINE_ORDER.indexOf(status);
}
