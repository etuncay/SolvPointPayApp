import { describe, expect, it } from 'vitest';
import { isAmountWithinLimit } from './assert-amount-within-limit';
import { computeRemainingLimit } from './compute-remaining-limit';
import type { LimitActor } from './compute-remaining-limit';

const head = {
  asOf: '2026-06-18T12:00:00',
  operationType: 'WalletWithdrawal',
  channel: 'Agent' as const,
  currency: 'TRY',
  isForeign: false,
};

function actor(
  key: LimitActor['key'],
  limits: Partial<LimitActor['limits']>,
  usage: Partial<LimitActor['usage']> = {},
  activeAndAuthorized = true,
): LimitActor {
  return {
    key,
    limits: {
      singleTxLimit: -1,
      dailyLimit: -1,
      monthlyLimit: -1,
      internationalTransfer: 'Allowed',
      ...limits,
    },
    usage: { dailyUsed: 0, monthlyUsed: 0, ...usage },
    activeAndAuthorized,
  };
}

describe('computeRemainingLimit', () => {
  it('returns zero when agent authorized is inactive', () => {
    const r = computeRemainingLimit({
      ...head,
      actors: [actor('agentAuthorized', { dailyLimit: 50_000 }, { dailyUsed: 0 }, false)],
    });
    expect(r.nextTxMaxAmount).toBe(0);
  });

  it('picks most restrictive actor limit', () => {
    const r = computeRemainingLimit({
      ...head,
      actors: [
        actor('agent', { dailyLimit: 250_000 }, { dailyUsed: 10_000 }),
        actor('agentAuthorized', { singleTxLimit: 80_000, dailyLimit: 80_000 }, { dailyUsed: 10_000 }),
      ],
    });
    expect(r.nextTxMaxAmount).toBe(70_000);
  });
});

describe('isAmountWithinLimit', () => {
  it('rejects when next tx max is zero', () => {
    expect(
      isAmountWithinLimit(100, {
        asOf: head.asOf,
        operationType: head.operationType,
        channel: 'Agent',
        currency: 'TRY',
        nextTxMaxAmount: 0,
        todayRemaining: 0,
        monthRemaining: 0,
        singleTxLimit: 0,
      }),
    ).toBe(false);
  });

  it('accepts any positive amount when unlimited', () => {
    expect(
      isAmountWithinLimit(9_999_999, {
        asOf: head.asOf,
        operationType: head.operationType,
        channel: 'Agent',
        currency: 'TRY',
        nextTxMaxAmount: -1,
        todayRemaining: -1,
        monthRemaining: -1,
        singleTxLimit: -1,
      }),
    ).toBe(true);
  });
});
