import { describe, expect, it } from 'vitest';
import type { SupportCase } from '../../domain/types';
import { aggregateAgentsByCases } from './aggregate-agents-by-cases';

function agentCase(requesterId: string, id: number): SupportCase {
  return {
    id,
    caseNo: `SC-${id}`,
    subject: 's',
    complaintType: 'Technical',
    requesterType: 'Agent',
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

describe('aggregate-agents-by-cases', () => {
  it('sorts by caseCount desc', () => {
    const rows = aggregateAgentsByCases([
      agentCase('AG-99901', 1),
      agentCase('AG-99902', 2),
      agentCase('AG-99901', 3),
    ]);
    expect(rows[0]?.caseCount).toBeGreaterThanOrEqual(rows[1]?.caseCount ?? 0);
  });
});
