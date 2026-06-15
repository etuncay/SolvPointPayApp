import type { BackOfficeRole } from '@epay/ui';
import type { DocumentCategory } from '@/features/document-review/domain/types';

/** Kategori → görüntüleme/onay rolleri — spec §13, 9.4 */
export const CATEGORY_ROLE_MATRIX: Record<
  DocumentCategory,
  { viewRoles: BackOfficeRole[]; approveRoles: BackOfficeRole[] }
> = {
  Identity: { viewRoles: ['compliance'], approveRoles: ['compliance'] },
  ProofOfAddress: { viewRoles: ['compliance', 'ops'], approveRoles: ['compliance', 'ops'] },
  ProofOfFunds: { viewRoles: ['compliance', 'ops'], approveRoles: ['compliance'] },
  LegalEntity: { viewRoles: ['compliance'], approveRoles: ['compliance'] },
  ProofOfTransaction: { viewRoles: ['compliance', 'ops'], approveRoles: ['compliance', 'ops'] },
  Agreement: { viewRoles: ['compliance', 'ops'], approveRoles: ['compliance', 'ops'] },
  EmployeeHR: { viewRoles: ['compliance'], approveRoles: ['compliance'] },
};

export function categoryViewRoles(category: DocumentCategory): BackOfficeRole[] {
  return CATEGORY_ROLE_MATRIX[category]?.viewRoles ?? ['compliance'];
}

export function categoryApproveRoles(category: DocumentCategory): BackOfficeRole[] {
  return CATEGORY_ROLE_MATRIX[category]?.approveRoles ?? ['compliance'];
}
