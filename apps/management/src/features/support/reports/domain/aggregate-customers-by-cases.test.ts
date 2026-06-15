import { describe, expect, it } from 'vitest';
import type { SupportCase } from '../../domain/types';
import { aggregateCustomersByCases } from './aggregate-customers-by-cases';

function customerCase(requesterId: string, id: number): SupportCase {
  return {
    id,
    caseNo: `SC-${id}`,
    subject: 's',
    complaintType: 'General',
    requesterType: 'Customer',
    requesterId,
    detail: '',
    ownerUserId: null,
    departmentId: null,
    urgency: 'Medium',
    criticality: 'Medium',
    caseStatus: 'Assigned',
    lastAction: null,
    reconciliationId: null,
    source: 'manual',
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
    closedAt: null,
    notesText: '',
    actionLog: [],
    documentIds: [],
  };
}

describe('aggregate-customers-by-cases', () => {
  it('sorts by caseCount desc', () => {
    const rows = aggregateCustomersByCases([
      customerCase('10042', 1),
      customerCase('10055', 2),
      customerCase('10042', 3),
      customerCase('10042', 4),
    ]);
    expect(rows[0]?.entityNo).toBe('10042');
    expect(rows[0]?.caseCount).toBe(3);
    expect(rows[1]?.caseCount).toBe(1);
  });
});
