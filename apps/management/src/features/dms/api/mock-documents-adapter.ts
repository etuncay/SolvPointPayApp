import type { BackOfficeRole } from '@epay/ui';
import { DOCUMENT_RELATIONS_SEED } from '@/mocks/document-relations';
import { documentTypesService } from '@/features/dms/document-types/api/mock-document-types-adapter';
import { DMS_DOCUMENTS_SEED } from '@/mocks/documents';
import { TRANSACTIONS } from '@/mocks/transactions';
import { applyArchiveExpiredBatch } from '../domain/archive-expired-batch';
import { filterDocumentsByRole } from '../domain/doc-type-permissions';
import { buildDocumentDetail } from '../detail/domain/document-detail-projection';
import { canDownloadFile, canViewDetail } from '../detail/domain/detail-permissions';
import type { DocumentAccessLogEntry } from '../detail/domain/types';
import type {
  DocumentCreateResult,
  DocumentRelation,
  DocumentUploadAuditEntry,
  DocumentUploadPayload,
  DocumentsListFilters,
  DmsDocument,
  DmsDocumentListRow,
} from '../domain/types';
import { buildStorageFileName } from '../upload/domain/build-storage-file-name';
import { computeFileHash } from '../upload/domain/compute-file-hash';
import { validateUploadFile } from '../upload/domain/file-validation';
import { resolveInitialDocumentStatus } from '../upload/domain/initial-document-status';
import { resolvePrimaryEntityId } from '../upload/domain/resolve-primary-entity-id';
import { canUploadDocumentType } from '../upload/domain/upload-permissions';
import { validateUploadFormValues } from '../upload/domain/validation';
import type { DocumentsService } from './documents-service';

const MOCK_ARCHIVE_AS_OF = new Date('2026-05-24T12:00:00Z');

function seedDocumentStore(): DmsDocument[] {
  const seed = DMS_DOCUMENTS_SEED.map((d) => ({ ...d }));
  return applyArchiveExpiredBatch(seed, MOCK_ARCHIVE_AS_OF).docs;
}

let documentStore: DmsDocument[] = seedDocumentStore();
let relationStore: DocumentRelation[] = DOCUMENT_RELATIONS_SEED.map((r) => ({ ...r }));
let nextDocNum = 25;
let nextAuditId = 1;
let nextAccessLogId = 1;
let uploadAudit: DocumentUploadAuditEntry[] = [];
let accessLog: DocumentAccessLogEntry[] = [];

function typeByIdMap() {
  return new Map(documentTypesService.getAllTypeDefinitions().map((t) => [t.id, t]));
}

function now(): string {
  return new Date('2026-05-24T12:00:00Z').toISOString();
}

function currentUser(role: BackOfficeRole): string {
  return `${role}.user`;
}

function appendAccessLog(action: DocumentAccessLogEntry['action'], documentId: string, role: BackOfficeRole): void {
  accessLog = [
    ...accessLog,
    {
      id: nextAccessLogId++,
      action,
      documentId,
      userId: currentUser(role),
      at: now(),
    },
  ];
}

function getDocRelations(documentId: string): DocumentRelation[] {
  return relationStore.filter((r) => r.documentId === documentId);
}

function lookupTransactionRef(txKey: string): string | null {
  const q = txKey.trim();
  const byNo = TRANSACTIONS.find((t) => t.recordStatus === 1 && t.txNo === q);
  if (byNo) return byNo.referenceNo;
  const byRef = TRANSACTIONS.find((t) => t.recordStatus === 1 && t.referenceNo === q);
  return byRef?.referenceNo ?? null;
}

function shouldSimulateScanFail(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('simulateScanFail') === '1';
}

async function mockScan(fileHash: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
  if (shouldSimulateScanFail()) {
    return { ok: false, error: 'du_scan_quarantine' };
  }
  if (fileHash.startsWith('deadbeef')) {
    return { ok: false, error: 'du_scan_quarantine' };
  }
  return { ok: true };
}

function toListRow(d: DmsDocument): DmsDocumentListRow {
  return {
    id: d.id,
    documentCategory: d.documentCategory,
    documentTypeName: d.documentTypeName,
    documentStatus: d.documentStatus,
    createdAt: d.createdAt,
    createdBy: d.createdBy,
    approvedBy: d.approvedBy,
  };
}

