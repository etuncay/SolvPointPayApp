import { useTranslation } from 'react-i18next';
import { Field, FormCard, FormGrid } from '@epay/ui';
import type { FraudScope, FraudRuleStatus } from '../../domain/types';
import type { RiskLevel } from '../../../shared/risk-classification';
import type { FraudRuleInput } from '../domain/types';
import { FraudDslEditor } from './fraud-dsl-editor';
import type { DslValidationResult } from '../../../shared/rule-dsl/parser';

const PRIORITIES: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const SCOPES: FraudScope[] = ['Onboarding', 'Remittance'];
const STATUSES: FraudRuleStatus[] = ['Active', 'Passive'];

const PRIORITY_KEYS: Record<RiskLevel, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

export function RulePanel({
  input,
  onChange,
  onValidateDsl,
  readOnly,
}: {
  input: FraudRuleInput;
  onChange: (patch: Partial<FraudRuleInput>) => void;
  onValidateDsl: (dsl: string) => DslValidationResult;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <FormCard id="sec-rule" title={t('col_rule')}>
      <FormGrid>
        <Field label={t('fr_col_title')} required>
          <input
            className="input"
            value={input.title}
            disabled={readOnly}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </Field>
        <Field label={t('fr_col_scope')} required>
          <select
            className="input"
            value={input.scope}
            disabled={readOnly}
            onChange={(e) => {
              onChange({ scope: e.target.value as FraudScope, dslValidatedAt: null });
            }}
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {t(s === 'Onboarding' ? 'fr_scope_onboarding' : 'fr_scope_remittance')}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('rpt_col_status')}>
          <select
            className="input"
            value={input.status}
            disabled={readOnly}
            onChange={(e) => onChange({ status: e.target.value as FraudRuleStatus })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(s === 'Active' ? 'ib_status_Active' : 'rs_status_passive')}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('col_priority')}>
          <select
            className="input"
            value={input.priority}
            disabled={readOnly}
            onChange={(e) => onChange({ priority: e.target.value as RiskLevel })}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(PRIORITY_KEYS[p])}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('frd_regulation')} col={4}>
          <input
            className="input"
            value={input.regulationReference}
            disabled={readOnly}
            onChange={(e) => onChange({ regulationReference: e.target.value })}
          />
        </Field>
        <Field label={t('rpt_col_desc')} col={4}>
          <textarea
            className="input"
            rows={2}
            value={input.description}
            disabled={readOnly}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </Field>
        <Field label={t('frd_condition')} required col={4}>
          <FraudDslEditor
            value={input.conditionDsl}
            scope={input.scope}
            readOnly={readOnly}
            validatedAt={input.dslValidatedAt}
            onChange={(conditionDsl) => onChange({ conditionDsl })}
            onValidate={onValidateDsl}
            onValidated={(dslValidatedAt) => onChange({ dslValidatedAt })}
          />
        </Field>
      </FormGrid>
    </FormCard>
  );
}
