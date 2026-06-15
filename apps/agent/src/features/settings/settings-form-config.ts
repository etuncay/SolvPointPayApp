import type { FormConfig, TranslateFn } from '@epay/ui';
import contactAddJson from './config/contact-add.form.config.json';
import addressAddJson from './config/address-add.form.config.json';
import passwordChangeJson from './config/password-change.form.config.json';
import welcomeMessageJson from './config/welcome-message.form.config.json';
import appPreferencesJson from './config/app-preferences.form.config.json';
import {
  localizeAddressAddFormConfig,
  localizeAppPreferencesFormConfig,
  localizeContactAddFormConfig,
  localizePasswordChangeFormConfig,
  localizeWelcomeMessageFormConfig,
} from './localize-config';

export function buildContactAddFormConfig(t?: TranslateFn): FormConfig {
  const base = contactAddJson as FormConfig;
  return t ? localizeContactAddFormConfig(base, t) : base;
}

export function buildAddressAddFormConfig(t?: TranslateFn): FormConfig {
  const base = addressAddJson as FormConfig;
  return t ? localizeAddressAddFormConfig(base, t) : base;
}

export function buildPasswordChangeFormConfig(t?: TranslateFn): FormConfig {
  const base = passwordChangeJson as FormConfig;
  return t ? localizePasswordChangeFormConfig(base, t) : base;
}

export function buildWelcomeMessageFormConfig(t?: TranslateFn): FormConfig {
  const base = welcomeMessageJson as FormConfig;
  return t ? localizeWelcomeMessageFormConfig(base, t) : base;
}

export function buildAppPreferencesFormConfig(t?: TranslateFn): FormConfig {
  const base = appPreferencesJson as FormConfig;
  return t ? localizeAppPreferencesFormConfig(base, t) : base;
}
