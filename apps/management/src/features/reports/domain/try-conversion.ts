import { getEffectiveRate } from '@/lib/fx';

/** 8.6 mock — marjlı efektif kur (işlem tarihi MVP'de yok sayılır). */
export function getFxRateToTry(currency: string, _date?: string): number {
  const c = currency.toUpperCase();
  if (c === 'TRY') return 1;
  if (c === 'USD' || c === 'EUR') return getEffectiveRate(c);
  return 1;
}

export function toAmountTry(amount: number, currency: string, date?: string): number {
  return Math.round(amount * getFxRateToTry(currency, date) * 100) / 100;
}
