import { useTranslation } from 'react-i18next';
import type { CustomComponentProps } from '@epay/ui';

export function IndvRiskDisplay({ value }: CustomComponentProps) {
  const { t } = useTranslation();
  const obj = value as { score?: number; segment?: string } | undefined;
  const score = obj?.score ?? 0;
  const segment = obj?.segment ?? 'low';
  const levelLabel =
    segment === 'low' ? t('rs_level_low') : segment === 'med' ? t('rs_level_medium') : t('scf_level_High');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input className="input mono locked" value={`${score} / 100`} readOnly style={{ flex: 1 }} />
      <span className={`risk-seg ${segment}`}>{levelLabel}</span>
    </div>
  );
}
