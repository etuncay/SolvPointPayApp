import type { SupportCase } from './types';
import { isClosedCaseStatus } from './case-status-ui';

const MS_PER_DAY = 86_400_000;

export function computeCaseAgeDays(
  row: Pick<SupportCase, 'createdAt' | 'closedAt' | 'updatedAt' | 'caseStatus'>,
  at: Date = new Date('2026-05-24T12:00:00Z'),
): number {
  const start = new Date(row.createdAt).getTime();
  const end = isClosedCaseStatus(row.caseStatus)
    ? new Date(row.closedAt ?? row.updatedAt).getTime()
    : at.getTime();
  return Math.max(0, Math.floor((end - start) / MS_PER_DAY));
}
