import { useTranslation } from 'react-i18next';
import type { ParameterStatus } from '../domain/types';

const TONE: Record<ParameterStatus, string> = {
  Active: 'pill--ok',
  Passive: 'pill--mute',
};

export function ParameterStatusPill({ status }: { status: ParameterStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 ${TONE[status]}`}>
      {t(`prm_status_${status}`, status)}
    </span>
  );
}
