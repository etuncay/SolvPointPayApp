export type ComplaintType =
  | 'General'
  | 'Technical'
  | 'Billing'
  | 'Reconciliation'
  | 'ReconciliationDiscrepancy';

export type CaseStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'Escalated'
  | 'InProgress'
  | 'WaitingForCustomer'
  | 'WaitingForAgent'
  | 'WaitingFor3rdParty'
  | 'Resolved_IssueFixed'
  | 'Resolved_NoIssue'
  | 'Resolved_STRFiled'
  | 'Rejected'
  | 'ReOpened';

export type CaseAction =
  | 'Assignment'
  | 'Reassignment'
  | 'Escalation'
  | 'CustomerContacted'
  | 'AgentContacted'
  | 'InformationRequested'
  | 'FinalResolutionProvided'
  | 'CaseClosed'
  | 'ComplaintWithdrawn'
  | 'Rejected'
  | 'CaseReopened';

export type Level = 'Low' | 'Medium' | 'High' | 'Critical';

export type EntityTypeCore = 'Customer' | 'Agent' | 'ThirdParty';

export type ContactedParty = 'customer' | 'agent' | 'thirdParty';

export type CaseActionLogEntry = {
  id: string;
  caseId: number;
  action: CaseAction;
  statusAfter: CaseStatus;
  note: string;
  channel?: string;
  contactedParty?: ContactedParty;
  performedBy: string;
  performedByName: string;
  createdAt: string;
};

export type CaseDocumentLink = {
  documentId: string;
  fileName: string;
  documentCategory: string;
  documentTypeName: string;
  createdAt: string;
  createdBy: string;
};

export type SupportCase = {
  id: number;
  caseNo: string;
  subject: string;
  complaintType: ComplaintType;
  requesterType: EntityTypeCore;
  requesterId: string;
  detail: string;
  ownerUserId: string | null;
  departmentId: string | null;
  urgency: Level;
  criticality: Level;
  caseStatus: CaseStatus;
  lastAction: CaseAction | null;
  reconciliationId: number | null;
  source: 'manual' | 'reconciliation';
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  notesText: string;
  actionLog: CaseActionLogEntry[];
  documentIds: string[];
};

export type SupportCaseDetail = SupportCase & {
  documents: CaseDocumentLink[];
};

export type SupportCaseListRow = {
  id: number;
  caseNo: string;
  subject: string;
  complaintType: ComplaintType;
  ownerDisplayName: string;
  urgency: Level;
  criticality: Level;
  createdAt: string;
  updatedAt: string;
  caseAgeDays: number;
  caseStatus: CaseStatus;
};

export type SupportCaseFilters = {
  query: string;
  complaintType: string;
  status: string;
  urgency: string;
  criticality: string;
  ownerUserId: string;
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
  assignedToMe: boolean;
};

export const DEFAULT_SUPPORT_CASE_FILTERS: SupportCaseFilters = {
  query: '',
  complaintType: 'any',
  status: 'all',
  urgency: 'any',
  criticality: 'any',
  ownerUserId: 'any',
  createdFrom: '',
  createdTo: '',
  updatedFrom: '',
  updatedTo: '',
  assignedToMe: false,
};

export type SupportCaseFormValues = {
  requesterType: EntityTypeCore | '';
  requesterId: string;
  subject: string;
  complaintType: ComplaintType | '';
  ownerUserId: string;
  departmentId: string;
  urgency: Level;
  criticality: Level;
  detail: string;
};

export const EMPTY_SUPPORT_CASE_FORM: SupportCaseFormValues = {
  requesterType: '',
  requesterId: '',
  subject: '',
  complaintType: '',
  ownerUserId: '',
  departmentId: '',
  urgency: 'Medium',
  criticality: 'Medium',
  detail: '',
};

export type SupportCaseCreateResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export type SupportCaseActionResult =
  | { ok: true }
  | { ok: false; error: string };
