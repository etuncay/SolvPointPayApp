import { useTranslation } from 'react-i18next';
import type { CustomComponentProps } from '@epay/ui';

const STATUS_KEY: Record<string, string> = { active: 'ib_status_Active', inactive: 'ib_status_Inactive', blocked: 'fcd_blocked', closed: 'rl_closed' };

export function CorpStatusDisplay({ value }: CustomComponentProps) {
  const { t } = useTranslation();
  const status = String(value ?? 'inactive');
  return <span className={`st ${status}`}>{t(STATUS_KEY[status] ?? status, { defaultValue: status })}</span>;
}
