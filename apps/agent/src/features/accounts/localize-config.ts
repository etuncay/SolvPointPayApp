import type {
  SelectOption,
  TableAdvancedFilterConfig,
  TableConfig,
  TranslateFn,
} from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

/** Kolon anahtarı → i18n anahtarı (hem hareketler hem bakiye tablosu). */
const COLUMN_KEY: Record<string, string> = {
  transactionNo: 'ag_acc_col_tx_no',
  createdAt: 'ag_acc_col_date',
  direction: 'ag_acc_col_direction',
  walletNo: 'ag_acc_col_wallet',
  counterpartyNo: 'ag_acc_col_counterparty_no',
  counterpartyName: 'ag_acc_col_counterparty_name',
  counterpartyAccount: 'ag_acc_col_counterparty_account',
  referenceNo: 'ag_acc_col_ref_no',
  transactionType: 'ag_acc_col_tx_type',
  currency: 'ag_acc_col_currency',
  amount: 'ag_acc_col_amount',
  postBalance: 'ag_acc_col_post_balance',
  status: 'ag_acc_col_status',
  description: 'ag_acc_col_desc',
  // Bakiye tablosu
  accountType: 'ag_acc_col_account_type',
  balance: 'ag_acc_col_balance',
  blocked: 'ag_acc_col_blocked',
  available: 'ag_acc_col_available',
};

/** Bakiye tablosunda walletNo kolonu farklı anahtar (Cüzdan No). */
const BALANCE_WALLET_NO_KEY = 'ag_acc_col_wallet_no';

/** Gelişmiş filtre anahtarı → i18n etiket anahtarı. */
const FILTER_LABEL_KEY: Record<string, string> = {
  direction: 'ag_acc_filter_direction',
  transactionType: 'ag_acc_filter_tx_type',
  walletId: 'ag_acc_filter_wallet',
  counterparty: 'ag_acc_col_counterparty_name',
  dateFrom: 'ag_acc_filter_date_from',
  dateTo: 'ag_acc_filter_date_to',
  amountMin: 'ag_acc_filter_amt_min',
  amountMax: 'ag_acc_filter_amt_max',
};

function localizeOptions(
  t: TranslateFn,
  filterKey: string,
  options: SelectOption[] | undefined,
): SelectOption[] | undefined {
  if (!options) return options;
  if (filterKey === 'direction') {
    return options.map((o) => ({
      ...o,
      label: t(o.value === 'Inflow' ? 'ag_acc_dir_inflow' : 'ag_acc_dir_outflow', o.label),
    }));
  }
  if (filterKey === 'transactionType') {
    return options.map((o) => ({ ...o, label: t(`wa_tx_${String(o.value)}`, o.label) }));
  }
  return options;
}

/** Hesap hareketleri tablo config'ini yerelleştir. */
export function localizeAccountsActivitiesConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('ag_acc_activities_title', base.title),
    search: base.search
      ? { ...base.search, placeholder: t('ag_acc_search_ph', base.search.placeholder ?? '') }
      : base.search,
    advancedFilters: base.advancedFilters?.map((f: TableAdvancedFilterConfig) => ({
      ...f,
      label: t(FILTER_LABEL_KEY[f.key] ?? f.key, f.label),
      placeholder:
        f.key === 'counterparty'
          ? t('ag_acc_filter_counterparty', f.placeholder ?? '')
          : f.placeholder,
      options: localizeOptions(t, f.key, f.options),
    })),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(COLUMN_KEY[c.key] ?? c.key, c.title),
    })),
  };
}

/** Bakiye tablo config'ini yerelleştir. */
export function localizeAccountsBalancesConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('ag_acc_balance_title', base.title),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(c.key === 'walletNo' ? BALANCE_WALLET_NO_KEY : (COLUMN_KEY[c.key] ?? c.key), c.title),
    })),
  };
}
