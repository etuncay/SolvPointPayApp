import type { FormConfig, TableConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/corporate.form.config.json';
import shareholdersTableJson from './config/shareholders.table.config.json';
import { localizeCorporateFormConfig } from './localize-config';

export function buildCorporateFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  return t ? localizeCorporateFormConfig(base, t) : base;
}

export function buildShareholdersTableConfig(t?: TranslateFn): Omit<TableConfig, 'api'> {
  const base = shareholdersTableJson as Omit<TableConfig, 'api'>;
  if (!t) return base;
  return {
    ...base,
    title: t('cf_panel_shareholders', base.title),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(`cf_col_${c.key}`, c.title),
    })),
  };
}
