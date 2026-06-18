import { beforeEach, describe, expect, it } from 'vitest';
import {
  isDuplicateReference,
  releaseReference,
  resetWithdrawalIdempotencyForTests,
  tryAcquireReference,
} from './idempotency';
import { resetAgentTransactionsStoreForTests } from '@/features/transaction-confirmation/api/agent-transactions-store';

describe('withdrawal/domain/idempotency', () => {
  beforeEach(() => {
    resetAgentTransactionsStoreForTests();
    resetWithdrawalIdempotencyForTests();
  });

  it('empty reference is not duplicate', () => {
    expect(isDuplicateReference('')).toBe(false);
    expect(isDuplicateReference('   ')).toBe(false);
  });

  it('releaseReference allows re-acquire before store persist', () => {
    expect(tryAcquireReference('REF-TEMP')).toBe(true);
    releaseReference('REF-TEMP');
    expect(tryAcquireReference('REF-TEMP')).toBe(true);
  });

  it('after store has reference, acquire fails even after release', async () => {
    const { mockWithdrawalAdapter } = await import('../api/mock-withdrawal-adapter');
    const { setAgentRemainingLimitPort } = await import('@/features/limits/api/agent-remaining-limit.service');
    setAgentRemainingLimitPort({
      getRemainingLimit: async () => ({
        ok: true,
        data: {
          asOf: '2026-06-18T12:00:00',
          operationType: 'WalletWithdrawal',
          channel: 'Agent',
          currency: 'TRY',
          nextTxMaxAmount: 50_000,
          todayRemaining: 50_000,
          monthRemaining: -1,
          singleTxLimit: 50_000,
        },
      }),
    });

    const ref = 'REF-PERSISTED-DUP';
    const ok = await mockWithdrawalAdapter.initiateWithdrawal({
      customerId: 99901,
      walletId: 1,
      currency: 'TRY',
      amount: 500,
      transactionReferenceNo: ref,
      isSuspicious: false,
      screenIdNo: '75683988090',
      screenName: 'Caner Avcı',
    });
    expect(ok.ok).toBe(true);
    expect(isDuplicateReference(ref)).toBe(true);
    expect(tryAcquireReference(ref)).toBe(false);
  });
});
