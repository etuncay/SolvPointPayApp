import { Badge } from '@epay/ui';
import type { ReconciliationStatus } from '../domain/types';

function statusTone(status: ReconciliationStatus) {
  if (status === 'Matched' || status === 'Adjusted') return 'ok';
  if (status === 'PendingReview') return 'warn';
  if (status === 'Unmatched') return 'danger';
  return 'info';
}

export function ReconciliationStatusPill({
  status,
  label,
}: {
  status: ReconciliationStatus;
  label: string;
}) {
  return <Badge tone={statusTone(status)}>{label}</Badge>;
}
