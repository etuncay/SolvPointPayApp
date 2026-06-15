import type { CaseStatus } from '../../domain/types';

export function initialCaseStatus(
  ownerUserId: string | null | undefined,
  departmentId: string | null | undefined,
): CaseStatus {
  if (ownerUserId?.trim() || departmentId?.trim()) return 'Assigned';
  return 'Unassigned';
}
