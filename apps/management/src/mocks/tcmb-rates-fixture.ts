import type { FxCurrency } from '@/features/operational-processes/fx-management/domain/types';

export type TcmbRateQuote = {
  currency: FxCurrency;
  buyRate: number;
  sellRate: number;
};

/** Mock TCMB refresh yanıtı */
export const TCMB_RATES_FIXTURE: TcmbRateQuote[] = [
  { currency: 'USD', buyRate: 34.62, sellRate: 34.92 },
  { currency: 'EUR', buyRate: 37.28, sellRate: 37.62 },
];

let simulateTcmbError = false;

export function setTcmbSimulateError(value: boolean): void {
  simulateTcmbError = value;
}

export function getTcmbSimulateError(): boolean {
  return simulateTcmbError;
}

export function fetchTcmbRates(): { ok: true; rates: TcmbRateQuote[] } | { ok: false } {
  if (simulateTcmbError) return { ok: false };
  return { ok: true, rates: TCMB_RATES_FIXTURE.map((r) => ({ ...r })) };
}
