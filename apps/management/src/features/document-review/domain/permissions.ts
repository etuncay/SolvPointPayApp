import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import { categoryApproveRoles, categoryViewRoles } from '@/mocks/document-type-roles';
import type { DocumentCategory, DocumentReviewPermissions } from './types';

/** Spec §3 — belge inceleme rol matrisi */
export function getDocumentReviewPermissions(role: BackOfficeRole): DocumentReviewPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, view: true, approve: true, reject: true, requestAdditional: true };
  }
  switch (role) {
    case 'ops':
    case 'compliance':
      return {
        list: true,
        view: true,
        approve: true,
        reject: true,
        requestAdditional: true,
      };
    default:
      return {
        list: false,
        view: false,
        approve: false,
        reject: false,
        requestAdditional: false,
      };
  }
}

export function canViewCategory(role: BackOfficeRole, category: DocumentCategory): boolean {
  return categoryViewRoles(category).includes(role) || isAllAccessRole(role);
}

export function canApproveCategory(role: BackOfficeRole, category: DocumentCategory): boolean {
  return categoryApproveRoles(category).includes(role) || isAllAccessRole(role);
}
