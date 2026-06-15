import { describe, expect, it } from 'vitest';
import type { SupportCase } from '../../domain/types';
import { aggregateByCaseAge, assignSupportCaseAgeBucket } from './aggregate-by-case-age';

const AT = new Date('2026-05-24T12:00:00Z');

function openCase(createdAt: string): SupportCase {
  return {
    id: 1,
    caseNo: 'SC-T',
    subject: 't',
    complaintType: 'General',
    requesterType: 'Customer',
    requesterId: '1',
    detail: '',
    ownerUserId: null,
    departmentId: null,
    urgency: 'Medium',
    criticality: 'Medium',
    caseStatus: 'Assigned',
    lastAction: null,
    reconciliationId: null,
    source: 'manual',
    createdAt,
    updatedAt: createdAt,
    closedAt: null,
    notesText: '',
    actionLog: [],
    documentIds: [],
  };
}

describe('aggregate-by-case-age', () => {
  it('bucket boundaries — 1 day → 1_5', () => {
    expect(assignSupportCaseAgeBucket(0)).toBe('0_1');
    expect(assignSupportCaseAgeBucket(1)).toBe('1_5');
    expect(assignSupportCaseAgeBucket(5)).toBe('5_10');
    expect(assignSupportCaseAgeBucket(10)).toBe('gt_10');
  });

  it('only open cases counted', () => {
    const summary = aggregateByCaseAge(
      [
        openCase('2026-05-24T10:00:00Z'),
        { ...openCase('2026-05-20T10:00:00Z'), caseStatus: 'Resolved_IssueFixed', closedAt: '2026-05-22T10:00:00Z' },
      ],
      AT,
    );
    const total = summary['0_1'] + summary['1_5'] + summary['5_10'] + summary.gt_10;
    expect(total).toBe(1);
  });
});
