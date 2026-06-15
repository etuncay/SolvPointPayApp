import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import { agentGroupsService } from '@/features/agent-groups/api';
import {
  CURRENCY_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  type AgentFee,
  type AgentFeeInput,
  type AgentFeeUpdateInput,
  type FeeCurrency,
  type FeeTransactionType,
} from '../domain/types';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  fee: AgentFee | null;
  hasConflict: (input: AgentFeeInput) => boolean;
  onClose: () => void;
  onSaveCreate: (input: AgentFeeInput) => void;
  onSaveUpdate: (id: number, input: AgentFeeUpdateInput) => void;
};

const EMPTY: AgentFeeInput = {
  groupCode: 'STANDARD',
  transactionType: 'WalletToPerson',
  currency: 'TRY',
  lowerLimit: 0,
  fixedFee: 0,
  variableFeePct: 0,
  startDate: null,
  endDate: null,
};

export function AgentFeeFormModal({
  open,
  mode,
  fee,
  hasConflict,
  onClose,
  onSaveCreate,
  onSaveUpdate,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<AgentFeeInput>(EMPTY);

  const activeGroups = useMemo(
    () => agentGroupsService.list({ query: '', status: 'Active' }),
    [open],
  );

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && fee) {
      setDraft({
        groupCode: fee.groupCode,
        transactionType: fee.transactionType,
        currency: fee.currency,
        lowerLimit: fee.lowerLimit,
        fixedFee: fee.fixedFee,
        variableFeePct: fee.variableFeePct,
        startDate: fee.startDate,
        endDate: fee.endDate,
      });
    } else {
      setDraft({
        ...EMPTY,
        groupCode: activeGroups[0]?.groupCode ?? 'STANDARD',
      });
    }
  }, [open, mode, fee, activeGroups]);

  if (!open) return null;

  const txLabel = Object.fromEntries(
    TRANSACTION_TYPE_OPTIONS.map((tx) => [tx, t(`afee_tx_${tx}`, tx)]),
  ) as Record<FeeTransactionType, string>;

  const patch = (p: Partial<AgentFeeInput>) => setDraft((prev) => ({ ...prev, ...p }));

  const conflict = mode === 'create' && hasConflict(draft);
  const locked = mode === 'edit';

  const submit = () => {
    const payload: AgentFeeInput = {
      ...draft,
      groupCode: draft.groupCode.toUpperCase(),
      startDate: draft.startDate?.trim() || null,
      endDate: draft.endDate?.trim() || null,
    };
    if (mode === 'create') {
      onSaveCreate(payload);
    } else if (fee) {
      onSaveUpdate(fee.id, {
        fixedFee: payload.fixedFee,
        variableFeePct: payload.variableFeePct,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{mode === 'create' ? t('afee_modal_new') : t('afee_modal_edit')}</h2>
          <p>{t('afee_modal_sub')}</p>
        </div>
        <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
          <Field label={t('agg_col_code')} required>
            {locked ? (
              <input className="input mono locked" value={draft.groupCode} readOnly disabled />
            ) : (
              <select
                className="select"
                value={draft.groupCode}
                onChange={(e) => patch({ groupCode: e.target.value })}
              >
                {activeGroups.map((g) => (
                  <option key={g.groupCode} value={g.groupCode}>
                    {g.groupCode} — {g.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={t('rs_scope_transaction')} required>
              <select
                className="select"
                value={draft.transactionType}
                disabled={locked}
                onChange={(e) => patch({ transactionType: e.target.value as FeeTransactionType })}
              >
                {TRANSACTION_TYPE_OPTIONS.map((tx) => (
                  <option key={tx} value={tx}>
                    {txLabel[tx]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('cba_col_currency')} required>
              <select
                className="select"
                value={draft.currency}
                disabled={locked}
                onChange={(e) => patch({ currency: e.target.value as FeeCurrency })}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={t('cfe_col_lower_limit')} required>
            <input
              className="input mono"
              type="number"
              min={0}
              value={draft.lowerLimit}
              readOnly={locked}
              disabled={locked}
              onChange={(e) => patch({ lowerLimit: Number(e.target.value) })}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={t('cfe_col_fixed')} required>
              <input
                className="input mono"
                type="number"
                min={0}
                step={0.01}
                value={draft.fixedFee}
                onChange={(e) => patch({ fixedFee: Number(e.target.value) })}
              />
            </Field>
            <Field label={t('cfe_col_variable')} required>
              <input
                className="input mono"
                type="number"
                min={0}
                step={0.01}
                value={draft.variableFeePct}
                onChange={(e) => patch({ variableFeePct: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={t('cfe_col_start')}>
              <input
                className="input"
                type="date"
                value={draft.startDate ?? ''}
                onChange={(e) => patch({ startDate: e.target.value || null })}
              />
            </Field>
            <Field label={t('cfe_col_end')}>
              <input
                className="input"
                type="date"
                value={draft.endDate ?? ''}
                onChange={(e) => patch({ endDate: e.target.value || null })}
              />
            </Field>
          </div>
          {conflict && <p className="fs-11 t-mute">{t('afee_conflict_hint')}</p>}
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button type="button" variant="primary" onClick={submit}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
