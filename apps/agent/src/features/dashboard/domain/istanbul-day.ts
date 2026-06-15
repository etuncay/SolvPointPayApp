/** İstanbul takvim günü başlangıcı (mock aggregation için). */
export function startOfIstanbulDay(ref = new Date()): Date {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(ref);
  return new Date(`${day}T00:00:00+03:00`);
}

export function istanbulDayKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(d);
}

export function isOnIstanbulDay(iso: string, ref = new Date()): boolean {
  return istanbulDayKey(iso) === istanbulDayKey(ref);
}

export function istanbulHour(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date(iso));
  return Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
}
