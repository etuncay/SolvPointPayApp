import type { FormConfig, TranslateFn } from '@epay/ui';
import formJson from './config/feedback.form.config.json';
import { localizeFeedbackFormConfig } from './localize-config';

/** JSON config + i18n + complaint_type seçenekleri. */
export function buildFeedbackFormConfig(t: TranslateFn): FormConfig {
  return localizeFeedbackFormConfig(formJson as FormConfig, t);
}