function matchesFilters(
  doc: DmsDocument,
  filters: DocumentsListFilters,
  relations: DocumentRelation[],
): boolean {
  if (doc.recordStatus !== 1) return false;
  if (filters.category !== 'any' && doc.documentCategory !== filters.category) return false;
  if (filters.documentTypeId !== 'any' && doc.documentTypeId !== filters.documentTypeId) {
    return false;
  }
  if (filters.status !== 'any' && doc.documentStatus !== filters.status) return false;
  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    const hay = `${doc.id} ${doc.documentTypeName} ${doc.createdBy}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.relationType && filters.relatedId) {
    const hit = relations.some(
      (r) =>
        r.documentId === doc.id &&
        r.relationType === filters.relationType &&
        r.relatedId === filters.relatedId,
    );
    if (!hit) return false;
  }
  if (filters.dateFrom && doc.createdAt < `${filters.dateFrom}T00:00:00.000Z`) return false;
  if (filters.dateTo && doc.createdAt > `${filters.dateTo}T23:59:59.999Z`) return false;
  return true;
}

export const mockDocumentsAdapter: DocumentsService = {
  list(role, filters) {
    const visible = filterDocumentsByRole(role, documentStore, typeByIdMap());
    return visible
      .filter((d) => matchesFilters(d, filters, relationStore))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toListRow);
  },

  getById(role, id) {
    const doc = documentStore.find((d) => d.id === id && d.recordStatus === 1);
    if (!doc) return null;
    const type = typeByIdMap().get(doc.documentTypeId);
    if (type && !canViewDetail(role, type)) return null;
    return { ...doc };
  },

  getDetail(role, id) {
    const doc = documentStore.find((d) => d.id === id && d.recordStatus === 1);
    if (!doc) return null;
    const type = typeByIdMap().get(doc.documentTypeId);
    if (!canViewDetail(role, type)) return null;
    appendAccessLog('view', id, role);
    return buildDocumentDetail(doc, type, getDocRelations(id), role);
  },

  download(role, id) {
    const doc = documentStore.find((d) => d.id === id && d.recordStatus === 1);
    if (!doc) return { ok: false, error: 'dd_not_found' };
    const type = typeByIdMap().get(doc.documentTypeId);
    if (!canViewDetail(role, type)) return { ok: false, error: 'dd_forbidden' };
    if (!canDownloadFile(role, doc, type)) {
      return { ok: false, error: 'dd_download_forbidden' };
    }
    appendAccessLog('download', id, role);
    const blob = new Blob([`Mock document: ${doc.storageFileName}`], {
      type: doc.mimeType || 'application/octet-stream',
    });
    return { ok: true, blob, fileName: doc.fileName };
  },

  getDocumentTypesByCategory(role, category) {
    return documentTypesService.listByCategoryForUpload(role, category);
  },

  async create(role, payload) {
    const formCheck = validateUploadFormValues({
      category: payload.category,
      documentTypeId: payload.documentTypeId,
      validFrom: payload.validFrom,
      validUntil: payload.validUntil,
      relations: payload.relations,
    });
    if (!formCheck.ok) return formCheck;

    const docType = documentTypesService.getTypeDefinitionById(payload.documentTypeId);
    if (!docType || docType.category !== payload.category) {
      return { ok: false, error: 'du_type_required' };
    }
    if (!canUploadDocumentType(role, docType)) {
      return { ok: false, error: 'du_upload_forbidden' };
    }

    const fileErr = validateUploadFile({
      fileName: payload.file.name,
      mimeType: payload.file.type,
      sizeBytes: payload.file.size,
      maxSizeMb: docType.maxFileSizeMb,
    });
    if (fileErr) return { ok: false, error: fileErr };

    let fileHash: string;
    try {
      fileHash = await computeFileHash(payload.file);
    } catch {
      return { ok: false, error: 'du_hash_failed' };
    }

    const scan = await mockScan(fileHash);
    if (!scan.ok) return scan;

    const primaryId = resolvePrimaryEntityId(
      payload.category,
      payload.relations,
      lookupTransactionRef,
    );
    const storageFileName = buildStorageFileName(
      primaryId,
      docType.code,
      payload.file.name,
      new Date(),
    );
    const statusPair = resolveInitialDocumentStatus(docType.approvalRequired);
    const id = `DOC-${String(nextDocNum++).padStart(3, '0')}`;
    const user = currentUser(role);

    const row: DmsDocument = {
      id,
      documentCategory: payload.category,
      documentTypeId: docType.id,
      documentTypeName: docType.name,
      documentStatus: statusPair.documentStatus,
      approvalStatus: statusPair.approvalStatus,
      fileName: storageFileName,
      fileHash,
      storageFileName,
      mimeType: payload.file.type || 'application/octet-stream',
      fileSizeBytes: payload.file.size,
      validFrom: payload.validFrom || null,
      validUntil: payload.validUntil || null,
      createdAt: now(),
      createdBy: user,
      approvedBy: null,
      approvedAt: null,
      recordStatus: 1,
    };

    documentStore = [...documentStore, row];
    for (const rel of payload.relations) {
      relationStore = [
        ...relationStore,
        { documentId: id, relationType: rel.relationType, relatedId: rel.relatedId.trim() },
      ];
    }

    uploadAudit = [
      ...uploadAudit,
      {
        id: nextAuditId++,
        action: 'upload',
        documentId: id,
        fileHash,
        relationIds: payload.relations.map((r) => `${r.relationType}:${r.relatedId}`),
        uploadedBy: user,
        at: now(),
      },
    ];

    return {
      ok: true,
      id,
      fileName: storageFileName,
      fileHash,
      documentStatus: statusPair.documentStatus,
      approvalStatus: statusPair.approvalStatus,
    };
  },
};

export const documentsService: DocumentsService = mockDocumentsAdapter;

/** Test reset */
export function resetDocumentsMockStore(): void {
  documentStore = seedDocumentStore();
  relationStore = DOCUMENT_RELATIONS_SEED.map((r) => ({ ...r }));
  nextDocNum = 25;
  nextAuditId = 1;
  nextAccessLogId = 1;
  uploadAudit = [];
  accessLog = [];
}

export function getDocumentAccessLogForTest(): DocumentAccessLogEntry[] {
  return [...accessLog];
}

export function getDocumentsRelationsForTest(): DocumentRelation[] {
  return [...relationStore];
}

export function getUploadAuditForTest(): DocumentUploadAuditEntry[] {
  return [...uploadAudit];
}

/** §17 batch — test ve manuel doğrulama */
export function runArchiveExpiredForTest(asOf: Date = MOCK_ARCHIVE_AS_OF): number {
  const { updated, docs } = applyArchiveExpiredBatch(documentStore, asOf);
  documentStore = docs;
  return updated;
}

export function getDocumentStoreForTest(): DmsDocument[] {
  return documentStore.map((d) => ({ ...d }));
}
