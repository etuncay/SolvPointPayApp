import type { FormConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/authorized-person.form.config.json';
import { localizeAPFormConfig } from './localize-config';

export function buildAPFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  return t ? localizeAPFormConfig(base, t) : base;
}
