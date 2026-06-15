import { useTranslation } from 'react-i18next';
import { Ban, Eye, PauseCircle, RotateCw } from 'lucide-react';
import { IconButton } from '@epay/ui';
import { getIntegrationActions } from './integration-action-permissions';
import type { IntegrationStatus } from './integration-types';

export type IntegrationActionPermissions = {
  view: boolean;
  retry: boolean;
  hold: boolean;
  cancel: boolean;
};

type Props = {
  status: IntegrationStatus;
  permissions: IntegrationActionPermissions;
  onView: () => void;
  onRetry: () => void;
  onHold: () => void;
  onCancel: () => void;
};

export function IntegrationRowActions({
  status,
  permissions,
  onView,
  onRetry,
  onHold,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const actions = getIntegrationActions(status);

  return (
    <div
      style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.view && permissions.view && (
        <IconButton aria-label={t('act_view')} onClick={onView} title={t('act_view')}>
          <Eye size={14} />
        </IconButton>
      )}
      {actions.retry && permissions.retry && (
        <IconButton aria-label={t('int_action_retry')} onClick={onRetry} title={t('int_action_retry')}>
          <RotateCw size={14} />
        </IconButton>
      )}
      {actions.hold && permissions.hold && (
        <IconButton aria-label={t('int_action_hold')} onClick={onHold} title={t('int_action_hold')}>
          <PauseCircle size={14} />
        </IconButton>
      )}
      {actions.cancel && permissions.cancel && (
        <IconButton aria-label={t('td_cancel')} onClick={onCancel} title={t('td_cancel')}>
          <Ban size={14} />
        </IconButton>
      )}
    </div>
  );
}
