/* ──────────────────────────────────────────────────────
 *  RoleProvider — etkin rol (izinler) tek kaynaktan.
 *  Oturum açıkken: hesap rolü (auth) + isteğe bağlı demo override.
 *  Oturum yokken: yalnızca ?demoRole= veya varsayılan ops.
 *  ?role= ve epay-backoffice-role kullanılmaz.
 * ────────────────────────────────────────────────────── */
import * as React from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { useOptionalAuth } from './auth-context';
import {
  DEMO_ROLE_OVERRIDE_KEY,
  LEGACY_ROLE_STORAGE_KEY,
  isBackOfficeRole,
  nextRoleInCycle,
  readDemoRoleFromUrl,
  readDemoRoleOverride,
  resolveEffectiveRole,
} from './role-resolution';

interface RoleContextValue {
  /** İzinler ve menü için etkin rol */
  role: BackOfficeRole;
  /** Oturumdaki hesap rolü; oturum yoksa null */
  accountRole: BackOfficeRole | null;
  /** Demo override aktif (etkin rol ≠ hesap rolü) */
  isDemoRoleOverride: boolean;
  setDemoRole: (role: BackOfficeRole) => void;
  clearDemoRole: () => void;
  /** @deprecated setDemoRole kullanın */
  setRole: (role: BackOfficeRole) => void;
  cycleRole: () => void;
}

const RoleContext = React.createContext<RoleContextValue | null>(null);

function readInitialGuestRole(): BackOfficeRole {
  if (typeof window === 'undefined') return 'ops';
  return readDemoRoleFromUrl(window.location.search) ?? 'ops';
}

function persistDemoOverride(role: BackOfficeRole | null): void {
  try {
    if (role) sessionStorage.setItem(DEMO_ROLE_OVERRIDE_KEY, role);
    else sessionStorage.removeItem(DEMO_ROLE_OVERRIDE_KEY);
  } catch {
    /* private mode */
  }
}

function clearLegacyRoleStorage(): void {
  try {
    sessionStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const auth = useOptionalAuth();
  const accountRole = auth?.user?.role ?? null;

  const [guestRole, setGuestRole] = React.useState<BackOfficeRole>(readInitialGuestRole);
  const [demoOverride, setDemoOverride] = React.useState<BackOfficeRole | null>(null);

  React.useEffect(() => {
    if (!accountRole) {
      setDemoOverride(null);
      setGuestRole(readInitialGuestRole());
      return;
    }
    clearLegacyRoleStorage();
    setDemoOverride(readDemoRoleOverride(sessionStorage));
  }, [accountRole]);

  const role = React.useMemo(
    () =>
      resolveEffectiveRole({
        accountRole,
        demoOverride: accountRole ? demoOverride : null,
        guestRole,
      }),
    [accountRole, demoOverride, guestRole],
  );

  const isDemoRoleOverride =
    accountRole != null && demoOverride != null && demoOverride !== accountRole;

  const setDemoRole = React.useCallback(
    (next: BackOfficeRole) => {
      if (!isBackOfficeRole(next)) return;
      if (accountRole) {
        setDemoOverride(next);
        persistDemoOverride(next);
        return;
      }
      setGuestRole(next);
    },
    [accountRole],
  );

  const clearDemoRole = React.useCallback(() => {
    setDemoOverride(null);
    persistDemoOverride(null);
  }, []);

  const cycleRole = React.useCallback(() => {
    setDemoRole(nextRoleInCycle(role));
  }, [role, setDemoRole]);

  const value = React.useMemo(
    (): RoleContextValue => ({
      role,
      accountRole,
      isDemoRoleOverride,
      setDemoRole,
      clearDemoRole,
      setRole: setDemoRole,
      cycleRole,
    }),
    [role, accountRole, isDemoRoleOverride, setDemoRole, clearDemoRole, cycleRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error('useRole RoleProvider içinde kullanılmalı');
  return ctx;
}
