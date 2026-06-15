import type { SelectOption, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const FILTER_LABEL_KEYS: Record<string, string> = {
  transactionType: 'rs_scope_transaction',
  currency: 'cba_col_currency',
  status: 'scf_col_status',
};

const TX_OPTION_KEYS: Record<string, string> = {
  WalletToPerson: 'cfe_tx_WalletToPerson',
  InternationalTransfer: 'cfe_tx_InternationalTransfer',
  WalletToBankAccount: 'cfe_tx_WalletToBankAccount',
  WalletTopUp: 'cfe_tx_WalletTopUp',
};

const STATUS_OPTION_KEYS: Record<string, string> = {
  Active: 'ib_status_Active',
  Passive: 'ib_status_Inactive',
};

function localizeOptions(
  t: TranslateFn,
  options: SelectOption[] | undefined,
  keyMap: Record<string, string>,
): SelectOption[] | undefined {
  if (!options) return options;
  return options.map((o) => {
    const key = keyMap[String(o.value)];
    return key ? { ...o, label: t(key, o.label) } : o;
  });
}

/** JSON tablo config etiketlerini cfe_* / paylaşımlı i18n key'lerine bağla. */
export function localizeCustomerFeesTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('s_cust_fees', base.title),
    search: base.search
      ? { ...base.search, placeholder: t('cfe_search_ph', base.search.placeholder ?? '') }
      : base.search,
    advancedFilters: base.advancedFilters?.map((f) => {
      let options = f.options;
      if (f.key === 'transactionType') options = localizeOptions(t, options, TX_OPTION_KEYS);
      else if (f.key === 'status') options = localizeOptions(t, options, STATUS_OPTION_KEYS);
      const labelKey = FILTER_LABEL_KEYS[f.key];
      return {
        ...f,
        label: labelKey ? t(labelKey, f.label) : f.label,
        options,
      };
    }),
    toolbar: base.toolbar
      ? {
          ...base.toolbar,
          new: base.toolbar.new
            ? { ...base.toolbar.new, label: t('cfe_new', base.toolbar.new.label) }
            : base.toolbar.new,
          export: base.toolbar.export
            ? { ...base.toolbar.export, label: t('ib_export', base.toolbar.export.label) }
            : base.toolbar.export,
        }
      : base.toolbar,
  };
}
