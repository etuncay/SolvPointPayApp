import type { FormConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/individual.form.config.json';
import { localizeIndividualFormConfig } from './localize-config';

export function buildIndividualFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  return t ? localizeIndividualFormConfig(base, t) : base;
}
