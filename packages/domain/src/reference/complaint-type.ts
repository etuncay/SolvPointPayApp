/** Veri Sözlüğü §8.3 — ReconciliationDiscrepancy yalnızca sistem üretimi olduğundan UI kümesi dışı. */
export const COMPLAINT_TYPES = [
  'Complaint',
  'Request',
  'Suggestion',
  'Information',
  'Objection',
  'Other',
] as const;

export type ComplaintType = (typeof COMPLAINT_TYPES)[number];

export function complaintTypeI18nKey(code: ComplaintType | string): string {
  return `complaint_type_${code}`;
}
