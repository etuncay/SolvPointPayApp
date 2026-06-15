import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { DocumentTypeDefinition } from '@/features/dms/document-types/domain/types';
import { canViewDocumentType } from '@/features/dms/domain/doc-type-permissions';
import { isDownloadableDocumentStatus } from '@/features/dms/domain/document-status-ui';
import type { DmsDocument } from '@/features/dms/domain/types';

/** Detay görüntüleme — spec §3 */
export function canViewDetail(
  role: BackOfficeRole,
  docType: Pick<DocumentTypeDefinition, 'viewerRoles' | 'approverRoles'> | undefined,
): boolean {
  if (!docType) return role === 'management' || isAllAccessRole(role);
  return canViewDocumentType(role, docType);
}

/** İndirme — Active/Archived + view yetkisi */
export function canDownloadFile(
  role: BackOfficeRole,
  doc: Pick<DmsDocument, 'documentStatus' | 'documentTypeId'>,
  docType: Pick<DocumentTypeDefinition, 'viewerRoles' | 'approverRoles'> | undefined,
): boolean {
  if (!canViewDetail(role, docType)) return false;
  return isDownloadableDocumentStatus(doc.documentStatus);
}
