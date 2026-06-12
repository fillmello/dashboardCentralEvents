export enum Role {
  // Gestão: full access — manage accounts/roles, free status control, global view + edit.
  GESTAO = 'gestao',
  // Painel: global read-only — sees everything (with/without filter), never edits.
  PAINEL = 'painel',
  // Individual: self-registered — sees only its own tasks; can "começar" and "entregar".
  INDIVIDUAL = 'individual',
}
