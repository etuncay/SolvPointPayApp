import type { CaseStatus } from './types';

const CLOSED: CaseStatus[] = [
  'Resolved_IssueFixed',
  'Resolved_NoIssue',
  'Resolved_STRFiled',
  'Rejected',
];

export function isClosedCaseStatus(status: CaseStatus): boolean {
  return CLOSED.includes(status);
}

export function isOpenCaseStatus(status: CaseStatus): boolean {
  return !isClosedCaseStatus(status);
}

export const CASE_STATUS_TONE: Record<CaseStatus, string> = {
  Unassigned: 'muted',
  Assigned: 'info',
  Escalated: 'warning',
  InProgress: 'info',
  WaitingForCustomer: 'warning',
  WaitingForAgent: 'warning',
  WaitingFor3rdParty: 'warning',
  Resolved_IssueFixed: 'success',
  Resolved_NoIssue: 'success',
  Resolved_STRFiled: 'success',
  Rejected: 'danger',
  ReOpened: 'info',
};
