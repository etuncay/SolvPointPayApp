import { appendAgentNotificationLog } from '@/mocks/notification-logs';
import type { AgentComplaintType } from '@/features/agent-feedback/domain/complaint-type';

export type CaseStatus = 'Unassigned' | 'Assigned' | 'InProgress' | 'Resolved_IssueFixed' | 'Rejected';

export type SupportCase = {
  id: number;
  caseNo: string;
  subject: string;
  complaintType: AgentComplaintType;
  requesterType: 'Customer' | 'Agent';
  requesterId: string;
  detail: string;
  ownerUserId: string | null;
  departmentId: string | null;
  urgency: 'Normal' | 'High' | 'Critical';
  criticality: 'Normal' | 'High' | 'Critical';
  caseStatus: CaseStatus;
  source: 'manual' | 'agent';
  channel: 'Agent' | null;
  createdAt: string;
  updatedAt: string;
  notesText: string;
  documentIds: string[];
};

export type AgentFeedbackCreateInput = {
  requesterType: 'Customer' | 'Agent';
  requesterId: string;
  subject: string;
  complaintType: AgentComplaintType;
  detail: string;
  notesText: string;
  documentIds: string[];
  notify: {
    phone: string;
    email: string;
    displayName: string;
  };
  performedBy: string;
  performedByName: string;
};

function ts(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

let store: SupportCase[] = [];
let nextId = 1;
let nextCaseSeq = 1;
const uploadedDocs = new Map<string, { fileName: string; uploadedAt: string }>();

export function resetSupportCasesStore(): void {
  store = [];
  nextId = 1;
  nextCaseSeq = 1;
  uploadedDocs.clear();
}

export function getSupportCasesStore(): SupportCase[] {
  return store.map((c) => ({ ...c, documentIds: [...c.documentIds] }));
}

export function getSupportCaseById(id: number): SupportCase | null {
  const row = store.find((c) => c.id === id);
  return row ? { ...row, documentIds: [...row.documentIds] } : null;
}

/** DMS mock — dosya yükleme. */
export function uploadFeedbackAttachment(fileName: string): { documentId: string } {
  const documentId = `DOC-FB-${Date.now()}`;
  uploadedDocs.set(documentId, { fileName, uploadedAt: ts() });
  return { documentId };
}

function notifyCaseOpened(caseRow: SupportCase, notify: AgentFeedbackCreateInput['notify']): void {
  appendAgentNotificationLog({
    createdAt: ts(),
    channel: 'SMS',
    templateName: 'agent_feedback_case_opened_sms',
    recipientAddress: notify.phone,
    messageRendered: `${caseRow.subject} — ${caseRow.caseNo}`,
  });
  appendAgentNotificationLog({
    createdAt: ts(),
    channel: 'Email',
    templateName: 'agent_feedback_case_opened_email',
    recipientAddress: notify.email,
    messageRendered: [
      `Talep No: ${caseRow.caseNo}`,
      `Konu: ${caseRow.subject}`,
      `Tip: ${caseRow.complaintType}`,
      `Detay: ${caseRow.detail}`,
      caseRow.notesText ? `Notlar: ${caseRow.notesText}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  });
}

/** Agent kanalından talep oluştur — BackOffice (10) ile uyumlu alanlar. */
export function createAgentFeedbackCase(input: AgentFeedbackCreateInput): SupportCase {
  const row: SupportCase = {
    id: nextId++,
    caseNo: `SC-AG-${String(nextCaseSeq++).padStart(5, '0')}`,
    subject: input.subject.trim(),
    complaintType: input.complaintType,
    requesterType: input.requesterType,
    requesterId: input.requesterId.trim(),
    detail: input.detail.trim(),
    ownerUserId: null,
    departmentId: null,
    urgency: 'Normal',
    criticality: 'Normal',
    caseStatus: 'Unassigned',
    source: 'agent',
    channel: 'Agent',
    createdAt: ts(),
    updatedAt: ts(),
    notesText: input.notesText.trim(),
    documentIds: [...input.documentIds],
  };
  store = [...store, row];
  notifyCaseOpened(row, input.notify);
  return row;
}
