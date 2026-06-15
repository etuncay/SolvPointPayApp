import type { FormConfig, TranslateFn } from '@epay/ui';
import { fetchFormReferenceOptions } from '@epay/data';
import formConfigJson from './config/form.config.json';
import { localizePlaygroundFormConfig } from './localize-config';

export function buildPlaygroundFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  return t ? localizePlaygroundFormConfig(base, t) : base;
}

/** DynamicForm optionsFromApi — @epay/data (Dexie / HTTP) */
export const playgroundFormApiCall = fetchFormReferenceOptions;
