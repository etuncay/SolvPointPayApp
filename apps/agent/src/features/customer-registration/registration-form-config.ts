import type { FormConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/registration.form.config.json';
import { localizeRegistrationFormConfig } from './localize-config';

export function buildRegistrationFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  return t ? localizeRegistrationFormConfig(base, t) : base;
}
