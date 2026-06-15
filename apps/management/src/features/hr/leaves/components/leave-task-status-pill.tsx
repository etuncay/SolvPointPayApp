import { useTranslation } from 'react-i18next';
import type { TaskStatus } from '../domain/types';

const TONE: Record<TaskStatus, string> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Canceled: 'muted',
};

export function LeaveTaskStatusPill({ status }: { status: TaskStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 pill-${TONE[status]}`}>{t(`lv_status_${status}`)}</span>
  );
}
