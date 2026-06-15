import { FX_RATES_SEED } from '@/mocks/fx-rates';
import { getFxRatesStoreSnapshot } from '../api/mock-fx-adapter';
import type { FxCurrency, WorkHours } from './types';
import { isInsideWorkHours, todayRateDate } from './work-hours';

export type EffectiveRateCurrency = 'TRY' | FxCurrency;

const FALLBACK: Record<FxCurrency, number> = {
  USD: 34,
  EUR: 37,
};

/** Onaylı marjlı satış kuru — TRY dönüşümü ve kampanya TL karşılığı için tek kaynak. */
export function getEffectiveRate(currency: EffectiveRateCurrency, workHours?: WorkHours): number {
  if (currency === 'TRY') return 1;

  const wh = workHours ?? (isInsideWorkHours() ? 'Inside' : 'Outside');
  const today = todayRateDate();
  const rates = getFxRatesStoreSnapshot();

  let row = rates.find((r) => r.currency === currency && r.rateDate === today);
  if (!row) {
    row = rates
      .filter((r) => r.currency === currency)
      .sort((a, b) => b.rateDate.localeCompare(a.rateDate))[0];
  }
  if (!row) {
    const seed = FX_RATES_SEED.find((r) => r.currency === currency);
    if (!seed) return FALLBACK[currency];
    row = seed;
  }

  return wh === 'Inside' ? row.marginedSellInside : row.marginedSellOutside;
}
