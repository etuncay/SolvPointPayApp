import type { DocumentTypeDefinition } from '@/features/dms/document-types/domain/types';
import type { DocumentRelation, DmsDocument } from '@/features/dms/domain/types';
import type { BackOfficeRole } from '@epay/ui';
import { canDownloadFile } from './detail-permissions';
import { mapRelationsToViews } from './relation-links';
import type { DmsDocumentDetail } from './types';

function mimeToFileTypeLabel(mime: string): string {
  if (!mime) return '—';
  if (mime === 'application/pdf') return 'PDF';
  if (mime.startsWith('image/')) return mime.replace('image/', '').toUpperCase();
  if (mime.includes('wordprocessingml')) return 'DOCX';
  if (mime.includes('spreadsheetml')) return 'XLSX';
  return mime;
}

/** Store + type + relations → detay DTO */
export function buildDocumentDetail(
  doc: DmsDocument,
  docType: DocumentTypeDefinition | undefined,
  relations: DocumentRelation[],
  role: BackOfficeRole,
): DmsDocumentDetail {
  return {
    id: doc.id,
    documentCategory: doc.documentCategory,
    documentTypeId: doc.documentTypeId,
    documentTypeName: doc.documentTypeName,
    documentStatus: doc.documentStatus,
    approvalStatus: doc.approvalStatus,
    approvalRequired: docType?.approvalRequired ?? false,
    isPersonalData: docType?.isPersonalData ?? false,
    activeRetentionYears: docType?.activeRetentionYears ?? 0,
    archiveRetentionYears: docType?.archiveRetentionYears ?? 0,
    createdAt: doc.createdAt,
    createdBy: doc.createdBy,
    approvedAt: doc.approvedAt,
    approvedBy: doc.approvedBy,
    validFrom: doc.validFrom,
    validUntil: doc.validUntil,
    fileName: doc.fileName,
    fileHash: doc.fileHash,
    fileType: mimeToFileTypeLabel(doc.mimeType),
    fileSizeBytes: doc.fileSizeBytes,
    canDownload: canDownloadFile(role, doc, docType),
    relations: mapRelationsToViews(relations),
  };
}
