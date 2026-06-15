import { useTranslation } from 'react-i18next';
import type { CaseStatus } from '../domain/types';

const TONE: Partial<Record<CaseStatus, string>> = {
  Unassigned: 'warn',
  Assigned: 'info',
  InProgress: 'info',
  Escalated: 'danger',
  ReOpened: 'warn',
  Rejected: 'mute',
};

export function CaseStatusPill({ status }: { status: CaseStatus }) {
  const { t } = useTranslation();
  const tone = TONE[status] ?? (status.startsWith('Resolved') ? 'ok' : 'default');
  return (
    <span className={`pill pill-${tone} fs-11`}>
      {t(`fc_case_status_${status}`, status)}
    </span>
  );
}
