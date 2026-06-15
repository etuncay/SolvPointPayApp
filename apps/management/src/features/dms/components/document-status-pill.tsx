import { useTranslation } from 'react-i18next';
import type { DocumentStatus } from '../domain/types';

const TONE: Record<DocumentStatus, string> = {
  Active: 'success',
  Archived: 'info',
  Inactive: 'muted',
  Rejected: 'danger',
  Expired: 'warning',
};

type Props = { status: DocumentStatus };

export function DocumentStatusPill({ status }: Props) {
  const { t } = useTranslation();
  const tone = TONE[status] ?? 'muted';
  return (
    <span className={`badge ${tone}`}>{t(`dms_status_${status}`, status)}</span>
  );
}
