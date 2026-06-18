import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setAgentRemainingLimitPort } from '@/features/limits/api/agent-remaining-limit.service';
import type { AgentRemainingLimitPort } from '@/features/limits/contracts/agent-remaining-limit-port';
import {
  agentTransactionsStore,
  resetAgentTransactionsStoreForTests,
} from '@/features/transaction-confirmation/api/agent-transactions-store';
import { mockWithdrawalAdapter } from './mock-withdrawal-adapter';
import {
  isDuplicateReference,
  resetWithdrawalIdempotencyForTests,
  tryAcquireReference,
} from '../domain/idempotency';
import type { WithdrawalSubmitPayload } from '../domain/types';

const basePayload: WithdrawalSubmitPayload = {
  customerId: 99901,
  walletId: 1,
  currency: 'TRY',
  amount: 1_000,
  transactionReferenceNo: 'REF-WD-TEST-UNIQUE',
  isSuspicious: false,
  screenIdNo: '75683988090',
  screenName: 'Caner Avcı',
};

function mockLimitPort(): void {
  const mockPort: AgentRemainingLimitPort = {
    getRemainingLimit: vi.fn().mockResolvedValue({
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
  };
  setAgentRemainingLimitPort(mockPort);
}

describe('withdrawal idempotency', () => {
  beforeEach(() => {
    resetAgentTransactionsStoreForTests();
    resetWithdrawalIdempotencyForTests();
    mockLimitPort();
  });

  it('detects seed reference REF-AG-90001 as duplicate', () => {
    expect(isDuplicateReference('REF-AG-90001')).toBe(true);
  });

  it('tryAcquireReference blocks second in-flight claim', () => {
    expect(tryAcquireReference('REF-IN-FLIGHT-1')).toBe(true);
    expect(tryAcquireReference('REF-IN-FLIGHT-1')).toBe(false);
  });
});

describe('mockWithdrawalAdapter.initiateWithdrawal', () => {
  beforeEach(() => {
    resetAgentTransactionsStoreForTests();
    resetWithdrawalIdempotencyForTests();
    mockLimitPort();
  });

  it('rejects duplicate seed reference without creating a record', async () => {
    const before = agentTransactionsStore.list().length;
    const res = await mockWithdrawalAdapter.initiateWithdrawal({
      ...basePayload,
      transactionReferenceNo: 'REF-AG-90001',
    });
    expect(res).toEqual({
      ok: false,
      code: 'DUPLICATE',
      message: 'ag_wd_err_duplicate',
    });
    expect(agentTransactionsStore.list()).toHaveLength(before);
  });

  it('rejects second submit with the same new reference', async () => {
    const ref = 'REF-WD-DOUBLE-SUBMIT';
    const first = await mockWithdrawalAdapter.initiateWithdrawal({
      ...basePayload,
      transactionReferenceNo: ref,
    });
    expect(first.ok).toBe(true);

    const second = await mockWithdrawalAdapter.initiateWithdrawal({
      ...basePayload,
      transactionReferenceNo: ref,
    });
    expect(second).toEqual({
      ok: false,
      code: 'DUPLICATE',
      message: 'ag_wd_err_duplicate',
    });
    expect(agentTransactionsStore.list().filter((t) => t.referenceNo === ref)).toHaveLength(1);
  });

  it('blocks parallel double-click race — only one transaction created', async () => {
    const ref = 'REF-WD-RACE-CLICK';
    const payload = { ...basePayload, transactionReferenceNo: ref };
    const [a, b] = await Promise.all([
      mockWithdrawalAdapter.initiateWithdrawal(payload),
      mockWithdrawalAdapter.initiateWithdrawal(payload),
    ]);

    const successes = [a, b].filter((r) => r.ok);
    const duplicates = [a, b].filter((r) => !r.ok && r.code === 'DUPLICATE');
    expect(successes).toHaveLength(1);
    expect(duplicates).toHaveLength(1);
    expect(agentTransactionsStore.list().filter((t) => t.referenceNo === ref)).toHaveLength(1);
  });
});
