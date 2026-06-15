function isWeekend(iso: string): boolean {
  const d = new Date(`${iso}T12:00:00`).getDay();
  return d === 0 || d === 6;
}

function eachDay(start: string, end: string): string[] {
  if (!start || !end || start > end) return [];
  const out: string[] = [];
  const cur = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  while (cur <= last) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function computeWorkingDays(start: string, end: string, holidays: string[]): number {
  const holidaySet = new Set(holidays);
  return eachDay(start, end).filter((d) => !isWeekend(d) && !holidaySet.has(d)).length;
}
