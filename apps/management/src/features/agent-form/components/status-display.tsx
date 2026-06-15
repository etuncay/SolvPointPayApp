import { useTranslation } from 'react-i18next';
import type { CustomComponentProps } from '@epay/ui';

const STATUS_LABEL: Record<string, string> = {
  active: 'ib_status_Active',
  inactive: 'ib_status_Inactive',
  blocked: 'fcd_blocked',
  closed: 'rl_closed',
};

export function StatusDisplay({ value }: CustomComponentProps) {
  const { t } = useTranslation();
  const status = String(value ?? 'inactive');
  const label = t(STATUS_LABEL[status] ?? status, { defaultValue: status });
  return <span className={`st ${status}`}>{label}</span>;
}
