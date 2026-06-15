/** İstanbul takvim günü (YYYY-MM-DD) — varsayılan tarih filtresi için. */
export function istanbulToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
}
