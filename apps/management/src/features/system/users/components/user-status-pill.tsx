import { useTranslation } from 'react-i18next';
import type { AppUserStatus } from '@/mocks/app-users';

const TONE: Record<AppUserStatus, string> = {
  Active: 'pill--ok',
  Inactive: 'pill--mute',
};

export function UserStatusPill({ status }: { status: AppUserStatus }) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 ${TONE[status]}`}>
      {t(`usr_status_${status}`, status)}
    </span>
  );
}
