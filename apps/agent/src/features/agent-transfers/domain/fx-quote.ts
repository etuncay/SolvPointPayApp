import type { FxQuote } from './types';

const RATES: Record<string, number> = {
  'TRY-USD': 0.031,
  'TRY-EUR': 0.029,
  'USD-TRY': 32.2,
  'EUR-TRY': 34.5,
  'TRY-GBP': 0.025,
};

const TTL_SEC = 60;

export function getFxQuote(sourceCcy: string, targetCcy: string, amount: number): FxQuote {
  const key = `${sourceCcy}-${targetCcy}`;
  const rate = RATES[key] ?? 1;
  const targetAmount = Math.round(amount * rate * 100) / 100;
  const expiresAt = new Date(Date.now() + TTL_SEC * 1000).toISOString();
  return {
    sourceCurrency: sourceCcy,
    targetCurrency: targetCcy,
    rate,
    sourceAmount: amount,
    targetAmount,
    expiresAt,
  };
}

export function isQuoteExpired(expiresAt: string): boolean {
  return Date.now() >= new Date(expiresAt).getTime();
}
