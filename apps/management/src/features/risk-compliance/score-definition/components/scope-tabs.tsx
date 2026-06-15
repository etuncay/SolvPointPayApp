import { useTranslation } from 'react-i18next';
import type { RiskScoreScope } from '../../shared/rule-dsl/variables';
import { RISK_SCORE_SCOPES } from '../../shared/rule-dsl/variables';

const SCOPE_KEYS: Record<RiskScoreScope, string> = {
  Customer: 'scf_entity_customer',
  Agent: 'rpt_col_agent',
  Transaction: 'rs_scope_transaction',
};

export function ScopeTabs({
  scope,
  onChange,
}: {
  scope: RiskScoreScope;
  onChange: (s: RiskScoreScope) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="cat-tabs" style={{ marginBottom: 16 }}>
      {RISK_SCORE_SCOPES.map((s) => (
        <button
          key={s}
          type="button"
          className={`cat-tab${scope === s ? ' on' : ''}`}
          onClick={() => onChange(s)}
        >
          {t(SCOPE_KEYS[s])}
        </button>
      ))}
    </div>
  );
}
