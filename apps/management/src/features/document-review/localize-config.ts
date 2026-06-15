import type { SelectOption, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const FILTER_LABEL_KEYS: Record<string, string> = {
  customerNo: 'frd_exc_customer',
  category: 'dr_col_category',
  documentType: 'dr_col_type',
  approvalStatus: 'dr_col_status',
};

const COLUMN_KEYS: Record<string, string> = {
  customerNo: 'frd_exc_customer',
  customerName: 'rpt_col_name',
  nationality: 'ef_nationality',
  suspiciousFlag: 'dr_col_suspicious',
  createdAt: 'dr_col_created',
  category: 'dr_col_category',
  documentType: 'dr_col_type',
  approvalStatus: 'dr_col_status',
};

const APPROVAL_STATUS_OPTION_KEYS: Record<string, string> = {
  Pending: 'bm_status_Pending',
  Approved: 'dr_kyc_approved',
  Rejected: 'dr_kyc_rejected',
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

/** JSON tablo config etiketlerini dr_* i18n key'lerine bağla. */
export function localizeDocumentReviewTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('s_cust_doc', base.title),
    search: base.search
      ? { ...base.search, placeholder: t('dr_search_ph', base.search.placeholder ?? '') }
      : base.search,
    advancedFilters: base.advancedFilters?.map((f) => {
      const labelKey = FILTER_LABEL_KEYS[f.key];
      let options = f.options;
      if (f.key === 'category') {
        options = localizeOptions(
          t,
          options,
          Object.fromEntries(
            options?.map((o) => [String(o.value), `dr_cat_${String(o.value)}`]) ?? [],
          ),
        );
      } else if (f.key === 'approvalStatus') {
        options = localizeOptions(t, options, APPROVAL_STATUS_OPTION_KEYS);
      }
      return {
        ...f,
        label: labelKey ? t(labelKey, f.label) : f.label,
        placeholder:
          f.key === 'customerNo' && f.placeholder
            ? t('dr_filter_customer_ph', f.placeholder)
            : f.placeholder,
        options,
      };
    }),
    columns: base.columns.map((c) => ({
      ...c,
      title: COLUMN_KEYS[c.key] ? t(COLUMN_KEYS[c.key], c.title) : c.title,
    })),
  };
}
