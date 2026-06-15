export interface ScheduleSlot {
  at: string;
  name: string;
  description: string;
}

/** MVP: cron'dan saat/dakika çıkarıp 7 gün ileri slot üretir */
export function computeNextRuns(
  cronExpression: string | null,
  name: string,
  description: string,
  from = new Date('2026-05-25T08:00:00Z'),
): ScheduleSlot[] {
  if (!cronExpression?.trim()) return [];
  const parts = cronExpression.trim().split(/\s+/);
  const minute = parts[0] !== '*' ? parseInt(parts[0]!, 10) : 0;
  const hour = parts.length > 1 && parts[1] !== '*' ? parseInt(parts[1]!, 10) : 8;
  const slots: ScheduleSlot[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from);
    d.setUTCDate(d.getUTCDate() + i);
    d.setUTCHours(Number.isFinite(hour) ? hour : 8, Number.isFinite(minute) ? minute : 0, 0, 0);
    slots.push({
      at: d.toISOString(),
      name,
      description: description || '—',
    });
  }
  return slots;
}
