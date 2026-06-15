import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Field, FormCard, FormGrid } from '@epay/ui';

type Props = {
  riskScore: number;
  riskSegment: string;
  entityNo: string;
};

export function RiskScoresPanel({ riskScore, riskSegment, entityNo }: Props) {
  const { t } = useTranslation();

  return (
    <div style={{ marginTop: 16 }}>
    <FormCard title={t('kyc_panel_risk')} icon={<Shield size={13} />}>
      <FormGrid>
        <Field label={t('scr_col_risk')} locked>
          <input className="input mono locked" readOnly value={String(riskScore)} />
        </Field>
        <Field label={t('kyc_risk_segment')} locked>
          <input className="input locked" readOnly value={riskSegment} />
        </Field>
        <Field label={t('kyc_risk_link')} col={4}>
          <Link
            to={`/risk/scores?source=Customer&id=${encodeURIComponent(entityNo)}`}
            className="fs-12 link"
          >
            {t('kyc_risk_deep_link')}
          </Link>
        </Field>
      </FormGrid>
    </FormCard>
    </div>
  );
}
