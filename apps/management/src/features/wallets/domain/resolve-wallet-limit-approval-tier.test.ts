import { describe, expect, it } from 'vitest';
import type { WalletLimitSet } from './detail-types';
import { resolveWalletLimitRequiredApprovals } from './resolve-wallet-limit-approval-tier';

function baseLimits(overrides?: Partial<WalletLimitSet['Withdrawal']>): WalletLimitSet {
  const w = {
    Single: 10_000,
    DailyCount: 5,
    DailyAmount: 50_000,
    MonthlyCount: 20,
    MonthlyAmount: 200_000,
    ...overrides,
  };
  return {
    Withdrawal: w,
    Transfer: { ...w },
    International: { ...w },
  };
}

describe('resolveWalletLimitRequiredApprovals', () => {
  it('returns 0 when only count fields change', () => {
    const old = baseLimits();
    const next = baseLimits({ DailyCount: 10 });
    expect(resolveWalletLimitRequiredApprovals(old, next)).toBe(0);
  });

  it('returns 0 for low amount change under default threshold', () => {
    const old = baseLimits();
    const next = baseLimits({ DailyAmount: 80_000 });
    expect(resolveWalletLimitRequiredApprovals(old, next)).toBe(0);
  });

  it('returns 1 for mid-tier amount change', () => {
    const old = baseLimits();
    const next = baseLimits({ DailyAmount: 300_000 });
    expect(resolveWalletLimitRequiredApprovals(old, next)).toBe(1);
  });

  it('returns 2 for high amount change', () => {
    const old = baseLimits();
    const next = baseLimits({ Single: 600_000 });
    expect(resolveWalletLimitRequiredApprovals(old, next)).toBe(2);
  });
});
