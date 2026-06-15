import type { FormConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/approval-rules.form.config.json';

export function buildApprovalRulesFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    panels: base.panels?.map((p) => ({
      ...p,
      title: t(`ar_panel_${p.key}`, p.title),
    })),
  };
}
