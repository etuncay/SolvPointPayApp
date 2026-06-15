import { useTranslation } from 'react-i18next';
import { CustomerRiskCell } from '@epay/ui';
import type { Customer } from '@/mocks/data';

export function RiskCell({ customer: c }: { customer: Customer }) {
  const { t } = useTranslation();
  const segmentLabel =
    c.riskSeg === 'low'
      ? t('rs_level_low')
      : c.riskSeg === 'med'
        ? t('rs_level_medium')
        : c.riskSeg === 'high'
          ? t('scf_level_High')
          : t('scf_level_Critical');
  return <CustomerRiskCell score={c.riskScore} segment={c.riskSeg} segmentLabel={segmentLabel} />;
}
