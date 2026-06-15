/** Veri Sözlüğü §8.3 — Agent UI (ReconciliationDiscrepancy yalnızca sistem üretimi). */
export type AgentComplaintType =
  | 'Complaint'
  | 'Request'
  | 'Suggestion'
  | 'Information'
  | 'Objection'
  | 'Other';

export const AGENT_COMPLAINT_TYPES: AgentComplaintType[] = [
  'Complaint',
  'Request',
  'Suggestion',
  'Information',
  'Objection',
  'Other',
];

export function complaintTypeI18nKey(type: AgentComplaintType): string {
  return `complaint_type_${type}`;
}
