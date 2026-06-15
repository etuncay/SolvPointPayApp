import type {
  SelectOption,
  TableAdvancedFilterConfig,
  TableConfig,
  TranslateFn,
} from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const COLUMN_KEY: Record<string, string> = {
  transactionNo: 'ag_tx_hist_col_tx_no',
  createdAt: 'ag_tx_hist_col_date',
  senderName: 'ag_tx_hist_col_sender',
  receiverName: 'ag_tx_hist_col_receiver',
  iban: 'ag_tx_hist_col_iban',
  transactionType: 'ag_tx_hist_col_tx_type',
  currency: 'ag_tx_hist_col_currency',
  amount: 'ag_tx_hist_col_amount',
  description: 'ag_tx_hist_col_desc',
  referenceNo: 'ag_tx_hist_col_ref_no',
  status: 'ag_tx_hist_col_status',
  agentRole: 'ag_tx_hist_col_role',
  totalRevenueTry: 'ag_tx_hist_col_revenue',
};

const TAB_KEY: Record<string, string> = {
  all: 'ag_tx_hist_tab_all',
  Completed: 'tx_status_Completed',
  Pending: 'tx_status_Pending',
  Sent: 'tx_status_Sent',
  OnHold: 'tx_status_OnHold',
  Rejected: 'ag_tx_hist_tab_rejected',
};

const FILTER_LABEL_KEY: Record<string, string> = {
  transactionNo: 'ag_tx_hist_filter_tx_no',
  transactionType: 'ag_tx_hist_col_tx_type',
  agentRole: 'ag_tx_hist_col_role',
  dateFrom: 'ag_tx_hist_filter_date_from',
  dateTo: 'ag_tx_hist_filter_date_to',
  amountMin: 'ag_tx_hist_filter_amt_min',
  amountMax: 'ag_tx_hist_filter_amt_max',
  sender: 'ag_tx_hist_col_sender',
  receiver: 'ag_tx_hist_col_receiver',
};

function localizeOptions(
  t: TranslateFn,
  filterKey: string,
  options: SelectOption[] | undefined,
): SelectOption[] | undefined {
  if (!options) return options;
  if (filterKey === 'transactionType') {
    return options.map((o) => {
      const map: Record<string, string> = {
        WalletTopUp: 'ag_tx_hist_type_own',
        WalletToBankAccount: 'ag_tx_hist_type_bank',
        WalletToPerson: 'ag_tx_hist_type_person',
        InternationalTransfer: 'ag_tx_hist_type_abroad',
        WalletWithdrawal: 'ag_tx_hist_type_withdraw',
      };
      const key = map[String(o.value)];
      return { ...o, label: key ? t(key, o.label) : t(`wa_tx_${String(o.value)}`, o.label) };
    });
  }
  if (filterKey === 'agentRole') {
    return options.map((o) => ({
      ...o,
      label: t(o.value === 'SenderAgent' ? 'ag_tx_hist_role_sender' : 'ag_tx_hist_role_receiver', o.label),
    }));
  }
  return options;
}

/** İşlem hareketleri tablo config'ini yerelleştir. */
export function localizeTransactionHistoryConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('ag_nav_transactions', base.title),
    search: base.search
      ? { ...base.search, placeholder: t('ag_tx_hist_search_ph', base.search.placeholder ?? '') }
      : base.search,
    tabs: base.tabs?.map((tab) => ({
      ...tab,
      title: t(TAB_KEY[tab.key] ?? tab.key, tab.title),
    })),
    advancedFilters: base.advancedFilters?.map((f: TableAdvancedFilterConfig) => ({
      ...f,
      label: t(FILTER_LABEL_KEY[f.key] ?? f.key, f.label),
      options: localizeOptions(t, f.key, f.options),
    })),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(COLUMN_KEY[c.key] ?? c.key, c.title),
    })),
  };
}
