// Official programação for 20 June 2026 (RF-10..13). Times are in São Paulo
// time (UTC-3, no DST) written as explicit ISO offsets so they are unambiguous
// regardless of the server timezone. Seeded on boot only when the schedule is
// empty (see SeedService).
export interface SeedScheduleItem {
  name: string;
  plannedTime: string; // ISO 8601 with -03:00 offset
}

export const SEED_SCHEDULE: SeedScheduleItem[] = [
  {
    name: 'Concentração na rua Álvares Cabral e teatros na praça da Liberdade',
    plannedTime: '2026-06-20T13:30:00-03:00',
  },
  {
    name: 'Saída da caminhada e início na praça (louvor)',
    plannedTime: '2026-06-20T14:00:00-03:00',
  },
  {
    name: 'Chegada na praça e início da programação oficial — Central MSC',
    plannedTime: '2026-06-20T14:40:00-03:00',
  },
  {
    name: 'Ministração e oração — Pr. Daniel Mazoni',
    plannedTime: '2026-06-20T15:10:00-03:00',
  },
  { name: 'Louvor', plannedTime: '2026-06-20T15:25:00-03:00' },
  {
    name: 'Abertura, boas-vindas e oração por esse tempo e pelo ato — Pr. Léo Matos',
    plannedTime: '2026-06-20T15:30:00-03:00',
  },
  {
    name: 'Palavra de gratidão pelo crescimento da igreja em BH e regiões — Pr. Alexandre Regadas',
    plannedTime: '2026-06-20T15:50:00-03:00',
  },
  {
    name: 'Louvor Gratidão com dança',
    plannedTime: '2026-06-20T16:10:00-03:00',
  },
  {
    name: 'Palavra e oração pelo Brasil e nações da terra — Pr. Magid Saab',
    plannedTime: '2026-06-20T16:15:00-03:00',
  },
  {
    name: 'Clamor, intercessão e ato profético pelas pessoas que moram em BH, em casas ou nas ruas — Pr. Samyr Trad',
    plannedTime: '2026-06-20T16:35:00-03:00',
  },
  { name: 'Louvor', plannedTime: '2026-06-20T16:55:00-03:00' },
  {
    name: 'Uma carta de amor — Pr. Paulo Mazoni',
    plannedTime: '2026-06-20T17:00:00-03:00',
  },
  { name: 'Louvor', plannedTime: '2026-06-20T17:30:00-03:00' },
];
