import { useTranslation } from 'react-i18next';
import type { JobRecordStatus } from '../domain/types';

type Props = { status: JobRecordStatus };

export function JobRecordStatusPill({ status }: Props) {
  const { t } = useTranslation();
  const tone = status === 'Active' ? 'success' : 'neutral';
  return (
    <span className={`pill fs-11 pill-${tone}`}>{t(`sj_status_${status}`, status)}</span>
  );
}
