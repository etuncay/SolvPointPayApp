import type { SelectOption, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const TAB_KEYS: Record<string, string> = {
  active: 'ib_status_Active',
  inactive: 'ib_status_Inactive',
  blocked: 'fcd_blocked',
  closed: 'rl_closed',
  all: 'ib_all',
};

const FILTER_LABEL_KEYS: Record<string, string> = {
  type: 'af_type',
  kyc: 'af_kyc',
  risk: 'cc_risk_seg',
  campaign: 'cc_campaign',
  createdFrom: 'af_created_from',
  createdTo: 'af_created_to',
};

const COLUMN_KEYS: Record<string, string> = {
  id: 'frd_exc_customer',
  name: 'cc_name',
  contact: 'cc_contact',
  idNo: 'fcd_customer_id_no',
  type: 'rpt_col_type',
  campaign: 'cc_campaign',
  kyc: 'rpt_col_kyc',
  riskScore: 'cc_risk_score',
  riskSeg: 'cc_risk_seg',
  created: 'sc_col_created',
  status: 'scf_col_status',
};

const TYPE_OPTION_KEYS: Record<string, string> = {
  individual: 'cust_new_indv',
  corporate: 'cust_new_corp',
  prospective: 'cust_new_prosp',
};

const RISK_OPTION_KEYS: Record<string, string> = {
  low: 'rs_level_low',
  med: 'rs_level_medium',
  high: 'scf_level_High',
  critical: 'scf_level_Critical',
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

/** Spec §5/§6 — config etiketlerini mevcut i18n key'lerine bağla (JSON Türkçe metin fallback). */
export function localizeCustomersTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('nav_customers', base.title),
    search: base.search
      ? { ...base.search, placeholder: t('cust_search_ph', base.search.placeholder ?? '') }
      : base.search,
    tabs: base.tabs?.map((tab) => ({
      ...tab,
      title: TAB_KEYS[tab.key] ? t(TAB_KEYS[tab.key], tab.title) : tab.title,
    })),
    advancedFilters: base.advancedFilters?.map((f) => {
      const labelKey = FILTER_LABEL_KEYS[f.key];
      let options = f.options;
      if (f.key === 'type') options = localizeOptions(t, options, TYPE_OPTION_KEYS);
      else if (f.key === 'risk') options = localizeOptions(t, options, RISK_OPTION_KEYS);
      return {
        ...f,
        label: labelKey ? t(labelKey, f.label) : f.label,
        options,
      };
    }),
    toolbar: base.toolbar
      ? {
          ...base.toolbar,
          export: base.toolbar.export
            ? { ...base.toolbar.export, label: t('cust_export', base.toolbar.export.label) }
            : base.toolbar.export,
          new: base.toolbar.new
            ? { ...base.toolbar.new, label: t('chart_new_cust', base.toolbar.new.label) }
            : base.toolbar.new,
        }
      : base.toolbar,
    bulkActions: base.bulkActions?.map((b) =>
      b.key === 'bulkExport' ? { ...b, label: t('cust_bulk_export', b.label) } : b,
    ),
    columns: base.columns.map((c) => ({
      ...c,
      title: COLUMN_KEYS[c.key] ? t(COLUMN_KEYS[c.key], c.title) : c.title,
    })),
  };
}
