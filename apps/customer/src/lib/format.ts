/** Para ve tarih biçimlendirme — aktif locale */

export function fmtMoney(amount: number, symbol = ''): string {
  const s = Number(amount).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${s}`;
}

export function formatDateIstanbul(isoOrDisplay: string): string {
  try {
    const d = new Date(isoOrDisplay);
    if (Number.isNaN(d.getTime())) return isoOrDisplay;
    return d.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  } catch {
    return isoOrDisplay;
  }
}
