import type { FormConfig, TranslateFn } from '@epay/ui';
import detailFormJson from './config/transaction-detail.form.config.json';

const PANEL_KEYS: Record<string, string> = {
  parties: 'ag_tx_hist_d_parties',
  amounts: 'ag_tx_hist_d_amounts',
  meta: 'ag_tx_hist_d_meta',
  revenue: 'ag_tx_hist_d_income',
};

const FIELD_KEYS: Record<string, string> = {
  senderName: 'ag_tx_hist_col_sender',
  receiverName: 'ag_tx_hist_col_receiver',
  iban: 'ag_tx_hist_col_iban',
  roleLabel: 'ag_tx_hist_col_role',
  txTypeLabel: 'ag_tx_hist_col_tx_type',
  amountLabel: 'ag_tx_hist_col_amount',
  feesLabel: 'ag_tr_panel_fees',
  totalLabel: 'ag_tx_hist_total_collection',
  dateLabel: 'ag_tx_hist_col_date',
  referenceNo: 'ag_tx_hist_col_ref_no',
  currency: 'ag_tx_hist_col_currency',
  description: 'ag_tx_hist_col_desc',
  revenueLabel: 'ag_tx_hist_col_revenue',
};

export function buildTransactionDetailFormConfig(t?: TranslateFn): FormConfig {
  const base = detailFormJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    panels: base.panels?.map((p) => ({
      ...p,
      title: t(PANEL_KEYS[p.key] ?? p.key, p.title),
      fields: p.fields?.map((f) => ({
        ...f,
        label: f.label ? t(FIELD_KEYS[f.name] ?? f.name, f.label) : f.label,
      })),
    })),
  };
}
