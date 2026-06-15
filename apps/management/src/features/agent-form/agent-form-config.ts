import type { FormConfig, TranslateFn } from '@epay/ui';
import formConfigJson from './config/agent.form.config.json';
import { localizeAgentFormConfig } from './localize-config';

export function buildAgentFormConfig(t?: TranslateFn): FormConfig {
  const base = formConfigJson as FormConfig;
  return t ? localizeAgentFormConfig(base, t) : base;
}
