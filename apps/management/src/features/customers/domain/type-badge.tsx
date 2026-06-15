import { useTranslation } from 'react-i18next';
import { CustomerTypeBadge } from '@epay/ui';
import type { Customer } from '@/mocks/data';

export function TypeBadge({ type }: { type: Customer['type'] }) {
  const { t } = useTranslation();
  return (
    <CustomerTypeBadge
      type={type}
      labels={{
        individual: t('cust_new_indv'),
        corporate: t('cust_new_corp'),
        prospective: t('cust_new_prosp'),
      }}
    />
  );
}
