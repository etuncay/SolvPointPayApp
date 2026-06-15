import { Badge } from '@epay/ui';
import type { FinReconStatus } from '../domain/types';

function statusTone(status: FinReconStatus) {
  if (status === 'Matched' || status === 'Adjusted') return 'ok';
  if (status === 'PendingReview') return 'warn';
  return 'info';
}

export function FinReconStatusPill({ status, label }: { status: FinReconStatus; label: string }) {
  return <Badge tone={statusTone(status)}>{label}</Badge>;
}
