import type {
  ApprovalStatus,
  DocumentCategory,
  DocumentStatus,
} from '@/features/document-review/domain/types';

export type { DocumentCategory, DocumentStatus, ApprovalStatus };

export type DocumentRelationType =
  | 'Customer'
  | 'Agent'
  | 'Transaction'
  | 'Complaint'
  | 'Employee';

export type DocumentRelation = {
  documentId: string;
  relationType: DocumentRelationType;
  relatedId: string;
};

export type DmsDocument = {
  id: string;
  documentCategory: DocumentCategory;
  documentTypeId: string;
  documentTypeName: string;
  documentStatus: DocumentStatus;
  approvalStatus: ApprovalStatus;
  fileName: string;
  fileHash: string | null;
  storageFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  recordStatus: 0 | 1;
};

export type DmsDocumentListRow = Pick<
  DmsDocument,
  | 'id'
  | 'documentCategory'
  | 'documentTypeName'
  | 'documentStatus'
  | 'createdAt'
  | 'createdBy'
  | 'approvedBy'
>;

export type DocumentsListFilters = {
  query: string;
  category: string;
  documentTypeId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  relationType: string;
  relatedId: string;
};

export const DEFAULT_DOCUMENTS_FILTERS: DocumentsListFilters = {
  query: '',
  category: 'any',
  documentTypeId: 'any',
  status: 'any',
  dateFrom: '',
  dateTo: '',
  relationType: '',
  relatedId: '',
};

export type DocumentRelationInput = {
  relationType: DocumentRelationType;
  relatedId: string;
};

export type DocumentUploadPayload = {
  category: DocumentCategory;
  documentTypeId: string;
  validFrom?: string;
  validUntil?: string;
  file: File;
  relations: DocumentRelationInput[];
};

export type DocumentCreateResult =
  | {
      ok: true;
      id: string;
      fileName: string;
      fileHash: string;
      documentStatus: DocumentStatus;
      approvalStatus: ApprovalStatus;
    }
  | { ok: false; error: string };

export type DocumentUploadAuditEntry = {
  id: number;
  action: 'upload';
  documentId: string;
  fileHash: string;
  relationIds: string[];
  uploadedBy: string;
  at: string;
};
