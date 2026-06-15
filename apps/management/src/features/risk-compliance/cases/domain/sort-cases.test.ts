import { describe, expect, it } from 'vitest';
import { sortFraudCases } from './sort-cases';
import type { FraudCaseListItem } from './types';

function row(partial: Partial<FraudCaseListItem> & Pick<FraudCaseListItem, 'id'>): FraudCaseListItem {
  return {
    transactionNo: 'TX-1',
    transactionDate: '2026-01-01 10:00:00',
    priority: 'Medium',
    transactionType: 'WalletToPerson',
    ruleTitle: 'R',
    riskScore: 50,
    senderCustomerNo: 1,
    senderName: 'A',
    receiverCustomerNo: 2,
    receiverName: 'B',
    senderAgentNo: null,
    receiverAgentNo: null,
    iban: null,
    currency: 'TRY',
    amount: 1000,
    channel: 'Mobile',
    transactionStatus: 'OnHold',
    caseStatus: 'Assigned',
    assignedUserName: null,
    slaDueAt: '2026-12-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

describe('sortFraudCases', () => {
  it('Critical before Low; higher amount first; older date first', () => {
    const sorted = sortFraudCases([
      row({ id: 'a', priority: 'Low', amount: 9000, transactionDate: '2026-01-02 10:00:00' }),
      row({ id: 'b', priority: 'Critical', amount: 100, transactionDate: '2026-01-03 10:00:00' }),
      row({ id: 'c', priority: 'Critical', amount: 5000, transactionDate: '2026-01-01 10:00:00' }),
    ]);
    expect(sorted.map((r) => r.id)).toEqual(['c', 'b', 'a']);
  });
});
