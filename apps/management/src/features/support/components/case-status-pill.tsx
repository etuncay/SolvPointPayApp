import { useTranslation } from 'react-i18next';
import { CASE_STATUS_TONE } from '../domain/case-status-ui';
import type { CaseStatus } from '../domain/types';

type Props = { status: CaseStatus };

export function CaseStatusPill({ status }: Props) {
  const { t } = useTranslation();
  const tone = CASE_STATUS_TONE[status] ?? 'muted';
  return (
    <span className={`badge ${tone}`}>{t(`case_status_${status}`, status)}</span>
  );
}
