import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { DocumentTypeDefinition } from '@/features/dms/document-types/domain/types';

/** Belge türü yükleme yetkisi — spec §13 */
export function canUploadDocumentType(
  role: BackOfficeRole,
  type: Pick<DocumentTypeDefinition, 'uploaderRoles'>,
): boolean {
  if (role === 'management' || isAllAccessRole(role)) return true;
  return type.uploaderRoles.includes(role);
}
