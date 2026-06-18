import { useMemo } from 'react';
import { useAgentSession } from './use-agent-session';
import {
  defaultAgentPermissions,
  mapAgentUiPermissions,
  type AgentUiPermissions,
} from '@/domain/ui-permissions';

/** Sayfa bileşenleri için `getAgentPermissions` → Form/Table izinleri. */
export function useAgentUiPermissions(): AgentUiPermissions {
  const session = useAgentSession();
  return useMemo(
    () => mapAgentUiPermissions(session?.permissions ?? defaultAgentPermissions()),
    [session],
  );
}
