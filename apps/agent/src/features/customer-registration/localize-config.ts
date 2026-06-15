import type { FieldConfig, FormConfig, SelectOption, TranslateFn } from '@epay/ui';

function mapOptions(
  t: TranslateFn,
  options: SelectOption[] | undefined,
  keyFor: (value: string) => string,
): SelectOption[] | undefined {
  if (!options) return undefined;
  return options.map((o) => ({ ...o, label: t(keyFor(String(o.value)), o.label) }));
}

function localizeField(t: TranslateFn, field: FieldConfig): FieldConfig {
  if (field.type === 'Row' && field.fields) {
    return { ...field, fields: field.fields.map((f) => localizeField(t, f)) };
  }
  if (field.type === 'Divider') return field;

  const { name } = field;
  let options = field.options;
  if (options) {
    if (name === 'nationality') options = mapOptions(t, options, (v) => `ag_cust_nat_${v}`);
    else if (name === 'idType') options = mapOptions(t, options, (v) => `ag_cust_idtype_${v}`);
    else if (name === 'maritalStatus') options = mapOptions(t, options, (v) => `ag_cust_marital_${v}`);
    else if (name === 'gender') options = mapOptions(t, options, (v) => `ag_cust_gender_${v}`);
    else if (name === 'educationLevel') options = mapOptions(t, options, (v) => `ag_cust_edu_${v}`);
    else if (name === 'employmentStatus') options = mapOptions(t, options, (v) => `ag_cust_emp_${v}`);
    else if (name === 'language') options = mapOptions(t, options, (v) => `ag_cust_lang_${v}`);
    else if (name === 'visaType') options = mapOptions(t, options, (v) => `ag_cust_visa_${v}`);
  }

  return {
    ...field,
    label: t(`ag_cust_field_${name}`, field.label ?? name),
    hint: field.hint ? t(`ag_cust_hint_${name}`, field.hint) : field.hint,
    placeholder:
      field.type === 'Switch'
        ? t(`ag_cust_switch_${name}`, field.placeholder ?? '')
        : field.placeholder
          ? t(`ag_cust_ph_${name}`, field.placeholder)
          : field.placeholder,
    options,
    rules: field.rules?.map((r) => ({
      ...r,
      message: r.message ? t(`ag_cust_rule_${name}`, r.message) : r.message,
    })),
  };
}

export function localizeRegistrationFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    tabs: base.tabs?.map((tab) => ({
      ...tab,
      title: t(`ag_cust_tab_${tab.key}`, tab.title),
      lockedMessage: tab.lockedMessage ? t('ag_cust_tab_locked', tab.lockedMessage) : tab.lockedMessage,
      fields: tab.fields?.map((f) => localizeField(t, f)),
    })),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(`ag_cust_btn_${b.key}`, b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

const DOC_COL: Record<string, string> = {
  uploadedAt: 'ag_cust_doclist_uploaded',
  category: 'ag_cust_doclist_category',
  typeLabel: 'ag_cust_doclist_type',
  docStatus: 'ag_cust_doclist_status',
  approval: 'ag_cust_doclist_approval',
};

type TableConfigJson = import('@epay/ui').TableConfig;

export function localizeDocumentsTableConfig(base: Omit<TableConfigJson, 'api'>, t: TranslateFn) {
  return {
    ...base,
    title: t('ag_cust_field_documentsList', base.title),
    columns: base.columns.map((c) => ({ ...c, title: t(DOC_COL[c.key] ?? c.key, c.title) })),
  };
}
