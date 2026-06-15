import type { SelectOption, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const FILTER_LABEL_KEYS: Record<string, string> = {
  target: 'cn_col_target',
  priority: 'cn_col_priority',
};

const COLUMN_KEYS: Record<string, string> = {
  customerNo: 'cn_col_customer',
  noteText: 'cn_col_text',
  target: 'cn_col_target',
  priority: 'cn_col_priority',
  displayLimit: 'cn_col_display_limit',
  displayCount: 'cn_col_display_count',
  endDate: 'cn_col_end_date',
};

const TARGET_OPTION_KEYS: Record<string, string> = {
  IndividualCustomer: 'cn_target_IndividualCustomer',
  CorporateCustomer: 'cn_target_CorporateCustomer',
  Agent: 'cn_target_Agent',
};

const PRIORITY_OPTION_KEYS: Record<string, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'scf_level_Critical',
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

/** JSON tablo config etiketlerini cn_* i18n key'lerine bağla (JSON Türkçe metin fallback). */
export function localizeCustomerNotesTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('s_cust_notes', base.title),
    search: base.search
      ? { ...base.search, placeholder: t('cn_search_ph', base.search.placeholder ?? '') }
      : base.search,
    advancedFilters: base.advancedFilters?.map((f) => {
      const labelKey = FILTER_LABEL_KEYS[f.key];
      let options = f.options;
      if (f.key === 'target') options = localizeOptions(t, options, TARGET_OPTION_KEYS);
      else if (f.key === 'priority') options = localizeOptions(t, options, PRIORITY_OPTION_KEYS);
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
            ? { ...base.toolbar.new, label: t('cn_new_note', base.toolbar.new.label) }
            : base.toolbar.new,
        }
      : base.toolbar,
    columns: base.columns.map((c) => ({
      ...c,
      title: COLUMN_KEYS[c.key] ? t(COLUMN_KEYS[c.key], c.title) : c.title,
    })),
  };
}
