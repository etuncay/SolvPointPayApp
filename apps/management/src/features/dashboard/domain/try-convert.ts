import { getEffectiveRate, type EffectiveRateCurrency } from '@/lib/fx';

function asFxCurrency(currency: string): EffectiveRateCurrency | null {
  if (currency === 'TRY' || currency === 'USD' || currency === 'EUR') return currency;
  if (currency === 'GBP') return 'EUR';
  return null;
}

/** Spec §8 — işlem tutarını TRY'ye çevirir (marjlı efektif kur). */
export function toTry(amount: number, currency: string): number {
  const fx = asFxCurrency(currency);
  if (!fx) return Math.round(amount * 100) / 100;
  const rate = getEffectiveRate(fx);
  return Math.round(amount * rate * 100) / 100;
}
