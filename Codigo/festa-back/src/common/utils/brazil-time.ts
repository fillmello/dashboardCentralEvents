/**
 * Calendar-boundary helpers for the business timezone (America/Sao_Paulo).
 *
 * Brazil abolished DST in 2019, so São Paulo is a fixed UTC-3 year-round. These
 * compute month boundaries as absolute UTC instants **independently of the server's
 * process timezone** — so stats/reports are correct whether or not `TZ` is set.
 *
 * If Brazil ever reinstates DST, replace the fixed offset here with a TZ-aware
 * library (e.g. Luxon `DateTime.fromObject(..., { zone: 'America/Sao_Paulo' })`).
 */
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3

/** Start of the month (00:00:00.000 BRT) as a UTC instant. `month` is 0-based. */
export function brtMonthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1) + BRT_OFFSET_MS);
}

/** End of the month (23:59:59.999 BRT) as a UTC instant. `month` is 0-based. */
export function brtMonthEnd(year: number, month: number): Date {
  return new Date(Date.UTC(year, month + 1, 1) + BRT_OFFSET_MS - 1);
}

/** Current calendar year + 0-based month in BRT (for "this month" queries). */
export function brtNowYearMonth(): { year: number; month: number } {
  const brtNow = new Date(Date.now() - BRT_OFFSET_MS);
  return { year: brtNow.getUTCFullYear(), month: brtNow.getUTCMonth() };
}
