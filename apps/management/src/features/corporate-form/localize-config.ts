import type { FieldConfig, FormConfig, PanelConfig, SelectOption, TranslateFn } from '@epay/ui';

function mapOptions(t: TranslateFn, options: SelectOption[] | undefined, prefix: string): SelectOption[] | undefined {
  if (!options) return undefined;
  return options.map((o) => ({ ...o, label: t(`${prefix}_${String(o.value)}`, o.label) }));
}

function localizeField(t: TranslateFn, field: FieldConfig): FieldConfig {
  if (field.type === 'Row' && field.fields) {
    return { ...field, fields: field.fields.map((f) => localizeField(t, f)) };
  }
  if (field.type === 'Divider' || field.type === 'CustomComponent') return field;

  const { name } = field;
  const cleanName = name.replace(/\./g, '_');

  let options = field.options;
  if (options) {
    if (name === 'organizationType') options = mapOptions(t, options, 'cf_org');
    else if (name === 'ownershipType') options = mapOptions(t, options, 'cf_ownership');
    else if (name === 'language') options = mapOptions(t, options, 'cf_lang');
  }

  return {
    ...field,
    label: t(`cf_field_${cleanName}`, field.label ?? name),
    placeholder: field.placeholder ? t(`cf_ph_${cleanName}`, field.placeholder) : field.placeholder,
    options,
    rules: field.rules?.map((r) => ({
      ...r,
      message: r.message ? t(`cf_rule_${cleanName}`, r.message) : r.message,
    })),
  };
}

function localizePanel(t: TranslateFn, panel: PanelConfig): PanelConfig {
  return {
    ...panel,
    title: t(`cf_panel_${panel.key}`, panel.title),
    fields: panel.fields.map((f) => localizeField(t, f)),
  };
}

export function localizeCorporateFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    panels: base.panels?.map((p) => localizePanel(t, p)),
  };
}
