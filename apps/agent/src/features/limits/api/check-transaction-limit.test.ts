import { describe, expect, it, vi, beforeEach } from 'vitest';
import { checkTransactionLimit } from './check-transaction-limit';
import { setAgentRemainingLimitPort } from './agent-remaining-limit.service';
import type { AgentRemainingLimitPort } from '../contracts/agent-remaining-limit-port';

describe('checkTransactionLimit', () => {
  beforeEach(() => {
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
  });

  it('allows amount within server limit', async () => {
    const res = await checkTransactionLimit({
      operationType: 'WalletWithdrawal',
      currency: 'TRY',
      amount: 25_000,
      customerId: 1,
    });
    expect(res).toEqual({ ok: true });
  });

  it('rejects amount above server limit', async () => {
    const res = await checkTransactionLimit({
      operationType: 'WalletWithdrawal',
      currency: 'TRY',
      amount: 75_000,
      customerId: 1,
    });
    expect(res).toEqual({ ok: false, message: 'ag_limit_exceeded' });
  });
});
