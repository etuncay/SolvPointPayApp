import { describe, expect, it } from 'vitest';
import { generateAgentActivities } from '@epay/data';
import { agentTransactionsStore } from '../api/agent-transactions-store';
import { buildTransactionDetail } from './build-transaction-detail';
import { buildTransactionDetailFromActivity } from './build-transaction-detail-from-activity';
import {
  getAgentActivityByTransactionId,
  parseActivityCounterpartyCustomerNo,
  resolveAgentTransaction,
  resolveAgentTransactionDetail,
} from './resolve-agent-transaction';

describe('resolveAgentTransaction', () => {
  const activities = generateAgentActivities();
  const sampleActivity = activities[0]!;

  it('resolves store transaction by id', () => {
    const resolved = resolveAgentTransaction(90001);
    expect(resolved?.source).toBe('store');
    expect(resolved?.storeBacked).toBe(true);
    expect(resolved?.detail.referenceNo).toBe('REF-AG-90001');
  });

  it('falls back to activity when store misses', () => {
    const id = sampleActivity.transactionId;
    expect(agentTransactionsStore.get(id)).toBeNull();

    const resolved = resolveAgentTransaction(id);
    expect(resolved?.source).toBe('activity');
    expect(resolved?.storeBacked).toBe(false);
    expect(resolved?.hasReceipt).toBe(false);
    expect(resolved?.detail.transactionNo).toBe(sampleActivity.transactionNo);
  });

  it('store projection matches buildTransactionDetail for seed tx', () => {
    const tx = agentTransactionsStore.get(90002)!;
    const fromResolver = resolveAgentTransactionDetail(90002);
    const direct = buildTransactionDetail(tx, [], [], null);
    expect(fromResolver?.transactionNo).toBe(direct.transactionNo);
    expect(fromResolver?.principalAmount).toBe(direct.principalAmount);
    expect(fromResolver?.sender.name).toBe(direct.sender.name);
  });

  it('activity projection matches buildTransactionDetailFromActivity', () => {
    const activity = getAgentActivityByTransactionId(sampleActivity.transactionId)!;
    const fromResolver = resolveAgentTransactionDetail(activity.transactionId);
    const direct = buildTransactionDetailFromActivity(activity);
    expect(fromResolver?.transactionNo).toBe(direct.transactionNo);
    expect(fromResolver?.createdAt).toBe(direct.createdAt);
    expect(fromResolver?.sender.name).toBe(direct.sender.name);
  });

  it('returns null for unknown id', () => {
    expect(resolveAgentTransaction(1)).toBeNull();
  });
});

describe('parseActivityCounterpartyCustomerNo', () => {
  it('parses MUS- formatted customer numbers', () => {
    expect(parseActivityCounterpartyCustomerNo('MUS-00099901')).toBe(99901);
    expect(parseActivityCounterpartyCustomerNo('MUS-0010000')).toBe(10000);
  });
});
