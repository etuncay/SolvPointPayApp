import type { FieldConfig, FormConfig, PanelConfig, SelectOption, TranslateFn } from '@epay/ui';

function mapOptions(
  t: TranslateFn,
  options: SelectOption[] | undefined,
  prefix: string,
): SelectOption[] | undefined {
  if (!options) return undefined;
  return options.map((o) => ({ ...o, label: t(`${prefix}_${String(o.value)}`, o.label) }));
}

function localizeField(t: TranslateFn, field: FieldConfig): FieldConfig {
  if (field.type === 'Row' && field.fields) {
    return { ...field, fields: field.fields.map((f) => localizeField(t, f)) };
  }
  if (field.type === 'Divider') return field;
  if (field.type === 'CustomComponent') return field;

  const { name } = field;
  const cleanName = name.replace(/\./g, '_');

  let options = field.options;
  if (options) {
    if (name === 'idType') options = mapOptions(t, options, 'ap_idType');
    else if (name === 'idCountry') options = mapOptions(t, options, 'ap_country');
    else if (name === 'maritalStatus') options = mapOptions(t, options, 'ap_marital');
    else if (name === 'gender') options = mapOptions(t, options, 'ap_gender');
    else if (name === 'education') options = mapOptions(t, options, 'ap_edu');
    else if (name === 'employment') options = mapOptions(t, options, 'ap_emp');
    else if (name === 'language') options = mapOptions(t, options, 'ap_lang');
    else if (name === 'visaType') options = mapOptions(t, options, 'ap_visa');
    else if (name === 'taxCountry') options = mapOptions(t, options, 'ap_country');
    else if (name === 'birthCountry') options = mapOptions(t, options, 'ap_country');
    else if (name === 'residentCountry') options = mapOptions(t, options, 'ap_country');
  }

  return {
    ...field,
    label: t(`ap_field_${cleanName}`, field.label ?? name),
    placeholder: field.placeholder ? t(`ap_ph_${cleanName}`, field.placeholder) : field.placeholder,
    options,
    rules: field.rules?.map((r) => ({
      ...r,
      message: r.message ? t(`ap_rule_${cleanName}`, r.message) : r.message,
    })),
  };
}

function localizePanel(t: TranslateFn, panel: PanelConfig): PanelConfig {
  return {
    ...panel,
    title: t(`ap_panel_${panel.key}`, panel.title),
    fields: panel.fields.map((f) => localizeField(t, f)),
  };
}

export function localizeAPFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    panels: base.panels?.map((p) => localizePanel(t, p)),
  };
}
