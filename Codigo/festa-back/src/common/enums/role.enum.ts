export enum Role {
  // Coordenação (displayed name; value kept as `gestao` for backward
  // compatibility): full access — manage accounts/roles, free status control,
  // global view + edit.
  GESTAO = 'gestao',
  // Head (líder de equipe): full board control (create/edit/delete/move posts)
  // and read access to Cronograma + Painel KPI, but NO team management and
  // cannot edit the cronograma.
  HEAD = 'head',
  // Painel: global read-only — sees everything (with/without filter), never edits.
  PAINEL = 'painel',
  // Operativo (displayed name; value kept as `individual`): self-registered —
  // sees only its own tasks; can "começar" and "entregar".
  INDIVIDUAL = 'individual',
}
