import type { BackOfficeRole } from '@epay/ui';
import type { DocumentCategory } from '@/features/document-review/domain/types';
import {
  appendDocumentType,
  getAllDocumentTypesIncludingInactive,
  getDocumentTypeMasterById,
  getDocumentTypesStore,
  isDocumentTypeCodeTakenInStore,
  updateDocumentType,
} from '@/mocks/document-types-store';
import { canUploadDocumentType } from '@/features/dms/upload/domain/upload-permissions';
import type { DocumentTypeFormPayload } from '../form/domain/form-types';
import { canListDocumentTypes, canMutateDocumentTypes } from '../domain/permissions';
import type {
  DocumentTypeMaster,
  DocumentTypesAccessLogEntry,
  DocumentTypesFilters,
} from '../domain/types';
import { toTypeDefinition as toDef } from '../domain/types';
import type { DocumentTypesService } from './document-types-service';

let accessLog: DocumentTypesAccessLogEntry[] = [];
let nextLogId = 1;

function now(): string {
  return new Date('2026-05-24T12:00:00Z').toISOString();
}

function appendAccessLog(
  role: BackOfficeRole,
  action: DocumentTypesAccessLogEntry['action'],
  typeId?: string,
): void {
  accessLog = [
    ...accessLog,
    { id: nextLogId++, action, userId: `${role}.user`, at: now(), typeId },
  ];
}

function appendListLog(role: BackOfficeRole): void {
  appendAccessLog(role, 'list');
}

function masterFromPayload(payload: DocumentTypeFormPayload, id: string): DocumentTypeMaster {
  return {
    id,
    documentCategory: payload.documentCategory,
    documentTypeCode: payload.documentTypeCode,
    name: payload.name,
    description: payload.description,
    activeRetentionYears: payload.activeRetentionYears,
    archiveRetentionYears: payload.archiveRetentionYears,
    maxFileSizeMb: payload.maxFileSizeMb,
    isPersonalData: payload.isPersonalData,
    approvalRequired: payload.approvalRequired,
    uploaderRoles: payload.uploaderRoles,
    viewerRoles: payload.viewerRoles,
    approverRoles: payload.approverRoles,
    recordStatus: 1,
  };
}

function sortRows(rows: DocumentTypeMaster[]): DocumentTypeMaster[] {
  return [...rows].sort((a, b) => {
    const cat = a.documentCategory.localeCompare(b.documentCategory);
    if (cat !== 0) return cat;
    return a.name.localeCompare(b.name, 'tr');
  });
}

function matchesFilters(row: DocumentTypeMaster, filters: DocumentTypesFilters): boolean {
  if (filters.category !== 'any' && row.documentCategory !== filters.category) return false;
  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    const hay = `${row.name} ${row.documentTypeCode} ${row.description}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export const mockDocumentTypesAdapter: DocumentTypesService = {
  list(filters, role) {
    if (!canListDocumentTypes(role)) return [];
    appendListLog(role);
    return sortRows(getDocumentTypesStore().filter((t) => matchesFilters(t, filters)));
  },

  listByCategory(category) {
    return sortRows(getDocumentTypesStore().filter((t) => t.documentCategory === category));
  },

  listByCategoryForUpload(role, category) {
    return this.listByCategory(category)
      .map(toDef)
      .filter((t) => canUploadDocumentType(role, { uploaderRoles: t.uploaderRoles }));
  },

  getById(id) {
    return getDocumentTypeMasterById(id) ?? null;
  },

  getTypeDefinitionById(id) {
    const m = getDocumentTypeMasterById(id);
    return m ? toDef(m) : undefined;
  },

  getAllTypeDefinitions() {
    return getDocumentTypesStore().map(toDef);
  },

  create(role, payload) {
    if (!canMutateDocumentTypes(role)) return { ok: false, error: 'rsc_forbidden' };
    if (isDocumentTypeCodeTakenInStore(payload.documentTypeCode)) {
      return { ok: false, error: 'dtf_duplicate_type_code' };
    }
    const id = `DT-${payload.documentTypeCode}`;
    if (getDocumentTypeMasterById(id)) {
      return { ok: false, error: 'dtf_duplicate_type_code' };
    }
    appendDocumentType(masterFromPayload(payload, id));
    appendAccessLog(role, 'create', id);
    return { ok: true, id };
  },

  update(role, id, payload) {
    if (!canMutateDocumentTypes(role)) return { ok: false, error: 'rsc_forbidden' };
    const existing = getDocumentTypeMasterById(id);
    if (!existing) return { ok: false, error: 'dtf_not_found' };
    if (payload.documentTypeCode !== existing.documentTypeCode) {
      return { ok: false, error: 'dtf_code_locked' };
    }
    const ok = updateDocumentType(id, {
      documentCategory: payload.documentCategory,
      name: payload.name,
      description: payload.description,
      activeRetentionYears: payload.activeRetentionYears,
      archiveRetentionYears: payload.archiveRetentionYears,
      maxFileSizeMb: payload.maxFileSizeMb,
      isPersonalData: payload.isPersonalData,
      approvalRequired: payload.approvalRequired,
      uploaderRoles: payload.uploaderRoles,
      viewerRoles: payload.viewerRoles,
      approverRoles: payload.approverRoles,
      recordStatus: 1,
    });
    if (!ok) return { ok: false, error: 'dtf_not_found' };
    appendAccessLog(role, 'update', id);
    return { ok: true, id };
  },
};

export function getAllDocumentTypeCodesForTest(): { id: string; documentTypeCode: string }[] {
  return getAllDocumentTypesIncludingInactive()
    .filter((t) => t.recordStatus === 1)
    .map((t) => ({ id: t.id, documentTypeCode: t.documentTypeCode }));
}

export const documentTypesService: DocumentTypesService = mockDocumentTypesAdapter;

export function resetDocumentTypesAccessLog(): void {
  accessLog = [];
  nextLogId = 1;
}

export function getDocumentTypesAccessLogForTest(): DocumentTypesAccessLogEntry[] {
  return [...accessLog];
}
