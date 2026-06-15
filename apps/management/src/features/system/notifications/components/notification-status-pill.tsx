import { useTranslation } from 'react-i18next';
import type { NotificationStatus } from '../domain/types';

type Props = { status: NotificationStatus };

const TONE: Record<NotificationStatus, string> = {
  Pending: 'pill-warning',
  Sent: 'pill-info',
  Delivered: 'pill-success',
  Failed: 'pill-danger',
};

export function NotificationStatusPill({ status }: Props) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 ${TONE[status]}`}>{t(`nt_status_${status}`, status)}</span>
  );
}
