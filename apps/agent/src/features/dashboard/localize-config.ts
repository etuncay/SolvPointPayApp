import type { TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const TX_COL: Record<string, string> = {
  transactionNo: 'ag_home_col_tx_no',
  createdAt: 'ag_home_col_date',
  senderName: 'ag_home_col_sender',
  receiverName: 'ag_home_col_receiver',
  iban: 'cba_col_iban',
  transactionType: 'fcd_tx_type',
  amount: 'ag_home_col_amount',
  currency: 'ag_home_col_currency',
  description: 'rpt_col_desc',
  referenceNo: 'ag_home_col_reference',
  status: 'rpt_col_status',
};

const CUST_COL: Record<string, string> = {
  createdAt: 'ag_home_col_created',
  customerNo: 'ag_home_col_customer_no',
  idNo: 'ag_home_col_id_no',
  name: 'rpt_col_name',
  status: 'rpt_col_status',
};

export function localizePendingTransactionsConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('ag_home_pending_tx', base.title),
    columns: base.columns.map((c) => ({ ...c, title: t(TX_COL[c.key] ?? c.key, c.title) })),
  };
}

export function localizePendingCustomersConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('ag_home_pending_customers', base.title),
    columns: base.columns.map((c) => ({ ...c, title: t(CUST_COL[c.key] ?? c.key, c.title) })),
  };
}
