import type { FormConfig } from '@epay/ui';
import senderSummaryJson from './config/sender-summary.form.config.json';

export function buildSenderSummaryFormConfig(): FormConfig {
  return senderSummaryJson as FormConfig;
}
