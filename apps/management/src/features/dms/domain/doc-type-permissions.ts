import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { DocumentTypeDefinition } from '@/features/dms/document-types/domain/types';
import type { DmsDocument } from './types';

/** Belge türü listeleme/görüntüleme — spec §3 */
export function canViewDocumentType(
  role: BackOfficeRole,
  type: Pick<DocumentTypeDefinition, 'viewerRoles' | 'approverRoles'>,
): boolean {
  if (role === 'management' || isAllAccessRole(role)) return true;
  return (
    type.viewerRoles.includes(role) ||
    type.approverRoles.includes(role)
  );
}

export function filterDocumentsByRole(
  role: BackOfficeRole,
  docs: DmsDocument[],
  typeById: Map<string, DocumentTypeDefinition>,
): DmsDocument[] {
  return docs.filter((d) => {
    const type = typeById.get(d.documentTypeId);
    if (!type) return role === 'management' || isAllAccessRole(role);
    return canViewDocumentType(role, type);
  });
}
