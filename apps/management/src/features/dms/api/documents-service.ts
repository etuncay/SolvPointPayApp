import type { BackOfficeRole } from '@epay/ui';
import type { DocumentCategory } from '@/features/document-review/domain/types';
import type { DocumentTypeDefinition } from '@/features/dms/document-types/domain/types';
import type { DmsDocumentDetail } from '../detail/domain/types';
import type {
  DocumentCreateResult,
  DocumentUploadPayload,
  DocumentsListFilters,
  DmsDocument,
  DmsDocumentListRow,
} from '../domain/types';

export type DocumentsService = {
  list(role: BackOfficeRole, filters: DocumentsListFilters): DmsDocumentListRow[];
  getById(role: BackOfficeRole, id: string): DmsDocument | null;
  getDetail(role: BackOfficeRole, id: string): DmsDocumentDetail | null;
  download(role: BackOfficeRole, id: string): { ok: true; blob: Blob; fileName: string } | { ok: false; error: string };
  getDocumentTypesByCategory(
    role: BackOfficeRole,
    category: DocumentCategory,
  ): DocumentTypeDefinition[];
  create(role: BackOfficeRole, payload: DocumentUploadPayload): Promise<DocumentCreateResult>;
};
