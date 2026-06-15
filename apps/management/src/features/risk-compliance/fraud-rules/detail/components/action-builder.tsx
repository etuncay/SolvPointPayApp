import { useTranslation } from 'react-i18next';
import { Field, FormCard, FormGrid } from '@epay/ui';
import { ALL_FRAUD_ACTIONS, type FraudAction } from '../../../shared/fraud-actions';
import type { BlockParams, FraudRuleAction, FraudRuleInput } from '../domain/types';
import {
  isBlockTransactionTarget,
  toggleActionType,
} from '../domain/action-validation';
import type { RiskLevel } from '../../../shared/risk-classification';

const LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

const ACTION_LABEL_KEYS: Record<FraudAction, string> = {
  Allow: 'frd_action_allow',
  Block: 'frd_action_block',
  CreateCase: 'frd_action_create_case',
  Hold: 'frd_action_hold',
  Notify: 'frd_action_notify',
  AddRisk: 'frd_action_add_risk',
  NotifyCustomer: 'frd_action_notify_customer',
  ContactCustomer: 'frd_action_contact_customer',
  ForcePasswordReset: 'frd_action_force_pwd',
  AddExtraVerification: 'frd_action_extra_verify',
  TerminateSessions: 'frd_action_terminate_sessions',
};

export function ActionBuilder({
  input,
  onChange,
  readOnly,
  actionError,
}: {
  input: FraudRuleInput;
  onChange: (patch: Partial<FraudRuleInput>) => void;
  readOnly?: boolean;
  actionError?: string | null;
}) {
  const { t } = useTranslation();
  const selected = new Set(input.actionDetails.map((a) => a.type));

  const setActions = (actionDetails: FraudRuleAction[]) => onChange({ actionDetails });

  const updateActionParams = (type: FraudAction, params: FraudRuleAction['params']) => {
    setActions(
      input.actionDetails.map((a) => (a.type === type ? { ...a, params } : a)),
    );
  };

  const blockAction = input.actionDetails.find((a) => a.type === 'Block');
  const addRiskAction = input.actionDetails.find((a) => a.type === 'AddRisk');
  const caseAction = input.actionDetails.find((a) => a.type === 'CreateCase');
  const blockParams = (blockAction?.params ?? { target: 'Transaction' }) as BlockParams;
  const hideChannelAmount = blockAction && isBlockTransactionTarget(blockAction);

  return (
    <FormCard id="sec-actions" title={t('rs_col_actions')}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        {ALL_FRAUD_ACTIONS.map((type) => (
          <label key={type} className="fs-13" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={selected.has(type)}
              disabled={readOnly}
              onChange={(e) =>
                setActions(toggleActionType(input.actionDetails, type, e.target.checked))
              }
            />
            {t(ACTION_LABEL_KEYS[type])}
          </label>
        ))}
      </div>
      {actionError && (
        <p className="fs-12" style={{ color: 'var(--danger)', marginBottom: 12 }}>
          {t(actionError, actionError)}
        </p>
      )}

      {blockAction && (
        <div style={{ marginBottom: 16 }}>
        <FormGrid>
          <Field label={t('frd_block_target')}>
            <select
              className="input"
              value={blockParams.target}
              disabled={readOnly}
              onChange={(e) =>
                updateActionParams('Block', {
                  ...blockParams,
                  target: e.target.value as BlockParams['target'],
                })
              }
            >
              <option value="Transaction">{t('rs_scope_transaction')}</option>
              <option value="Wallet">{t('frd_block_wallet')}</option>
              <option value="Customer">{t('scf_entity_customer')}</option>
            </select>
          </Field>
          {!hideChannelAmount && (
            <>
              <Field label={t('frd_block_duration')}>
                <input
                  className="input mono"
                  type="number"
                  min={0}
                  value={blockParams.durationMinutes ?? ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateActionParams('Block', {
                      ...blockParams,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label={t('frd_block_amount')}>
                <input
                  className="input mono"
                  type="number"
                  min={0}
                  value={blockParams.amount ?? ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateActionParams('Block', {
                      ...blockParams,
                      amount: Number(e.target.value) || undefined,
                    })
                  }
                />
              </Field>
              <Field label={t('rpt_col_channel')}>
                <input
                  className="input"
                  value={blockParams.channel ?? ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateActionParams('Block', { ...blockParams, channel: e.target.value })
                  }
                />
              </Field>
            </>
          )}
        </FormGrid>
        </div>
      )}

      {addRiskAction && (
        <div style={{ marginBottom: 16 }}>
        <FormGrid>
          <Field label={t('frd_addrisk_target')}>
            <select
              className="input"
              value={(addRiskAction.params as { target?: string })?.target ?? 'Customer'}
              disabled={readOnly}
              onChange={(e) =>
                updateActionParams('AddRisk', {
                  ...(addRiskAction.params as object),
                  target: e.target.value,
                })
              }
            >
              <option value="Customer">{t('scf_entity_customer')}</option>
              <option value="Agent">{t('rpt_col_agent')}</option>
            </select>
          </Field>
          <Field label={t('frd_addrisk_days')}>
            <input
              className="input mono"
              type="number"
              min={1}
              value={(addRiskAction.params as { durationDays?: number })?.durationDays ?? 30}
              disabled={readOnly}
              onChange={(e) =>
                updateActionParams('AddRisk', {
                  ...(addRiskAction.params as object),
                  durationDays: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label={t('frd_addrisk_points')}>
            <input
              className="input mono"
              type="number"
              min={0}
              max={100}
              value={(addRiskAction.params as { riskPoints?: number })?.riskPoints ?? 10}
              disabled={readOnly}
              onChange={(e) =>
                updateActionParams('AddRisk', {
                  ...(addRiskAction.params as object),
                  riskPoints: Number(e.target.value),
                })
              }
            />
          </Field>
        </FormGrid>
        </div>
      )}

      {caseAction && (
        <FormGrid>
          <Field label={t('frd_case_severity')}>
            <select
              className="input"
              value={(caseAction.params as { severity?: RiskLevel })?.severity ?? 'Medium'}
              disabled={readOnly}
              onChange={(e) =>
                updateActionParams('CreateCase', { severity: e.target.value as RiskLevel })
              }
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {t(`rs_level_${l.toLowerCase()}` as 'rs_level_low')}
                </option>
              ))}
            </select>
          </Field>
        </FormGrid>
      )}
    </FormCard>
  );
}
