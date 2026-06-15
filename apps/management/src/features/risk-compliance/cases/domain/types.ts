import type { RiskLevel } from '../../shared/risk-classification';
import type { TransactionStatus, TransactionType } from '@/features/wallets/domain/activity-types';

/** Spec §0.18 — fraud/AML vaka statüsü */
export type CaseStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'InProgress'
  | 'WaitingForCustomer'
  | 'WaitingForAgent'
  | 'WaitingFor3rdParty'
  | 'Escalated'
  | 'ReOpened'
  | 'Resolved_IssueFixed'
  | 'Resolved_STRFiled'
  | 'Resolved_NoIssue'
  | 'Resolved_ConfirmedFraud'
  | 'Resolved_PreventedFraud'
  | 'Resolved_InsufficientEvidence'
  | 'Rejected';

export type CaseChannel = 'Mobile' | 'Web' | 'Branch' | 'API';

export type CaseQuickFilter =
  | 'none'
  | 'closed'
  | 'high_priority'
  | 'new'
  | 'sla_due'
  | 'assigned_me';

export type FraudCaseRecord = {
  id: string;
  transactionId: number;
  ruleId: string;
  priority: RiskLevel;
  riskScore: number;
  caseStatus: CaseStatus;
  assignedUserId: string | null;
  slaDueAt: string;
  createdAt: string;
  channel: CaseChannel;
};

/** Liste projection — spec §5 (18 kolon) */
export type FraudCaseListItem = {
  id: string;
  transactionNo: string;
  transactionDate: string;
  priority: RiskLevel;
  transactionType: TransactionType;
  ruleTitle: string;
  riskScore: number;
  senderCustomerNo: number | null;
  senderName: string;
  receiverCustomerNo: number | null;
  receiverName: string;
  senderAgentNo: number | null;
  receiverAgentNo: number | null;
  iban: string | null;
  currency: string;
  amount: number;
  channel: CaseChannel;
  transactionStatus: TransactionStatus;
  caseStatus: CaseStatus;
  assignedUserName: string | null;
  slaDueAt: string;
  createdAt: string;
};

export type CaseListFilters = {
  query: string;
  showClosed: boolean;
  quickFilter: CaseQuickFilter;
};

export const DEFAULT_CASE_FILTERS: CaseListFilters = {
  query: '',
  showClosed: false,
  quickFilter: 'none',
};

export type FraudCaseHeader = {
  id: string;
  transactionNo: string;
  caseStatus: CaseStatus;
  priority: RiskLevel;
};
