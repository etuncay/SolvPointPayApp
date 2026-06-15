import type { CaseStatus } from './types';

export const OPEN_CASE_STATUSES: CaseStatus[] = [
  'Unassigned',
  'Assigned',
  'InProgress',
  'WaitingForCustomer',
  'WaitingForAgent',
  'WaitingFor3rdParty',
  'Escalated',
  'ReOpened',
];

export const CLOSED_CASE_STATUSES: CaseStatus[] = [
  'Resolved_IssueFixed',
  'Resolved_STRFiled',
  'Resolved_NoIssue',
  'Resolved_ConfirmedFraud',
  'Resolved_PreventedFraud',
  'Resolved_InsufficientEvidence',
  'Rejected',
];

export function isOpenCase(status: CaseStatus): boolean {
  return OPEN_CASE_STATUSES.includes(status);
}

export function isClosedCase(status: CaseStatus): boolean {
  return CLOSED_CASE_STATUSES.includes(status);
}
