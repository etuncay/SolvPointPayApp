import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import type { RiskScoreScope } from '../../shared/rule-dsl/variables';
import { SCOPE_VARIABLES } from '../../shared/rule-dsl/variables';
import type { DslValidationResult } from '../../shared/rule-dsl/parser';

export function DslEditor({
  value,
  onChange,
  scope,
  onValidate,
  validatedAt,
  onValidated,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  scope: RiskScoreScope;
  onValidate: (dsl: string) => DslValidationResult;
  validatedAt: string | null;
  onValidated: (at: string | null) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  const [lastResult, setLastResult] = useState<DslValidationResult | null>(null);

  const runValidate = () => {
    const result = onValidate(value);
    setLastResult(result);
    onValidated(result.ok ? new Date().toISOString() : null);
  };

  const vars = SCOPE_VARIABLES[scope].join(', ');

  return (
    <div>
      <textarea
        className="input mono"
        rows={4}
        value={value}
        disabled={readOnly}
        onChange={(e) => {
          onChange(e.target.value);
          setLastResult(null);
          onValidated(null);
        }}
        placeholder={t('rs_dsl_ph')}
      />
      <p className="fs-11 t-mute" style={{ marginTop: 6 }}>
        {t('rs_dsl_vars')}: {vars}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <Button type="button" variant="ghost" size="sm" onClick={runValidate} disabled={readOnly}>
          {t('rs_validate_btn')}
        </Button>
        {lastResult?.ok && (
          <span className="fs-12" style={{ color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={14} /> {t('rs_dsl_ok')}
          </span>
        )}
        {lastResult && !lastResult.ok && (
          <span className="fs-12" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <XCircle size={14} /> {lastResult.errors.map((e) => t(e, e)).join(', ')}
          </span>
        )}
        {validatedAt && !lastResult && (
          <span className="fs-11 t-mute">{t('rs_validated_prev')}</span>
        )}
      </div>
    </div>
  );
}
