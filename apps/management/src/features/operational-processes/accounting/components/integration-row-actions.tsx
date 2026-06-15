import { IntegrationRowActions as SharedIntegrationRowActions } from '@/features/operational-processes/shared';
import type { IntegrationStatus } from '@/features/operational-processes/shared/integration-types';
import type { AccountingPermissions } from '../domain/types';

type Props = {
  status: IntegrationStatus;
  permissions: AccountingPermissions;
  onView: () => void;
  onRetry: () => void;
  onHold: () => void;
  onCancel: () => void;
};

export function IntegrationRowActions(props: Props) {
  return <SharedIntegrationRowActions {...props} />;
}
