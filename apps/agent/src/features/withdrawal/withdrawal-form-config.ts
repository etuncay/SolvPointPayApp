import type { FormConfig, SelectOption, TranslateFn } from '@epay/ui';
import formConfigJson from './config/withdrawal.form.config.json';
import { localizeWithdrawalFormConfig } from './localize-config';

export interface WithdrawalFormOptions {
  currencyOptions: string[];
  /** Tek cüzdan → para birimi kilitli. */
  currencyLocked: boolean;
}

/** JSON config + i18n + runtime para birimi seçenekleri (cüzdanlara göre). */
export function buildWithdrawalFormConfig(
  t: TranslateFn,
  opts: WithdrawalFormOptions,
): FormConfig {
  const base = formConfigJson as FormConfig;
  const localized = localizeWithdrawalFormConfig(base, t);

  const options: SelectOption[] = opts.currencyOptions.map((ccy) => ({ label: ccy, value: ccy }));

  return {
    ...localized,
    fields: localized.fields?.map((f) =>
      f.name === 'currency' ? { ...f, options } : f,
    ),
  };
}
