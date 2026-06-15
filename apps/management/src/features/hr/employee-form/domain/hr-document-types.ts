export const HR_DOCUMENT_TYPES = [
  { code: 'IdentityCopy', labelKey: 'ef_doc_IdentityCopy' },
  { code: 'EmploymentContract', labelKey: 'ef_doc_EmploymentContract' },
  { code: 'SgkEntry', labelKey: 'ef_doc_SgkEntry' },
  { code: 'WorkPermit', labelKey: 'ef_doc_WorkPermit' },
  { code: 'TerminationLetter', labelKey: 'ef_doc_TerminationLetter' },
] as const;

export type HrDocumentTypeCode = (typeof HR_DOCUMENT_TYPES)[number]['code'];
