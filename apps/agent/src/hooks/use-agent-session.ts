import { useMemo } from 'react';
import { useAuth } from '@/domain/auth-context';
import { resolveAgentSession } from '@/domain/agent-session';
import { getAgentPermissions, type AgentPermissions } from '@/domain/permissions';
import type { AgentAuthorizedProfile } from '@/domain/agent-session';

export function useAgentSession(): {
  profile: AgentAuthorizedProfile;
  permissions: AgentPermissions;
} | null {
  const { user } = useAuth();

  return useMemo(() => {
    const profile = resolveAgentSession(user);
    if (!profile) return null;
    return { profile, permissions: getAgentPermissions(profile) };
  }, [user]);
}
