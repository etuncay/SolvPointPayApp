import { describe, expect, it } from 'vitest';
import { computeCaseAgeDays } from './compute-case-age';

const AT = new Date('2026-05-24T12:00:00Z');

describe('compute-case-age', () => {
  it('open case age grows to reference date', () => {
    const days = computeCaseAgeDays(
      {
        createdAt: '2026-05-20T12:00:00Z',
        closedAt: null,
        updatedAt: '2026-05-23T12:00:00Z',
        caseStatus: 'Assigned',
      },
      AT,
    );
    expect(days).toBe(4);
  });

  it('closed case age frozen at closedAt', () => {
    const openDays = computeCaseAgeDays(
      {
        createdAt: '2026-05-01T12:00:00Z',
        closedAt: '2026-05-10T12:00:00Z',
        updatedAt: '2026-05-20T12:00:00Z',
        caseStatus: 'Resolved_IssueFixed',
      },
      AT,
    );
    expect(openDays).toBe(9);
  });
});
