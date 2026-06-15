import type { EmployeeDetail, EmploymentStatus } from './types';

const BASE_REQUIRED = ['IdentityCopy', 'EmploymentContract', 'SgkEntry'] as const;

export function getRequiredHrDocumentTypes(
  nationality: string,
  _employmentStatus: EmploymentStatus,
): string[] {
  const types: string[] = [...BASE_REQUIRED];
  if (nationality !== 'TUR') types.push('WorkPermit');
  return types;
}

export function getMissingHrDocuments(detail: Pick<EmployeeDetail, 'nationality' | 'employmentStatus' | 'documents'>): string[] {
  const required = getRequiredHrDocumentTypes(detail.nationality, detail.employmentStatus);
  const uploaded = new Set(detail.documents.map((d) => d.type));
  return required.filter((t) => !uploaded.has(t));
}
