import type {
  FieldConfig,
  FormConfig,
  SelectOption,
  TableAdvancedFilterConfig,
  TableConfig,
  TranslateFn,
} from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

function mapOptions(
  t: TranslateFn,
  options: SelectOption[] | undefined,
  keyFor: (value: string) => string,
): SelectOption[] | undefined {
  if (!options) return undefined;
  return options.map((o) => ({
    ...o,
    label: t(keyFor(String(o.value)), o.label),
  }));
}

function localizeField(t: TranslateFn, field: FieldConfig): FieldConfig {
  // Row → kendi label'ı yok; child'ları recursive yerelleştir.
  if (field.type === 'Row' && field.fields) {
    return { ...field, fields: field.fields.map((f) => localizeField(t, f)) };
  }
  const { name } = field;
  let options = field.options;
  if (options) {
    if (name === 'customerType') {
      options = mapOptions(t, options, (v) => `pg_opt_${v}`);
    } else if (name === 'status') {
      options = mapOptions(t, options, (v) => `pg_status_${v}`);
    } else if (name === 'country') {
      options = mapOptions(t, options, (v) => `pg_country_${v}`);
    } else if (name === 'kycLevel') {
      options = mapOptions(t, options, (v) => `pg_kyc_${v}`);
    } else if (name === 'language') {
      options = mapOptions(t, options, (v) => `pg_lang_${v}`);
    }
  }

  return {
    ...field,
    label: t(`pg_field_${name}`, field.label ?? name),
    placeholder:
      field.type === 'Switch'
        ? t('pg_switch_on', field.placeholder ?? 'Aktif')
        : field.placeholder
          ? t(`pg_ph_${name}`, field.placeholder)
          : field.placeholder,
    options,
    rules: field.rules?.map((r) => ({
      ...r,
      message: r.message ? t(`pg_rule_${name}`, r.message) : r.message,
      patternMessage: r.patternMessage
        ? t(`pg_rule_${name}_pattern`, r.patternMessage)
        : r.patternMessage,
    })),
  };
}

function localizePanels(t: TranslateFn, panels: FormConfig['panels']): FormConfig['panels'] {
  if (!panels) return panels;
  return panels.map((p) => ({
    ...p,
    title: t(`pg_panel_${p.key}`, p.title),
    meta: p.meta ? t(`pg_panel_${p.key}_meta`, p.meta) : p.meta,
    fields: p.fields.map((f) => localizeField(t, f)),
  }));
}

export function localizePlaygroundFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    panels: localizePanels(t, base.panels),
    fields: base.fields?.map((f) => localizeField(t, f)),
    tabs: base.tabs?.map((tab) => ({
      ...tab,
      title: t(`pg_tab_${tab.key}`, tab.title),
      fields: tab.fields?.map((f) => localizeField(t, f)),
      panels: localizePanels(t, tab.panels),
    })),
  };
}

export function localizePlaygroundTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('pg_table_title', base.title),
    search: base.search
      ? { ...base.search, placeholder: t('pg_search_ph', base.search.placeholder ?? '') }
      : base.search,
    advancedFilters: base.advancedFilters?.map((f: TableAdvancedFilterConfig) => ({
      ...f,
      label: t(`pg_filter_${f.key}`, f.label),
      placeholder: f.placeholder ? t(`pg_filter_${f.key}_ph`, f.placeholder) : f.placeholder,
      options: f.key === 'type' ? mapOptions(t, f.options, (v) => `pg_opt_${v}`) : f.options,
    })),
    tabs: base.tabs?.map((tab) => ({
      ...tab,
      title: t(`pg_tab_${tab.key}`, tab.title),
    })),
    toolbar: {
      export: { label: t('pg_toolbar_export', base.toolbar?.export?.label ?? '') },
      new: { label: t('pg_toolbar_new', base.toolbar?.new?.label ?? '') },
    },
    bulkActions: base.bulkActions?.map((b) => ({
      ...b,
      label: t(`pg_bulk_${b.key}`, b.label),
      confirm: b.confirm ? t(`pg_bulk_${b.key}_confirm`, b.confirm) : b.confirm,
    })),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(`pg_col_${c.key}`, c.title),
    })),
  };
}
