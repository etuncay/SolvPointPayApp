import type { CaseStatus } from './types';

/** FilterBar chip değerleri — müşteriler sayfasındaki durum sekmeleri gibi */
export type SupportCaseStatusChip = 'open' | 'resolved' | 'rejected' | 'reOpened' | 'all';

export const SUPPORT_CASE_OPEN_STATUSES: CaseStatus[] = [
  'Unassigned',
  'Assigned',
  'Escalated',
  'InProgress',
  'WaitingForCustomer',
  'WaitingForAgent',
  'WaitingFor3rdParty',
];

export const SUPPORT_CASE_RESOLVED_STATUSES: CaseStatus[] = [
  'Resolved_IssueFixed',
  'Resolved_NoIssue',
  'Resolved_STRFiled',
];

export function matchesStatusChip(status: CaseStatus, chip: SupportCaseStatusChip): boolean {
  if (chip === 'all') return true;
  if (chip === 'open') return SUPPORT_CASE_OPEN_STATUSES.includes(status);
  if (chip === 'resolved') return SUPPORT_CASE_RESOLVED_STATUSES.includes(status);
  if (chip === 'rejected') return status === 'Rejected';
  if (chip === 'reOpened') return status === 'ReOpened';
  return status === chip;
}
