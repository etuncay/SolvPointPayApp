/** Takvim günü (dahil) */
export function computeTotalDays(start: string, end: string): number {
  if (!start || !end || start > end) return 0;
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return diff + 1;
}
