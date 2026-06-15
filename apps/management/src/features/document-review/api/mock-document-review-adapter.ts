import type { BackOfficeRole } from '@epay/ui';
import { REVIEW_DOCUMENTS } from '@/mocks/document-review-queue';
import { mockIndividualAdapter, patchIndividualFromReview } from '@/features/individual-form/api/mock-individual-adapter';
import { mockCorporateAdapter, patchCorporateFromReview } from '@/features/corporate-form/api/mock-corporate-adapter';
import { canApproveCategory, canViewCategory } from '../domain/permissions';
import { sortQueueItems } from '../domain/sort-queue';
import {
  confirmWarnings,
  validateApprove,
  validateReject,
  validateRequestAdditional,
} from '../domain/decision-validation';
import type { DocumentReviewService } from './document-review-service';
import type {
  ApprovePayload,
  EntityStatus,
  RejectPayload,
  RequestAdditionalPayload,
  ReviewCustomerSummary,
  ReviewDocumentDetail,
  ReviewDocumentRow,
  ReviewLogEntry,
  ReviewQueueFilters,
} from '../domain/types';

let store: ReviewDocumentRow[] = REVIEW_DOCUMENTS.map((d) => ({ ...d }));
let reviewLog: ReviewLogEntry[] = [];
let nextLogId = 1;
let nextDocId = 6000;

function isInQueue(doc: ReviewDocumentRow): boolean {
  return (
    doc.recordStatus === 1 &&
    doc.approvalRequired &&
    doc.approvalStatus === 'Pending'
  );
}

function applyFilters(rows: ReviewDocumentRow[], filters: ReviewQueueFilters): ReviewDocumentRow[] {
  const q = filters.query.trim().toLowerCase();
  const customerNo = filters.customerNo.trim().toLowerCase();
  return rows.filter((r) => {
    if (!isInQueue(r)) return false;
    if (filters.category !== 'any' && r.category !== filters.category) return false;
    if (filters.documentType !== 'any' && r.documentType !== filters.documentType) return false;
    if (filters.approvalStatus !== 'any' && (r.approvalStatus ?? 'Pending') !== filters.approvalStatus) {
      return false;
    }
    if (customerNo && !r.customerNo.toLowerCase().includes(customerNo)) return false;
    if (!q) return true;
    return (
      r.customerNo.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.documentType.toLowerCase().includes(q)
    );
  });
}

