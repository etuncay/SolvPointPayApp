import { beforeAll, describe, expect, it } from 'vitest';
import { configureAgentLimitPorts } from './agent-remaining-limit.service';
import { checkTransactionLimit } from './check-transaction-limit';

/** Demo script tutarları — `user_test/agent/processes/agent-transfers.md` § F, `withdrawal.md` § J */
describe('mock limit demo thresholds', () => {
  beforeAll(() => {
    configureAgentLimitPorts({ driver: 'dexie' });
  });

  it('Tier 0 müşteri — 10.001 TRY reddedilir', async () => {
    const res = await checkTransactionLimit({
      operationType: 'WalletToPerson',
      currency: 'TRY',
      amount: 10_001,
      customerId: 99913,
    });
    expect(res).toEqual({ ok: false, message: 'ag_limit_exceeded' });
  });

  it('L1 müşteri — 186.000 TRY reddedilir (aylık 185k)', async () => {
    const res = await checkTransactionLimit({
      operationType: 'WalletWithdrawal',
      currency: 'TRY',
      amount: 186_000,
      customerId: 99901,
    });
    expect(res).toEqual({ ok: false, message: 'ag_limit_exceeded' });
  });

  it('L2 müşteri — 251.000 TRY temsilci günlük limitini aşar', async () => {
    const res = await checkTransactionLimit({
      operationType: 'WalletToPerson',
      currency: 'TRY',
      amount: 251_000,
      customerId: 99902,
    });
    expect(res).toEqual({ ok: false, message: 'ag_limit_exceeded' });
  });

  it('L2 müşteri — 50.000 TRY kabul edilir', async () => {
    const res = await checkTransactionLimit({
      operationType: 'WalletToPerson',
      currency: 'TRY',
      amount: 50_000,
      customerId: 99902,
    });
    expect(res).toEqual({ ok: true });
  });
});
