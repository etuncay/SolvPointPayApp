import { describe, expect, it } from 'vitest';
import { generateAgentActivities } from '@epay/data';
import { isCriticalRisk, resolveConfirmationMode } from './confirmation-mode';
import { mockAgentTransactionsAdapter } from '../api/mock-agent-transactions-adapter';

describe('resolveConfirmationMode storeBacked', () => {
  it('does not enter Approve mode for activity fallback even when Pending', () => {
    const mode = resolveConfirmationMode('Pending', true, { storeBacked: false });
    expect(mode).toBe('Detail');
  });

  it('enters Approve mode for store-backed Pending', () => {
    expect(resolveConfirmationMode('Pending', true, { storeBacked: true })).toBe('Approve');
  });
});

describe('mockAgentTransactionsAdapter activity fallback', () => {
  const activityId = generateAgentActivities()[0]!.transactionId;

  it('getConfirmation resolves activity id with storeBacked false', () => {
    const view = mockAgentTransactionsAdapter.getConfirmation(activityId);
    expect(view).not.toBeNull();
    expect(view?.storeBacked).toBe(false);
    expect(view?.hasReceipt).toBe(false);
  });

  it('approve returns not_found for activity-only id', async () => {
    const result = await mockAgentTransactionsAdapter.approve(activityId, {
      otp: '123456',
      checks: {
        identityChecked: true,
        photoMatched: true,
        authorityChecked: true,
        noSuspicion: true,
      },
    });
    expect(result).toEqual({ ok: false, error: 'ag_cf_err_not_found' });
  });

  it('activity critical risk uses same rule as store', () => {
    const view = mockAgentTransactionsAdapter.getConfirmation(activityId);
    expect(view).not.toBeNull();
    if (view) expect(isCriticalRisk(view.detail)).toBe(view.isCritical);
  });
});
