import type { TransactionStatus } from '@epay/data';
import { useTranslation } from 'react-i18next';

const MAP: Record<TransactionStatus, { cls: string; labelKey: string }> = {
  Completed: { cls: 'pill-completed', labelKey: 'tx_status_completed' },
  Pending: { cls: 'pill-pending', labelKey: 'tx_status_pending' },
  Sent: { cls: 'pill-sent', labelKey: 'tx_status_sent' },
  ErrorSend: { cls: 'pill-error', labelKey: 'tx_status_error_send' },
  ErrorReceive: { cls: 'pill-error', labelKey: 'tx_status_error_receive' },
};

export function StatusPill({ status }: { status: TransactionStatus }) {
  const { t } = useTranslation();
  const m = MAP[status] ?? MAP.Pending;
  return (
    <span className={`pill ${m.cls}`}>
      <span className="pdot" />
      {t(m.labelKey)}
    </span>
  );
}
