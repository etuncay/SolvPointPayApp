import { useTranslation } from 'react-i18next';
import type { TransactionStatus } from '@/features/transaction-confirmation/domain/transaction-types';

const TONE: Record<string, string> = {
  Completed: 'ok',
  Sent: 'info',
  Pending: 'warn',
  OnHold: 'danger',
  Retrying: 'warn',
  Failed: 'danger',
  Canceled: 'muted',
  ErrorSend: 'danger',
  ErrorReceive: 'danger',
  Unblocked: 'muted',
};

/** Durum rozeti — referans ts_* tonları. */
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { t } = useTranslation();
  const tone = TONE[status] ?? 'muted';
  return <span className={`badge ${tone}`}>{t(`tx_status_${status}`, status)}</span>;
}
