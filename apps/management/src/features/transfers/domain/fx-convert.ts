import { getEffectiveRate } from '@/lib/fx';
import type { CorrectionCurrency, CorrectionFxPreview } from './correction-types';

/** GBP — FX modülünde yok; sabit mock */
const FX_GBP_TRY = 43;

export function fxRateToTry(currency: CorrectionCurrency): number {
  if (currency === 'GBP') return FX_GBP_TRY;
  if (currency === 'TRY' || currency === 'USD' || currency === 'EUR') {
    return getEffectiveRate(currency);
  }
  return 1;
}

export function convertToTry(amount: number, currency: CorrectionCurrency): number {
  return Math.round(amount * fxRateToTry(currency) * 100) / 100;
}

export function convertFromTry(amountTry: number, currency: CorrectionCurrency): number {
  const rate = fxRateToTry(currency);
  return Math.round((amountTry / rate) * 100) / 100;
}

/** Talep tutar/PB → kaynak çıkış + hedef giriş */
export function computeCorrectionFx(
  requestedAmount: number,
  requestedCurrency: CorrectionCurrency,
  sourceCurrency: CorrectionCurrency,
  targetCurrency: CorrectionCurrency,
): CorrectionFxPreview {
  const amountTryEquivalent = convertToTry(requestedAmount, requestedCurrency);
  return {
    sourceOutAmount: convertFromTry(amountTryEquivalent, sourceCurrency),
    sourceOutCurrency: sourceCurrency,
    targetInAmount: convertFromTry(amountTryEquivalent, targetCurrency),
    targetInCurrency: targetCurrency,
    amountTryEquivalent,
  };
}