function buildCustomerSummary(customerId: number, customerType: string): ReviewCustomerSummary | null {
  if (customerType === 'corporate') {
    const c = mockCorporateAdapter.getById(String(customerId));
    if (!c) return null;
    const allDocs = [
      ...store.filter((d) => d.customerId === customerId).map((d) => ({
        category: d.category,
        type: d.documentType,
        status: d.documentStatus === 'Active' ? 'approved' : d.documentStatus.toLowerCase(),
        approvalStatus: d.approvalStatus ?? '',
      })),
      ...c.documents.map((d) => ({
        category: d.category,
        type: d.type,
        status: d.status,
        approvalStatus: d.status === 'approved' ? 'Approved' : 'Pending',
      })),
    ];
    return {
      customerId: c.id,
      customerNo: c.customerNo,
      customerName: c.tradeName,
      customerType: 'corporate',
      idType: 'VKN',
      idNo: c.taxNo,
      nationality: c.country,
      birthDate: c.establishmentDate,
      birthPlace: c.addresses[0]?.city ?? '—',
      maritalStatus: '—',
      serialNo: c.registryNo,
      issueDate: '',
      issuingAuthority: c.taxOffice,
      validityDate: '',
      motherName: '—',
      fatherName: '—',
      gender: '—',
      language: c.language,
      notes: c.notes,
      kycLevel: null,
      kycStatus: c.kycStatus,
      status: c.status,
      statusReason: c.statusReason,
      createdAt: c.createdAt,
      approvalStatus: c.kycStatus,
      documents: allDocs,
    };
  }

  const c = mockIndividualAdapter.getById(String(customerId));
  if (!c) return null;
  const allDocs = [
    ...store.filter((d) => d.customerId === customerId).map((d) => ({
      category: d.category,
      type: d.documentType,
      status: d.documentStatus === 'Active' ? 'approved' : d.documentStatus.toLowerCase(),
      approvalStatus: d.approvalStatus ?? '',
    })),
    ...c.documents.map((d) => ({
      category: d.category,
      type: d.type,
      status: d.status,
      approvalStatus: d.status === 'approved' ? 'Approved' : 'Pending',
    })),
  ];
  return {
    customerId: c.id,
    customerNo: c.customerNo,
    customerName: `${c.firstName} ${c.lastName}`.trim(),
    customerType: c.customerType === 'prospective' ? 'prospective' : 'individual',
    idType: c.idType,
    idNo: c.idNo,
    nationality: c.idCountry,
    birthDate: c.birthDate,
    birthPlace: c.birthPlace,
    maritalStatus: c.maritalStatus,
    serialNo: c.serialNo,
    issueDate: c.issueDate,
    issuingAuthority: c.issuingAuthority,
    validityDate: c.validityDate,
    motherName: c.motherName ?? '—',
    fatherName: c.fatherName ?? '—',
    gender: c.gender,
    language: c.language,
    notes: c.notes,
    kycLevel: c.kycLevel,
    kycStatus: c.kycLevel.startsWith('L') ? 'Approved' : 'Pending',
    status: c.status,
    statusReason: c.statusReason,
    createdAt: c.createdAt,
    approvalStatus: 'Pending',
    documents: allDocs,
  };
}

function appendLog(
  documentId: number,
  decision: ReviewLogEntry['decision'],
  comment: string,
  extra?: Partial<ReviewLogEntry>,
) {
  reviewLog = [
    ...reviewLog,
    {
      id: nextLogId++,
      documentId,
      decision,
      decidedBy: 'current.user',
      decidedAt: new Date().toISOString(),
      comment,
      ...extra,
    },
  ];
}

function applyApproveToCustomer(doc: ReviewDocumentRow, payload: ApprovePayload): void {
  const entityStatus = payload.entityStatus;
  if (doc.customerType === 'corporate') {
    const kycStatus =
      payload.kycStatus === 'unchanged' || payload.kycStatus == null
        ? undefined
        : payload.kycStatus;
    patchCorporateFromReview(doc.customerId, {
      status: entityStatus,
      kycStatus,
      statusReason: payload.statusReason ?? null,
    });
    return;
  }
  patchIndividualFromReview(doc.customerId, {
    status: mapEntityStatus(entityStatus, doc.customerType),
    kycLevel: payload.kycLevel,
    statusReason: payload.statusReason ?? null,
  });
}

function applyRejectToCustomer(doc: ReviewDocumentRow, payload: RejectPayload): void {
  if (doc.customerType === 'corporate') {
    if (payload.kycStatus === 'Rejected') {
      patchCorporateFromReview(doc.customerId, { kycStatus: 'Rejected' });
    }
    return;
  }
  patchIndividualFromReview(doc.customerId, {
    kycLevel: payload.kycLevel,
  });
}

function mapEntityStatus(status: EntityStatus, customerType: ReviewDocumentRow['customerType']): string {
  if (customerType === 'prospective' && status === 'active') return 'prospect';
  return status;
}

/** Test izolasyonu — belge kuyruğu ve review log seed'e döner. */
export function resetDocumentReviewStore(): void {
  store = REVIEW_DOCUMENTS.map((d) => ({ ...d }));
  reviewLog = [];
  nextLogId = 1;
  nextDocId = 6000;
}

export function getDocumentReviewLog(): ReviewLogEntry[] {
  return [...reviewLog];
}

