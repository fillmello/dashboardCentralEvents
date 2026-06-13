import { Role } from 'src/common/enums/role.enum';

// Single source of truth for the demo accounts (one per role). Used by both the
// standalone `pnpm seed` script and the automatic seed-on-boot (SeedService).
//
// The shared password meets the IsStrongPassword policy (>=8 chars, 1 uppercase,
// 1 number, 1 symbol) so these accounts behave like normal sign-ups.
export const SEED_PASSWORD = 'Festa@123';

export interface SeedAccount {
  fullName: string;
  email: string;
  role: Role;
}

export const SEED_ACCOUNTS: SeedAccount[] = [
  { fullName: 'Gestão Admin', email: 'gestao@festa.com', role: Role.GESTAO },
  { fullName: 'Painel Viewer', email: 'painel@festa.com', role: Role.PAINEL },
  {
    fullName: 'Individual User',
    email: 'individual@festa.com',
    role: Role.INDIVIDUAL,
  },
];
