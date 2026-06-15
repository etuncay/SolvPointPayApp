import { useTranslation } from 'react-i18next';
import type { AppRoleStatus } from '../domain/types';

const TONE: Record<AppRoleStatus, string> = {
  Active: 'pill--ok',
  Passive: 'pill--mute',
};

export function RoleStatusPill({ status }: { status: AppRoleStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 ${TONE[status]}`}>
      {t(`rol_status_${status}`, status)}
    </span>
  );
}
