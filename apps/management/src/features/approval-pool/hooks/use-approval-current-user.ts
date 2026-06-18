import { useMemo } from 'react';
import { useAuth } from '@/domain/auth-context';
import { useRole } from '@/domain/role-context';
import { resolveCurrentUser } from '../domain/current-user';

/** Onay havuzu — oturum kullanıcısı id + etkin rol ile persona. */
export function useApprovalCurrentUser() {
  const { user } = useAuth();
  const { role } = useRole();
  return useMemo(() => resolveCurrentUser(user, role), [user, role]);
}
