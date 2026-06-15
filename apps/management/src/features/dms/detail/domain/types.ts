import type {
  ApprovalStatus,
  DocumentCategory,
  DocumentRelationType,
  DocumentStatus,
} from '@/features/dms/domain/types';

export type DmsDocumentRelationView = {
  relationType: DocumentRelationType;
  relatedId: string;
  href: string | null;
};

export type DmsDocumentDetail = {
  id: string;
  documentCategory: DocumentCategory;
  documentTypeId: string;
  documentTypeName: string;
  documentStatus: DocumentStatus;
  approvalStatus: ApprovalStatus;
  approvalRequired: boolean;
  isPersonalData: boolean;
  activeRetentionYears: number;
  archiveRetentionYears: number;
  createdAt: string;
  createdBy: string;
  approvedAt: string | null;
  approvedBy: string | null;
  validFrom: string | null;
  validUntil: string | null;
  fileName: string;
  fileHash: string | null;
  fileType: string;
  fileSizeBytes: number;
  canDownload: boolean;
  relations: DmsDocumentRelationView[];
};

export type DocumentAccessLogEntry = {
  id: number;
  action: 'view' | 'download';
  documentId: string;
  userId: string;
  at: string;
};
