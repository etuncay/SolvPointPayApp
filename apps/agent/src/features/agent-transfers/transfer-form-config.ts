import type { FormConfig, SelectOption, TranslateFn } from '@epay/ui';
import type { TransferVariant } from './domain/types';
import { PAYMENT_PURPOSE_OPTIONS } from './domain/payment-purpose';
import ownWalletJson from './config/own-wallet.form.config.json';
import bankAccountJson from './config/bank-account.form.config.json';
import personJson from './config/person.form.config.json';
import abroadJson from './config/abroad.form.config.json';
import { localizeTransferFormConfig } from './localize-config';

const CONFIG_BY_VARIANT: Record<TransferVariant, FormConfig> = {
  ownWallet: ownWalletJson as FormConfig,
  bankAccount: bankAccountJson as FormConfig,
  person: personJson as FormConfig,
  abroad: abroadJson as FormConfig,
};

export interface TransferFormOptions {
  currencyOptions: string[];
  paymentPurposeOptions?: SelectOption[];
}

export function buildTransferFormConfig(
  variant: TransferVariant,
  t: TranslateFn,
  opts: TransferFormOptions,
): FormConfig {
  const base = CONFIG_BY_VARIANT[variant];
  const localized = localizeTransferFormConfig(base, t);

  const purposeOpts: SelectOption[] =
    opts.paymentPurposeOptions ??
    PAYMENT_PURPOSE_OPTIONS.map((p) => ({ value: p.value, label: t(p.labelKey) }));

  const ccyOpts: SelectOption[] = opts.currencyOptions.map((ccy) => ({ label: ccy, value: ccy }));

  return {
    ...localized,
    fields: localized.fields?.map((f) => {
      if (f.name === 'currency') return { ...f, options: ccyOpts.length ? ccyOpts : f.options };
      if (f.name === 'paymentPurpose') return { ...f, options: purposeOpts };
      return f;
    }),
  };
}
