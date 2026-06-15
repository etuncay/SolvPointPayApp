import { useTranslation } from 'react-i18next';
import type { IntegrationStatus } from './integration-types';

type Props = { status: IntegrationStatus };

function tone(status: IntegrationStatus): string {
  if (status === 'Completed') return 'ok';
  if (status === 'OnHold') return 'warn';
  if (status === 'Canceled') return 'muted';
  if (status.startsWith('Error')) return 'danger';
  if (status === 'Retrying' || status === 'Sending' || status === 'Sent') return 'info';
  return 'inactive';
}

export function IntegrationStatusBadge({ status }: Props) {
  const { t } = useTranslation();
  return <span className={`st ${tone(status)}`}>{t(`int_status_${status}`, status)}</span>;
}
