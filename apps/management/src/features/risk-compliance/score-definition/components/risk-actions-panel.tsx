import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge, FormCard } from '@epay/ui';
import { FRAUD_ACTIONS_SCORE_DEF, filterConflictingActions } from '../../shared/fraud-actions';
import { RISK_LEVELS, type RiskLevel } from '../../shared/risk-classification';
import type { FraudAction } from '../../shared/fraud-actions';
import type { RiskActionSet } from '../domain/types';

const LEVEL_KEYS: Record<RiskLevel, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

const LEVEL_SEG: Record<RiskLevel, string> = {
  Low: 'low',
  Medium: 'med',
  High: 'high',
  Critical: 'critical',
};

const LEVEL_RANGE: Record<RiskLevel, string> = {
  Low: '0 – 30',
  Medium: '31 – 60',
  High: '61 – 90',
  Critical: '91 – 100',
};

const ACTION_LABEL_KEYS: Record<FraudAction, string> = {
  Allow: 'rs_action_allow',
  Block: 'rs_action_block',
  CreateCase: 'rs_action_create_case',
  Hold: 'rs_action_hold',
  Notify: 'rs_action_notify',
  AddRisk: 'frd_action_add_risk',
  NotifyCustomer: 'frd_action_notify_customer',
  ContactCustomer: 'frd_action_contact_customer',
  ForcePasswordReset: 'frd_action_force_pwd',
  AddExtraVerification: 'frd_action_extra_verify',
  TerminateSessions: 'frd_action_terminate_sessions',
};

export function RiskActionsPanel({
  actionSets,
  onChange,
  readOnly,
}: {
  actionSets: RiskActionSet[];
  onChange: (level: RiskLevel, actions: FraudAction[]) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <FormCard title={t('rs_actions_panel')} icon={<Shield size={13} />}>
      <div className="rs-actions-matrix">
        {RISK_LEVELS.map((level) => {
          const set = actionSets.find((a) => a.riskLevel === level);
          const selected = set?.actions ?? [];

          const toggle = (action: FraudAction) => {
            if (readOnly) return;
            const has = selected.includes(action);
            const next = has ? selected.filter((a) => a !== action) : [...selected, action];
            onChange(level, filterConflictingActions(next));
          };

          return (
            <div key={level} className="rs-actions-row">
              <div className="rs-actions-level">
                <span className={`risk-seg ${LEVEL_SEG[level]}`}>{t(LEVEL_KEYS[level])}</span>
                <span className="rs-actions-range">{LEVEL_RANGE[level]}</span>
                {selected.length > 0 && (
                  <div className="rs-actions-summary">
                    {selected.map((action) => (
                      <Badge key={action} tone="default">
                        {t(ACTION_LABEL_KEYS[action])}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="rs-action-grid" role="group" aria-label={t(LEVEL_KEYS[level])}>
                {FRAUD_ACTIONS_SCORE_DEF.map((action) => {
                  const isOn = selected.includes(action);
                  return (
                    <button
                      key={action}
                      type="button"
                      className={`rs-action-chip${isOn ? ' is-on' : ''}`}
                      disabled={readOnly}
                      aria-pressed={isOn}
                      onClick={() => toggle(action)}
                    >
                      {t(ACTION_LABEL_KEYS[action])}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </FormCard>
  );
}
