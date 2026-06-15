import type { IntegrationStatus } from './integration-types';
import { canCancel, canHold, canRetry } from './integration-transitions';

export type IntegrationRowActions = {
  view: boolean;
  retry: boolean;
  hold: boolean;
  cancel: boolean;
};

export function getIntegrationActions(status: IntegrationStatus): IntegrationRowActions {
  return {
    view: true,
    retry: canRetry(status),
    hold: canHold(status),
    cancel: canCancel(status),
  };
}