export const mockDocumentReviewAdapter: DocumentReviewService = {
  listReviewQueue(
    role,
    filters = {
      query: '',
      customerNo: '',
      category: 'any',
      documentType: 'any',
      approvalStatus: 'any',
    },
  ) {
    const filtered = applyFilters(store, filters).filter((r) => canViewCategory(role, r.category));
    return sortQueueItems(filtered);
  },

  getDocumentDetail(id, role) {
    const doc = store.find((d) => d.id === id && d.recordStatus === 1);
    if (!doc || !canViewCategory(role, doc.category)) return null;
    const customer = buildCustomerSummary(doc.customerId, doc.customerType);
    if (!customer) return null;
    return {
      document: { ...doc },
      customer,
      reviewLog: reviewLog.filter((l) => l.documentId === id),
    };
  },

  downloadDocument(id) {
    const doc = store.find((d) => d.id === id);
    if (!doc) return { ok: false, filename: '' };
    return { ok: true, filename: `${doc.documentType.replace(/\s/g, '_')}_${doc.id}.pdf` };
  },

  approve(id, role, payload) {
    const doc = store.find((d) => d.id === id);
    if (!doc) return { ok: false, error: 'dr_not_found' };
    if (!canApproveCategory(role, doc.category)) return { ok: false, error: 'fx_forbidden' };

    const detail = mockDocumentReviewAdapter.getDocumentDetail(id, role);
    if (!detail) return { ok: false, error: 'dr_not_found' };

    const validation = validateApprove(payload, detail.customer);
    if (!validation.ok) return { ok: false, error: validation.error };
    if (!confirmWarnings(validation.warnings)) return { ok: false, error: 'dr_cancelled' };

    const now = new Date().toISOString();
    store = store.map((d) =>
      d.id === id
        ? {
            ...d,
            approvalStatus: 'Approved',
            documentStatus: 'Active',
            approvedAt: now,
            approvedBy: 'current.user',
          }
        : d,
    );
    applyApproveToCustomer(doc, payload);
    appendLog(id, 'approve', payload.comment);
    return { ok: true };
  },

  reject(id, role, payload) {
    const doc = store.find((d) => d.id === id);
    if (!doc) return { ok: false, error: 'dr_not_found' };
    if (!canApproveCategory(role, doc.category)) return { ok: false, error: 'fx_forbidden' };

    const validation = validateReject(payload);
    if (!validation.ok) return { ok: false, error: validation.error };

    store = store.map((d) =>
      d.id === id
        ? {
            ...d,
            approvalStatus: 'Rejected',
            documentStatus: 'Rejected',
          }
        : d,
    );
    applyRejectToCustomer(doc, payload);
    appendLog(id, 'reject', payload.comment);
    return { ok: true };
  },

  requestAdditional(id, role, payload) {
    const doc = store.find((d) => d.id === id);
    if (!doc) return { ok: false, error: 'dr_not_found' };
    if (!canApproveCategory(role, doc.category)) return { ok: false, error: 'fx_forbidden' };

    const validation = validateRequestAdditional(payload);
    if (!validation.ok) return { ok: false, error: validation.error };

    const newDoc: ReviewDocumentRow = {
      id: nextDocId++,
      customerId: doc.customerId,
      customerNo: doc.customerNo,
      customerName: doc.customerName,
      nationality: doc.nationality,
      suspiciousFlag: doc.suspiciousFlag,
      customerType: doc.customerType,
      category: payload.category,
      documentType: payload.documentType,
      approvalRequired: true,
      approvalStatus: 'Pending',
      documentStatus: 'Inactive',
      createdAt: new Date().toISOString(),
      createdBy: 'system.request',
      recordStatus: 1,
      approvedAt: null,
      approvedBy: null,
    };
    store = [...store, newDoc];

    appendLog(id, 'request_additional', payload.comment, {
      requestedCategory: payload.category,
      requestedType: payload.documentType,
    });
    return { ok: true };
  },
};
