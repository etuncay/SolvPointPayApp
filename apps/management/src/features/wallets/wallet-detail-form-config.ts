import type { FormConfig, TranslateFn } from '@epay/ui';
import walletDetailJson from './config/wallet-detail.form.config.json';

const PANEL_KEYS: Record<string, string> = {
  summary: 'wd_panel_summary',
  tx: 'wd_panel_tx',
  withdrawal: 'wd_panel_withdrawal',
  transfer: 'wd_panel_transfer',
  international: 'wd_panel_international',
  history: 'wd_panel_history',
};

const FIELD_KEYS: Record<string, string> = {
  ownerNo: 'wl_c_owner_no',
  ownerName: 'wl_c_name',
  phone: 'fcd_customer_phone',
  idNo: 'fcd_customer_id_no',
  walletNo: 'cba_col_account',
  balance: 'cba_col_balance',
  ccy: 'wl_c_ccy',
  blocked: 'fcd_blocked',
  available: 'wl_c_available',
  createdAt: 'sc_col_created',
  blockEndDate: 'wd_block_end',
  lastTxAt: 'wd_last_tx_at',
  lastTxAmount: 'wd_last_tx_amount',
  txToday: 'wl_c_tx_count',
  txAmtToday: 'wl_c_tx_amount',
  w_Single: 'wd_limit_Single',
  w_DailyCount: 'wd_limit_DailyCount',
  w_DailyAmount: 'wd_limit_DailyAmount',
  w_MonthlyCount: 'wd_limit_MonthlyCount',
  w_MonthlyAmount: 'wd_limit_MonthlyAmount',
  t_Single: 'wd_limit_Single',
  t_DailyCount: 'wd_limit_DailyCount',
  t_DailyAmount: 'wd_limit_DailyAmount',
  t_MonthlyCount: 'wd_limit_MonthlyCount',
  t_MonthlyAmount: 'wd_limit_MonthlyAmount',
  i_Single: 'wd_limit_Single',
  i_DailyCount: 'wd_limit_DailyCount',
  i_DailyAmount: 'wd_limit_DailyAmount',
  i_MonthlyCount: 'wd_limit_MonthlyCount',
  i_MonthlyAmount: 'wd_limit_MonthlyAmount',
};

export function buildWalletDetailFormConfig(t?: TranslateFn): FormConfig {
  const base = walletDetailJson as FormConfig;
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
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t('wd_save_limits', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

