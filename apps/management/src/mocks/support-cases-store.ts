import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import { userNameById } from '@/features/approval-pool/domain/current-user';
import type { CustomerPortalSupportCaseFeedEntry } from '@epay/data';
import { documentsService } from '@/features/dms/api/mock-documents-adapter';
import type {
  CaseActionLogEntry,
  CaseDocumentLink,
  ComplaintType,
  SupportCase,
  SupportCaseDetail,
  SupportCaseFormValues,
} from '@/features/support/domain/types';
import { ACTION_LABELS, appendCaseNote, formatCaseNoteLine } from '@/features/support/form/domain/note-format';
import { initialCaseStatus } from '@/features/support/form/domain/initial-case-status';
import { applyCaseAction, type ActionApplyInput } from '@/features/support/form/domain/transitions';
import { isClosedCaseStatus } from '@/features/support/domain/case-status-ui';
import { sendTemplate } from '@/features/system/notifications';
import { getNotificationLogs } from '@/mocks/notification-logs';

function ts(): string {
  return new Date('2026-05-24T12:00:00Z').toISOString();
}

function tsDaysAgo(days: number): string {
  const d = new Date('2026-05-24T12:00:00Z');
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const SEED: SupportCase[] = [
  {
    id: 1,
    caseNo: 'SC-2026-00001',
    subject: 'Genel destek talebi',
    complaintType: 'General',
    requesterType: 'Customer',
    requesterId: '10042',
    detail: 'Müşteri uygulama giriş sorunu bildirdi.',
    ownerUserId: null,
    departmentId: 'support',
    urgency: 'Medium',
    criticality: 'Medium',
    caseStatus: 'Unassigned',
    lastAction: null,
    reconciliationId: null,
    source: 'manual',
    createdAt: tsDaysAgo(5),
    updatedAt: tsDaysAgo(5),
    closedAt: null,
    notesText: '',
    actionLog: [],
    documentIds: [],
  },
  {
    id: 2,
    caseNo: 'SC-2026-00002',
    subject: 'İade işlemi gecikmesi',
    complaintType: 'Billing',
    requesterType: 'Customer',
    requesterId: '10055',
    detail: 'İade 3 gündür hesaba geçmedi.',
    ownerUserId: MOCK_USER_IDS.ops,
    departmentId: 'operations',
    urgency: 'High',
    criticality: 'Medium',
    caseStatus: 'Assigned',
    lastAction: 'Assignment',
    reconciliationId: null,
    source: 'manual',
    createdAt: tsDaysAgo(3),
    updatedAt: tsDaysAgo(1),
    closedAt: null,
    notesText: 'Ahmet Yılmaz – 21.05.2026 14:30 – Üzerime Al: Talep inceleniyor',
    actionLog: [],
    documentIds: [],
  },
  {
    id: 3,
    caseNo: 'SC-2026-00003',
    subject: 'Uyum inceleme talebi',
    complaintType: 'Technical',
    requesterType: 'Agent',
    requesterId: 'AG-1001',
    detail: 'Temsilci limit artışı için belge eksik.',
    ownerUserId: MOCK_USER_IDS.finance,
    departmentId: 'finance',
    urgency: 'Medium',
    criticality: 'High',
    caseStatus: 'InProgress',
    lastAction: 'InformationRequested',
    reconciliationId: null,
    source: 'manual',
    createdAt: tsDaysAgo(7),
    updatedAt: tsDaysAgo(2),
    closedAt: null,
    notesText: '',
    actionLog: [],
    documentIds: [],
  },
  {
    id: 4,
    caseNo: 'SC-2026-00004',
    subject: 'Müşteri bilgi bekleniyor',
    complaintType: 'General',
    requesterType: 'Customer',
    requesterId: '10042',
    detail: 'Ek kimlik belgesi istendi.',
    ownerUserId: MOCK_USER_IDS.ops,
    departmentId: null,
    urgency: 'High',
    criticality: 'Critical',
    caseStatus: 'WaitingForCustomer',
    lastAction: 'InformationRequested',
    reconciliationId: null,
    source: 'manual',
    createdAt: tsDaysAgo(2),
    updatedAt: tsDaysAgo(0),
    closedAt: null,
    notesText: '',
    actionLog: [],
    documentIds: ['DOC-DETAIL-003'],
  },
  {
    id: 5,
    caseNo: 'SC-2026-00005',
    subject: 'Çözümlenmiş şikayet',
    complaintType: 'General',
    requesterType: 'Customer',
    requesterId: '10099',
    detail: 'Sorun giderildi.',
    ownerUserId: MOCK_USER_IDS.management,
    departmentId: 'support',
    urgency: 'Medium',
    criticality: 'Medium',
    caseStatus: 'Resolved_IssueFixed',
    lastAction: 'CaseClosed',
    reconciliationId: null,
    source: 'manual',
    createdAt: tsDaysAgo(30),
    updatedAt: tsDaysAgo(10),
    closedAt: tsDaysAgo(10),
    notesText: 'Mehmet Şahin – 14.05.2026 10:00 – Çözümle: Müşteri onayladı',
    actionLog: [],
    documentIds: [],
  },
  {
    id: 6,
    caseNo: 'SC-2026-00006',
    subject: 'Mutabakat uyuşmazlığı — REF-880001',
    complaintType: 'ReconciliationDiscrepancy',
    requesterType: 'Customer',
    requesterId: '—',
    detail: 'Otomatik mutabakat farkı.',
    ownerUserId: MOCK_USER_IDS.finance,
    departmentId: 'finance',
    urgency: 'High',
    criticality: 'Critical',
    caseStatus: 'Assigned',
    lastAction: 'Assignment',
    reconciliationId: 1,
    source: 'reconciliation',
    createdAt: tsDaysAgo(1),
    updatedAt: tsDaysAgo(0),
    closedAt: null,
    notesText: 'Otomatik açıldı — tutar farkı',
    actionLog: [],
    documentIds: [],
  },
  {
    id: 7,
    caseNo: 'SC-2026-00007',
    subject: 'Reddedilen talep',
    complaintType: 'Billing',
    requesterType: 'Customer',
    requesterId: '10088',
    detail: 'Geçersiz şikayet.',
    ownerUserId: MOCK_USER_IDS.ops,
    departmentId: null,
    urgency: 'Medium',
    criticality: 'Medium',
    caseStatus: 'Rejected',
    lastAction: 'Rejected',
    reconciliationId: null,
    source: 'manual',
    createdAt: tsDaysAgo(15),
    updatedAt: tsDaysAgo(12),
    closedAt: tsDaysAgo(12),
    notesText: '',
    actionLog: [],
    documentIds: [],
  },
];

function cloneCase(c: SupportCase): SupportCase {
  return {
    ...c,
    actionLog: [...(c.actionLog ?? [])],
    documentIds: [...(c.documentIds ?? [])],
  };
}

let store: SupportCase[] = SEED.map(cloneCase);
let nextId = 8;
let nextCaseSeq = 8;
let nextLogSeq = 1;

export function resetSupportCasesStore(seed: SupportCase[] = SEED): void {
  store = seed.map(cloneCase);
  nextId = Math.max(8, ...store.map((c) => c.id), 0) + 1;
  nextCaseSeq = Math.max(8, ...store.map((c) => {
    const m = c.caseNo.match(/(\d+)$/);
    return m ? Number(m[1]) : 0;
  }), 0) + 1;
  nextLogSeq = 1;
}

function mapPortalComplaintType(type: string): ComplaintType {
  if (type === 'Request' || type === 'Information') return 'Technical';
  if (type === 'Objection') return 'Billing';
  return 'General';
}

/** Müşteri portalı şikâyet feed → destek merkezi listesi (demo köprüsü). */
export function ingestCustomerPortalSupportCases(
  entries: CustomerPortalSupportCaseFeedEntry[],
): void {
  for (const entry of entries) {
    if (store.some((c) => c.caseNo === entry.caseNo)) continue;
    const row: SupportCase = {
      id: nextId++,
      caseNo: entry.caseNo,
      subject: entry.subject,
      complaintType: mapPortalComplaintType(entry.complaintType),
      requesterType: 'Customer',
      requesterId: entry.customerId,
      detail: entry.message,
      ownerUserId: null,
      departmentId: 'support',
      urgency: 'Medium',
      criticality: 'Medium',
      caseStatus: 'Unassigned',
      lastAction: null,
      reconciliationId: null,
      source: 'manual',
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
      closedAt: null,
      notesText: `Müşteri portalı — tip: ${entry.complaintType}`,
      actionLog: [],
      documentIds: [],
    };
    store = [...store, row];
  }
}

export function getSupportCasesStore(): SupportCase[] {
  return store.map(cloneCase);
}

export function getSupportCaseById(id: number): SupportCase | null {
  const c = store.find((x) => x.id === id);
  return c ? cloneCase(c) : null;
}

export function findOpenReconciliationCase(reconciliationId: number): SupportCase | null {
  return (
    store.find(
      (c) =>
        c.reconciliationId === reconciliationId &&
        c.source === 'reconciliation' &&
        !isClosedCaseStatus(c.caseStatus),
    ) ?? null
  );
}

function buildDocuments(caseRow: SupportCase): CaseDocumentLink[] {
  const links: CaseDocumentLink[] = [];
  for (const docId of caseRow.documentIds) {
    const doc = documentsService.getById('management', docId);
    if (!doc) continue;
    links.push({
      documentId: doc.id,
      fileName: doc.fileName,
      documentCategory: doc.documentCategory,
      documentTypeName: doc.documentTypeName,
      createdAt: doc.createdAt,
      createdBy: doc.createdBy,
    });
  }
  return links;
}

export function getSupportCaseDetail(id: number): SupportCaseDetail | null {
  const c = getSupportCaseById(id);
  if (!c) return null;
  return { ...c, documents: buildDocuments(c) };
}

function pushLog(
  caseId: number,
  entry: Omit<CaseActionLogEntry, 'id' | 'caseId'>,
  actionLabelKey: string,
): void {
  const logEntry: CaseActionLogEntry = {
    id: `LOG-${nextLogSeq++}`,
    caseId,
    ...entry,
  };
  const line = formatCaseNoteLine(logEntry, ACTION_LABELS[actionLabelKey] ?? actionLabelKey);
  store = store.map((c) => {
    if (c.id !== caseId) return c;
    return {
      ...c,
      actionLog: [...c.actionLog, logEntry],
      notesText: appendCaseNote(c.notesText, line),
      updatedAt: ts(),
    };
  });
}

export function createSupportCase(
  values: SupportCaseFormValues,
  performedBy: string,
  performedByName: string,
): SupportCase {
  const status = initialCaseStatus(values.ownerUserId, values.departmentId);
  const row: SupportCase = {
    id: nextId++,
    caseNo: `SC-2026-${String(nextCaseSeq++).padStart(5, '0')}`,
    subject: values.subject.trim(),
    complaintType: values.complaintType as ComplaintType,
    requesterType: values.requesterType as SupportCase['requesterType'],
    requesterId: values.requesterId.trim(),
    detail: values.detail.trim(),
    ownerUserId: values.ownerUserId.trim() || null,
    departmentId: values.departmentId.trim() || null,
    urgency: values.urgency,
    criticality: values.criticality,
    caseStatus: status,
    lastAction: status === 'Assigned' ? 'Assignment' : null,
    reconciliationId: null,
    source: 'manual',
    createdAt: ts(),
    updatedAt: ts(),
    closedAt: null,
    notesText: '',
    actionLog: [],
    documentIds: [],
  };
  store = [...store, row];
  if (status === 'Assigned') {
    pushLog(
      row.id,
      {
        action: 'Assignment',
        statusAfter: 'Assigned',
        note: 'Talep oluşturuldu',
        performedBy,
        performedByName,
        createdAt: ts(),
      },
      'scf_action_create',
    );
  }
  void sendTemplate({
    templateIdOrName: 'support_case_opened_email',
    recipientAddress: 'ops@epay.local',
    recipientDisplayName: performedByName,
    params: {
      kullanici_adi: performedByName,
      talep_no: row.caseNo,
      konu: row.subject,
      link: 'https://epay.local/support',
    },
    triggeredBy: performedBy,
  }).catch(() => undefined);
  return row;
}

export function createReconciliationCase(input: {
  reconciliationId: number;
  amountDelta: number;
  referenceNo: string;
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  criticalityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}): SupportCase {
  const existing = findOpenReconciliationCase(input.reconciliationId);
  if (existing) {
    pushLog(
      existing.id,
      {
        action: 'Assignment',
        statusAfter: existing.caseStatus,
        note: `Mutabakat tekrar çalıştırıldı — REF ${input.referenceNo}, fark ${input.amountDelta}`,
        performedBy: MOCK_USER_IDS.finance,
        performedByName: userNameById(MOCK_USER_IDS.finance),
        createdAt: ts(),
      },
      'scf_action_recon_rerun',
    );
    return getSupportCaseById(existing.id)!;
  }

  const row: SupportCase = {
    id: nextId++,
    caseNo: `SC-2026-${String(nextCaseSeq++).padStart(5, '0')}`,
    subject: `Mutabakat uyuşmazlığı — ${input.referenceNo}`,
    complaintType: 'ReconciliationDiscrepancy',
    requesterType: 'Customer',
    requesterId: '—',
    detail: `Otomatik açıldı — tutar farkı ${input.amountDelta}`,
    ownerUserId: MOCK_USER_IDS.finance,
    departmentId: 'finance',
    urgency: input.urgencyLevel,
    criticality: input.criticalityLevel,
    caseStatus: 'Assigned',
    lastAction: 'Assignment',
    reconciliationId: input.reconciliationId,
    source: 'reconciliation',
    createdAt: ts(),
    updatedAt: ts(),
    closedAt: null,
    notesText: `Otomatik açıldı — tutar farkı ${input.amountDelta}`,
    actionLog: [],
    documentIds: [],
  };
  store = [...store, row];
  return row;
}

export function postSupportCaseAction(caseId: number, input: ActionApplyInput): SupportCase | null {
  const current = getSupportCaseById(caseId);
  if (!current) return null;
  const result = applyCaseAction(current, input);
  store = store.map((c) => {
    if (c.id !== caseId) return c;
    return {
      ...c,
      caseStatus: result.caseStatus,
      lastAction: result.lastAction,
      ownerUserId: result.ownerUserId,
      departmentId: result.departmentId,
      closedAt: result.closedAt,
      updatedAt: ts(),
    };
  });
  pushLog(
    caseId,
    {
      action: result.logAction,
      statusAfter: result.caseStatus,
      note: result.logNote,
      channel: input.channel,
      contactedParty: input.contactedParty,
      performedBy: input.performedBy,
      performedByName: input.performedByName,
      createdAt: ts(),
    },
    result.actionLabelKey,
  );
  void sendTemplate({
    templateIdOrName: 'support_case_opened',
    recipientAddress: '05551234567',
    recipientDisplayName: current.caseNo,
    params: {
      kullanici_adi: input.performedByName,
      talep_no: current.caseNo,
    },
    triggeredBy: input.performedBy,
  }).catch(() => undefined);
  return getSupportCaseById(caseId);
}

export function resolveSupportCase(caseId: number): void {
  postSupportCaseAction(caseId, {
    kind: 'resolve',
    performedBy: MOCK_USER_IDS.finance,
    performedByName: userNameById(MOCK_USER_IDS.finance),
    note: 'Mutabakat kapatıldı — Adjusted',
    resolutionCode: 'Resolved_IssueFixed',
  });
}

export function attachDocumentToCase(caseId: number, documentId: string): void {
  store = store.map((c) =>
    c.id === caseId && !c.documentIds.includes(documentId)
      ? { ...c, documentIds: [...c.documentIds, documentId], updatedAt: ts() }
      : c,
  );
}

export function getNotificationLogForTest() {
  return getNotificationLogs().map((l) => ({
    channel: l.notificationType === 'SMS' ? 'sms' : 'email',
    caseNo: l.messageRendered.match(/SC-\d{4}-\d+/)?.[0] ?? l.templateName,
    subject: l.messageRendered.slice(0, 80),
  }));
}

/** Eski API uyumluluğu */
export function appendSupportCaseLog(caseId: number, message: string) {
  const c = getSupportCaseById(caseId);
  if (!c) return;
  store = store.map((row) =>
    row.id === caseId
      ? { ...row, notesText: appendCaseNote(row.notesText, message), updatedAt: ts() }
      : row,
  );
}

export function getSupportCasesSnapshot(): SupportCase[] {
  return getSupportCasesStore();
}
