import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type {
  Campaign,
  CampaignInput,
  CampaignUpdateInput,
  FeeCurrency,
  FeeTransactionType,
} from '../domain/types';
import {
  CURRENCY_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from '../domain/types';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  campaign: Campaign | null;
  onClose: () => void;
  onSaveCreate: (input: CampaignInput) => boolean;
  onSaveUpdate: (id: number, input: CampaignUpdateInput) => boolean;
};

const EMPTY: CampaignInput = {
  campaignCode: '',
  name: '',
  description: '',
  fixedFeeGainRate: 0,
  commissionGainRate: 0,
  transactionType: 'WalletToPerson',
  currency: 'TRY',
  startDate: null,
  endDate: null,
  minTxAmount: null,
  maxGainPerTx: null,
  maxGainTotal: null,
  maxUsageCount: null,
};

export function CampaignFormModal({
  open,
  mode,
  campaign,
  onClose,
  onSaveCreate,
  onSaveUpdate,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CampaignInput>(EMPTY);

  const txLabel = useMemo(
    () =>
      Object.fromEntries(
        TRANSACTION_TYPE_OPTIONS.map((tx) => [tx, t(`ccm_tx_${tx}`, tx)]),
      ) as Record<FeeTransactionType, string>,
    [t],
  );

  const countryLabel = useMemo(
    () =>
      Object.fromEntries(
        CURRENCY_OPTIONS.map((c) => [c, c]),
      ) as Record<FeeCurrency, string>,
    [],
  );

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && campaign) {
      setDraft({
        campaignCode: campaign.campaignCode,
        name: campaign.name,
        description: campaign.description,
        fixedFeeGainRate: campaign.fixedFeeGainRate,
        commissionGainRate: campaign.commissionGainRate,
        transactionType: campaign.transactionType,
        currency: campaign.currency,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        minTxAmount: campaign.minTxAmount,
        maxGainPerTx: campaign.maxGainPerTx,
        maxGainTotal: campaign.maxGainTotal,
        maxUsageCount: campaign.maxUsageCount,
      });
      return;
    }
    setDraft(EMPTY);
  }, [open, mode, campaign]);

  if (!open) return null;

  const patch = (p: Partial<CampaignInput>) => setDraft((d) => ({ ...d, ...p }));

  const submit = () => {
    const payload: CampaignInput = {
      ...draft,
      campaignCode: draft.campaignCode.trim().toUpperCase(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      startDate: draft.startDate?.trim() ? draft.startDate : null,
      endDate: draft.endDate?.trim() ? draft.endDate : null,
    };

    const ok =
      mode === 'create'
        ? onSaveCreate(payload)
        : campaign
          ? (() => {
              const { campaignCode: _c, ...rest } = payload as CampaignInput & {
                campaignCode: string;
              };
              return onSaveUpdate(campaign.id, rest as CampaignUpdateInput);
            })()
          : false;

    if (ok) onClose();
  };

  const codeLocked = mode === 'edit';

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640 }}
      >
        <h3 className="modal-title">{mode === 'create' ? t('ccm_new') : t('ib_edit')}</h3>
        <div className="form-grid" style={{ gap: 12 }}>
          <Field label={t('ccm_col_code')} required>
            <input
              className="input mono fs-12"
              value={draft.campaignCode}
              readOnly={codeLocked}
              disabled={codeLocked}
              onChange={(e) => patch({ campaignCode: e.target.value.toUpperCase() })}
              placeholder="WELCOME2026"
            />
          </Field>
          <Field label={t('ccm_col_name')} required>
            <input
              className="input fs-12"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </Field>
          <Field label={t('rpt_col_desc')}>
            <textarea
              className="textarea"
              rows={3}
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>

          <Field label={t('ccm_col_fixed_gain')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={draft.fixedFeeGainRate}
              onChange={(e) => patch({ fixedFeeGainRate: Number(e.target.value) })}
            />
          </Field>
          <Field label={t('ccm_col_comm_gain')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={draft.commissionGainRate}
              onChange={(e) => patch({ commissionGainRate: Number(e.target.value) })}
            />
          </Field>

          <Field label={t('rs_scope_transaction')}>
            <select
              className="select fs-12"
              value={draft.transactionType}
              onChange={(e) => patch({ transactionType: e.target.value as FeeTransactionType })}
            >
              {TRANSACTION_TYPE_OPTIONS.map((tx) => (
                <option key={tx} value={tx}>
                  {txLabel[tx]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t('cba_col_currency')}>
            <select
              className="select fs-12"
              value={draft.currency}
              onChange={(e) => patch({ currency: e.target.value as FeeCurrency })}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {countryLabel[c]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t('sj_log_col_start')}>
            <input
              className="input fs-12"
              type="date"
              value={draft.startDate ?? ''}
              onChange={(e) => patch({ startDate: e.target.value || null })}
            />
          </Field>
          <Field label={t('sj_log_col_end')}>
            <input
              className="input fs-12"
              type="date"
              value={draft.endDate ?? ''}
              onChange={(e) => patch({ endDate: e.target.value || null })}
            />
          </Field>

          <Field label={t('ccm_col_min_tx')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              value={draft.minTxAmount ?? ''}
              onChange={(e) =>
                patch({ minTxAmount: e.target.value ? Number(e.target.value) : null })
              }
            />
          </Field>
          <Field label={t('ccm_col_max_tx')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              value={draft.maxGainPerTx ?? ''}
              onChange={(e) =>
                patch({ maxGainPerTx: e.target.value ? Number(e.target.value) : null })
              }
            />
          </Field>
          <Field label={t('ccm_col_max_total')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              value={draft.maxGainTotal ?? ''}
              onChange={(e) =>
                patch({ maxGainTotal: e.target.value ? Number(e.target.value) : null })
              }
            />
          </Field>
          <Field label={t('ccm_col_max_usage')}>
            <input
              className="input mono fs-12"
              type="number"
              min={1}
              step={1}
              value={draft.maxUsageCount ?? ''}
              onChange={(e) =>
                patch({
                  maxUsageCount: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </Field>
        </div>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button variant="primary" onClick={submit}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

