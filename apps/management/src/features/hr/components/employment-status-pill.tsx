import { useTranslation } from 'react-i18next';
import type { EmploymentStatus } from '../domain/types';

const TONE: Record<EmploymentStatus, string> = {
  Active: 'success',
  OnLeave: 'warning',
  Terminated: 'danger',
};

export function EmploymentStatusPill({ status }: { status: EmploymentStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 pill-${TONE[status]}`}>{t(`ef_status_${status}`, status)}</span>
  );
}
