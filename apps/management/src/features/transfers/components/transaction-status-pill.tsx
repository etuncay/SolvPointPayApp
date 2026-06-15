import { Badge } from '@epay/ui';
import type { TransactionStatus } from '../domain/types';

function statusTone(status: TransactionStatus) {
  if (status === 'Completed') return 'ok';
  if (status === 'Pending' || status === 'Sent' || status === 'Retrying') return 'warn';
  if (status === 'OnHold' || status === 'ErrorSend' || status === 'ErrorReceive') return 'danger';
  if (status === 'ErrorComplete' || status === 'Canceled') return 'danger';
  return 'info';
}

export function TransactionStatusPill({ status, label }: { status: TransactionStatus; label: string }) {
  return <Badge tone={statusTone(status)}>{label}</Badge>;
}
