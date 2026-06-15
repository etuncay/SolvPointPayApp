import { useTranslation } from 'react-i18next';
import { CustomerStatusPill } from '@epay/ui';
import type { CustomerListItem } from './types';

export function StatusPill({ customer: c }: { customer: CustomerListItem }) {
  const { t } = useTranslation();
  const label = {
    active: t('ib_status_Active'),
    inactive: t('ib_status_Inactive'),
    blocked: t('fcd_blocked'),
    closed: t('rl_closed'),
  }[c.status];
  return (
    <CustomerStatusPill
      status={c.status}
      label={label}
      reason={c.blockReason ?? c.closeReason}
    />
  );
}
