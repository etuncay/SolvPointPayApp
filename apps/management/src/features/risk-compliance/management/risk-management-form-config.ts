import type { FormConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/risk-management.form.config.json';

export function buildRiskManagementFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    panels: base.panels?.map((p) => ({
      ...p,
      title: t(`rm_panel_${p.key}`, p.title),
    })),
  };
}
