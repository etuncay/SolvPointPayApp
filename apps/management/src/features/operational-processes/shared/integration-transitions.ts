import type { IntegrationStatus } from './integration-types';

export function isErrorStatus(status: IntegrationStatus): boolean {
  return status === 'ErrorPrepare' || status === 'ErrorSend' || status === 'ErrorData';
}

export function canRetry(status: IntegrationStatus): boolean {
  return isErrorStatus(status) || status === 'OnHold';
}

export function canHold(status: IntegrationStatus): boolean {
  return isErrorStatus(status);
}

export function canCancel(status: IntegrationStatus): boolean {
  return isErrorStatus(status) || status === 'OnHold';
}

export function applyRetry(status: IntegrationStatus): IntegrationStatus | null {
  if (!canRetry(status)) return null;
  return 'Retrying';
}

export function applyHold(status: IntegrationStatus): IntegrationStatus | null {
  if (!canHold(status)) return null;
  return 'OnHold';
}

export function applyCancel(status: IntegrationStatus): IntegrationStatus | null {
  if (!canCancel(status)) return null;
  return 'Canceled';
}

/** Mock pipeline: Retrying → Sending → Sent → Completed | ErrorSend */
export function advanceRetryPipeline(
  status: IntegrationStatus,
  succeed = true,
): IntegrationStatus {
  if (status === 'Retrying') return 'Sending';
  if (status === 'Sending') return 'Sent';
  if (status === 'Sent') return succeed ? 'Completed' : 'ErrorSend';
  return status;
}

export function runMockRetryPipeline(succeed = true): IntegrationStatus {
  return advanceRetryPipeline(advanceRetryPipeline(advanceRetryPipeline('Retrying', succeed), succeed), succeed);
}
