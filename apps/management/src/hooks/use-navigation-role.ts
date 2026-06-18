import { useEffect } from 'react';
import { useAuth } from '@/domain/auth-context';
import { useRole } from '@/domain/role-context';
import {
  isNavigationRoleSyncedWithSession,
  resolveNavigationRole,
} from '@/domain/navigation-role';

/**
 * Menü / widget görünürlüğü için rol.
 * RequireAuth yalnızca oturum kontrol eder; izinler bu `navigationRole` ile hizalanır.
 */
export function useNavigationRole() {
  const { user } = useAuth();
  const { role, accountRole, isDemoRoleOverride } = useRole();

  const navigationRole = resolveNavigationRole({
    accountRole,
    effectiveRole: role,
  });

  const isMenuSessionRoleInSync = isNavigationRoleSyncedWithSession({
    accountRole,
    effectiveRole: role,
    isDemoRoleOverride,
  });

  const sessionRoleMatchesUser = user == null || user.role === accountRole;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!accountRole) return;
    if (!isMenuSessionRoleInSync) {
      // eslint-disable-next-line no-console
      console.warn(
        '[nav] Menü rolü oturum rolü ile uyumsuz.',
        { navigationRole, accountRole, isDemoRoleOverride },
      );
    }
    if (!sessionRoleMatchesUser) {
      // eslint-disable-next-line no-console
      console.warn('[nav] auth.user.role ile accountRole uyumsuz.', {
        userRole: user?.role,
        accountRole,
      });
    }
  }, [
    accountRole,
    navigationRole,
    isDemoRoleOverride,
    isMenuSessionRoleInSync,
    sessionRoleMatchesUser,
    user?.role,
  ]);

  return {
    navigationRole,
    accountRole,
    isDemoRoleOverride,
    isMenuSessionRoleInSync,
    sessionRoleMatchesUser,
  };
}
