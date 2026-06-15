import { useTranslation } from 'react-i18next';
import { Field, FormCard } from '@epay/ui';
import { Settings } from 'lucide-react';
import type { FraudEngineParams } from '../domain/types';

type Props = {
  params: FraudEngineParams;
  onChange: (params: FraudEngineParams) => void;
  canEdit: boolean;
};

export function EngineParamsPanel({ params, onChange, canEdit }: Props) {
  const { t } = useTranslation();

  return (
    <FormCard id="sec-params" title={t('rm_panel_params')} icon={<Settings size={13} />}>
      <div className="rm-params-info">
        <strong>{t('rm_timeout_hint')}</strong>
        <div>{t('rm_timeout_help')}</div>
      </div>

      <div className="rm-params-field">
        <Field label={t('rm_timeout_label')}>
          <input
            className="input"
            type="number"
            value={params.fraud_engine_timeout_ms}
            disabled={!canEdit}
            onChange={(e) => onChange({ fraud_engine_timeout_ms: e.target.value })}
          />
        </Field>
      </div>
    </FormCard>
  );
}
