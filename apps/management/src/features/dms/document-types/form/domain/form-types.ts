import type { BackOfficeRole } from '@epay/ui';
import type { DocumentCategory } from '@/features/document-review/domain/types';

export type DocumentTypeFormValues = {
  documentCategory: DocumentCategory | '';
  name: string;
  documentTypeCode: string;
  description: string;
  activeRetentionYears: number;
  archiveRetentionYears: number;
  maxFileSizeMb: string;
  isPersonalData: boolean;
  approvalRequired: boolean;
  viewerRoles: BackOfficeRole[];
  approverRoles: BackOfficeRole[];
};

export const EMPTY_DOCUMENT_TYPE_FORM: DocumentTypeFormValues = {
  documentCategory: '',
  name: '',
  documentTypeCode: '',
  description: '',
  activeRetentionYears: 5,
  archiveRetentionYears: 10,
  maxFileSizeMb: '',
  isPersonalData: false,
  approvalRequired: false,
  viewerRoles: ['compliance'],
  approverRoles: [],
};

export type DocumentTypeFormPayload = {
  documentCategory: DocumentCategory;
  name: string;
  documentTypeCode: string;
  description: string;
  activeRetentionYears: number;
  archiveRetentionYears: number;
  maxFileSizeMb: number | null;
  isPersonalData: boolean;
  approvalRequired: boolean;
  viewerRoles: BackOfficeRole[];
  approverRoles: BackOfficeRole[];
  uploaderRoles: BackOfficeRole[];
};

export type DocumentTypeSaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
