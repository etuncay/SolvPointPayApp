import { describe, expect, it, beforeEach } from 'vitest';
import {
  getCustomerPortalSupportCaseFeed,
  pushCustomerPortalSupportCaseFeed,
  resetCustomerPortalSupportCaseFeed,
} from './customer-support-case-feed';
import {
  buildSupportCaseRecord,
  publishSupportCaseToFeed,
  toSupportCaseFeedEntry,
} from './customer-support-case-ops';

const input = {
  type: 'Complaint',
  reason: 'Transfer gecikmesi',
  message: 'Dün gönderdiğim transfer hesaba geçmedi.',
  consent: true,
};

describe('customer support case e2e (mock)', () => {
  beforeEach(() => {
    resetCustomerPortalSupportCaseFeed();
  });

  it('builds deterministic case number from id suffix', () => {
    const row = buildSupportCaseRecord(input, 1_700_000_000_000);
    expect(row.caseNo).toBe('CASE-000000');
    expect(row.status).toBe('Open');
    expect(row.reason).toBe(input.reason);
  });

  it('publishes created case to backoffice feed', () => {
    const row = buildSupportCaseRecord(input, 1_700_000_000_001);
    publishSupportCaseToFeed(row, 'CUS-4827193');

    const feed = getCustomerPortalSupportCaseFeed();
    expect(feed).toHaveLength(1);
    expect(feed[0]).toEqual(toSupportCaseFeedEntry(row, 'CUS-4827193'));
    expect(feed[0].subject).toBe('Transfer gecikmesi');
    expect(feed[0].complaintType).toBe('Complaint');
  });

  it('does not duplicate feed rows for the same portal case id', () => {
    const entry = toSupportCaseFeedEntry(
      buildSupportCaseRecord(input, 1_700_000_000_002),
      'CUS-4827193',
    );
    pushCustomerPortalSupportCaseFeed(entry);
    pushCustomerPortalSupportCaseFeed(entry);
    expect(getCustomerPortalSupportCaseFeed()).toHaveLength(1);
  });
});
