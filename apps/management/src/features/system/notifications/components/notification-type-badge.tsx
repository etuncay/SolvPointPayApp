import { useTranslation } from 'react-i18next';
import type { NotificationType } from '../domain/types';

type Props = { type: NotificationType };

const TONE: Record<NotificationType, string> = {
  SMS: 'pill-info',
  Email: 'pill-success',
  Push: 'pill-warning',
};

export function NotificationTypeBadge({ type }: Props) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 ${TONE[type]}`}>{t(`nt_type_${type}`, type)}</span>
  );
}
