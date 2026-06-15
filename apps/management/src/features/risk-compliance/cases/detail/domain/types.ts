import type { CaseStatus, CaseChannel } from '../../domain/types';
import type { RiskLevel } from '../../../shared/risk-classification';
import type { TransactionStatus, TransactionType } from '@/features/wallets/domain/activity-types';
import type { FraudExceptionInput } from '@/features/risk-compliance/fraud-rules/detail/domain/types';

export type CaseAction = 'approve' | 'reject' | 'route' | 'exception' | 'report';

export type CaseActionLogEntry = {
  id: string;
  caseId: string;
  action: CaseAction;
  comment: string;
  managerNote?: string;
  targetUserId?: string;
  at: string;
  actorUserId: string;
  actorName: string;
};

export type CaseDetailHeader = {
  id: string;
  caseStatus: CaseStatus;
  priority: RiskLevel;
  slaDueAt: string;
  createdAt: string;
  channel: CaseChannel;
  transactionId: number;
  transactionNo: string;
  riskScore: number;
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedToManager: boolean;
  isClosed: boolean;
  ruleId: string;
};

export type CustomerInfoPanel = {
  customerId: number;
  name: string;
  type: string;
  email: string;
  phone: string;
  idNo: string;
  kyc: string;
  riskScore: number;
  status: string;
  // 7.5.2 — genişletilmiş müşteri künyesi (salt-okunur, hesaplanmış profil)
  riskCategory: string;
  idType: string;
  idCountry: string;
  birthCountry: string;
  addressCountry: string;
  birthDate: string;
  declaredIncome: string;
  occupation: string;
  address: string;
  accountAge: string;
  addressVerified: string;
};

export type CustomerAccountRow = {
  walletId: number;
  currency: string;
  available: number;
  blocked: number;
  status: string;
};

export type CustomerTxMetricRow = {
  label: string;
  value: string;
};

export type AccessSignalRow = {
  label: string;
  value: string;
};

export type AgentMetricRow = {
  label: string;
  value: string;
};

export type AgentInfoPanel = {
  agentId: number;
  name: string;
  groupCode: string;
  city: string;
  status: string;
  riskCategory: string;
  country: string;
};

export type TransactionPanelData = {
  txNo: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  createdAt: string;
  channel: CaseChannel;
  senderName: string;
  receiverName: string;
  iban: string | null;
};

export type SharedContactPanel = {
  sharedEmails: string[];
  sharedPhones: string[];
  disclaimer: boolean;
};

export type RelatedCustomerRow = {
  customerId: number;
  name: string;
  relation: string;
  txCount1y: number;
  totalAmount1y: number;
};

export type TriggerRulePanel = {
  ruleId: string;
  title: string;
  scope: string;
  priority: RiskLevel;
  dslSummary: string;
  regulationReference: string;
};

export type CaseDetail = {
  header: CaseDetailHeader;
  customer: CustomerInfoPanel;
  accounts: CustomerAccountRow[];
  txMetrics: CustomerTxMetricRow[];
  accessSignals: AccessSignalRow[];
  agent: AgentInfoPanel | null;
  agentMetrics: AgentMetricRow[];
  transaction: TransactionPanelData;
  sharedContact: SharedContactPanel | null;
  relatedCustomers: RelatedCustomerRow[];
  rule: TriggerRulePanel;
  actionLog: CaseActionLogEntry[];
  linkedCustomersCount: number;
};

export type CaseDecisionInput = {
  comment: string;
  managerNote?: string;
};

export type CaseRouteInput = CaseDecisionInput & {
  targetUserId: string;
};

export type CaseActionResult = {
  ok: boolean;
  error?: string;
};

export type { FraudExceptionInput };
