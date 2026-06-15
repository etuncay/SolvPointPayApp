import type { FormConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/fx.form.config.json';

export function buildFxFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    panels: base.panels?.map((p) => ({
      ...p,
      title: t(`fx_panel_${p.key}`, p.title),
    })),
  };
}
