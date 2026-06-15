import type { ComplaintType, SupportCase } from '../../domain/types';
import type { ComplaintTypeCountRow } from './types';

const ALL_TYPES: ComplaintType[] = [
  'General',
  'Technical',
  'Billing',
  'Reconciliation',
  'ReconciliationDiscrepancy',
];

export function aggregateByComplaintType(cases: SupportCase[]): ComplaintTypeCountRow[] {
  const counts = new Map<ComplaintType, number>();
  for (const t of ALL_TYPES) counts.set(t, 0);
  for (const c of cases) {
    counts.set(c.complaintType, (counts.get(c.complaintType) ?? 0) + 1);
  }
  return ALL_TYPES.map((complaintType) => ({
    complaintType,
    count: counts.get(complaintType) ?? 0,
  })).filter((r) => r.count > 0);
}
