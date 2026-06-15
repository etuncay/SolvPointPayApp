/** Europe/Istanbul günlük rapor penceresi — MVP sabit offset (+03:00) */
const IST_OFFSET_MS = 3 * 60 * 60 * 1000;

export function istanbulDayBounds(reportDate: string): { start: Date; end: Date } {
  const [y, m, d] = reportDate.split('-').map(Number);
  const startUtc = Date.UTC(y, m - 1, d, 0, 0, 0, 0) - IST_OFFSET_MS;
  const endUtc = Date.UTC(y, m - 1, d, 23, 59, 59, 999) - IST_OFFSET_MS;
  return { start: new Date(startUtc), end: new Date(endUtc) };
}

export function isWithinIstanbulDay(iso: string, reportDate: string): boolean {
  const t = new Date(iso).getTime();
  const { start, end } = istanbulDayBounds(reportDate);
  return t >= start.getTime() && t <= end.getTime();
}
