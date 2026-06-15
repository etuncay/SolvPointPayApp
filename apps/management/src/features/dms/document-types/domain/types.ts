import type { BackOfficeRole } from '@epay/ui';
import type { DocumentCategory } from '@/features/document-review/domain/types';

export type { DocumentCategory };

/** dms.document_type master — spec §10 */
export type DocumentTypeMaster = {
  id: string;
  documentCategory: DocumentCategory;
  documentTypeCode: string;
  name: string;
  description: string;
  activeRetentionYears: number;
  archiveRetentionYears: number;
  maxFileSizeMb: number | null;
  isPersonalData: boolean;
  approvalRequired: boolean;
  uploaderRoles: BackOfficeRole[];
  viewerRoles: BackOfficeRole[];
  approverRoles: BackOfficeRole[];
  recordStatus: 0 | 1;
};

export type DocumentTypeListRow = DocumentTypeMaster;

export type DocumentTypesFilters = {
  query: string;
  category: string;
};

export const DEFAULT_DOCUMENT_TYPES_FILTERS: DocumentTypesFilters = {
  query: '',
  category: 'any',
};

/** 9.1 / eski tüketiciler için uyumluluk */
export type DocumentTypeDefinition = {
  id: string;
  code: string;
  name: string;
  category: DocumentCategory;
  approvalRequired: boolean;
  maxFileSizeMb: number;
  active: boolean;
  isPersonalData: boolean;
  activeRetentionYears: number;
  archiveRetentionYears: number;
  uploaderRoles: BackOfficeRole[];
  viewerRoles: BackOfficeRole[];
  approverRoles: BackOfficeRole[];
};

export function toTypeDefinition(m: DocumentTypeMaster): DocumentTypeDefinition {
  return {
    id: m.id,
    code: m.documentTypeCode,
    name: m.name,
    category: m.documentCategory,
    approvalRequired: m.approvalRequired,
    maxFileSizeMb: m.maxFileSizeMb ?? 10,
    active: m.recordStatus === 1,
    isPersonalData: m.isPersonalData,
    activeRetentionYears: m.activeRetentionYears,
    archiveRetentionYears: m.archiveRetentionYears,
    uploaderRoles: m.uploaderRoles,
    viewerRoles: m.viewerRoles,
    approverRoles: m.approverRoles,
  };
}

export type DocumentTypesAccessLogEntry = {
  id: number;
  action: 'list' | 'create' | 'update';
  userId: string;
  at: string;
  typeId?: string;
};
