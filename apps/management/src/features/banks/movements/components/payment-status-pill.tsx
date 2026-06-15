import { Badge } from '@epay/ui';
import type { PaymentStatus } from '../domain/types';

function statusTone(status: PaymentStatus) {
  if (status === 'Completed') return 'ok';
  if (status === 'Pending') return 'warn';
  if (status === 'Failed' || status === 'Returned') return 'danger';
  return 'info';
}

export function PaymentStatusPill({ status, label }: { status: PaymentStatus; label: string }) {
  return <Badge tone={statusTone(status)}>{label}</Badge>;
}
