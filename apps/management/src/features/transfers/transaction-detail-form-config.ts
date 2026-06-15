import type { FormConfig, TranslateFn } from '@epay/ui';
import detailFormJson from './config/transaction-detail.form.config.json';

const PANEL_KEYS: Record<string, string> = {
  sender: 'fcd_tx_sender',
  receiver: 'fcd_tx_receiver',
  reference: 'rpt_col_reference',
  amounts: 'td_panel_amounts',
  details: 'td_panel_details',
  'sender-auth': 'td_panel_sender_auth',
  'receiver-auth': 'td_panel_receiver_auth',
  agents: 'nav_agents',
  documents: 'td_panel_documents',
};

const FIELD_KEYS: Record<string, string> = {
  sender_customerNo: 'td_customer_no',
  sender_walletNo: 'td_wallet_no',
  sender_name: 'rpt_col_name',
  sender_phone: 'fcd_customer_phone',
  sender_id: 'cd_id',
  sender_city: 'rpt_col_city',
  sender_iban: 'cba_col_iban',
  receiver_customerNo: 'td_customer_no',
  receiver_walletNo: 'td_wallet_no',
  receiver_name: 'rpt_col_name',
  receiver_phone: 'fcd_customer_phone',
  receiver_id: 'cd_id',
  receiver_city: 'rpt_col_city',
  receiver_iban: 'cba_col_iban',
  referenceNo: 'wa_col_reference',
  foreignReferenceNo: 'td_foreign_ref',
  principalAmount: 'td_principal',
  targetAmount: 'td_target_amount',
  fxRate: 'int_type_FxRate',
  feeFixed: 'cfe_col_fixed',
  feeVariable: 'td_fee_variable',
  totalPaid: 'ag_cf_total_paid',
  createdAt: 'td_created_at',
  withdrawalDate: 'td_withdrawal_date',
  transactionType: 'fcd_tx_type',
  paymentPurpose: 'td_payment_purpose',
  status: 'rpt_col_status',
  description: 'rpt_col_desc',
  senderAuth_name: 'td_auth_name',
  senderAuth_title: 'lv_col_title',
  senderAuth_phone: 'fcd_customer_phone',
  receiverAuth_name: 'td_auth_name',
  receiverAuth_title: 'lv_col_title',
  receiverAuth_phone: 'fcd_customer_phone',
  agentRole: 'ag_cf_agent_role',
  agentName: 'td_auth_name',
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

