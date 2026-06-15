import * as React from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { useOptionalAuth } from './auth-context';
import { APP_ROLE_STORAGE_KEY } from '@/config/app';

const RoleContext = React.createContext<{
  role: BackOfficeRole;
  setRole: (r: BackOfficeRole) => void;
  cycleRole: () => void;
} | null>(null);

const ROLES: BackOfficeRole[] = ['ops', 'finance', 'compliance', 'management'];

function isBackOfficeRole(value: string | null): value is BackOfficeRole {
  return value != null && ROLES.includes(value as BackOfficeRole);
}

/** URL ?role=compliance veya sessionStorage — Risk menüsü testi için */
function readInitialRole(): BackOfficeRole {
  if (typeof window === 'undefined') return 'ops';

  const fromUrl = new URLSearchParams(window.location.search).get('role');
  if (isBackOfficeRole(fromUrl)) return fromUrl;

  try {
    const stored = sessionStorage.getItem(APP_ROLE_STORAGE_KEY);
    if (isBackOfficeRole(stored)) return stored;
  } catch {
    /* private mode */
  }

  return 'ops';
}

function persistRole(role: BackOfficeRole) {
  try {
    sessionStorage.setItem(APP_ROLE_STORAGE_KEY, role);
  } catch {
    /* ignore */
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const auth = useOptionalAuth();
  const [legacyRole, setLegacyRole] = React.useState<BackOfficeRole>(readInitialRole);

  // Oturum açıksa rol HESAPTAN gelir (tek kaynak). Aksi halde legacy (test/URL).
  const role: BackOfficeRole = auth?.user?.role ?? legacyRole;

  const setRole = React.useCallback((next: BackOfficeRole) => {
    setLegacyRole(next);
    persistRole(next);
  }, []);

  const cycleRole = React.useCallback(() => {
    setRole(ROLES[(ROLES.indexOf(role) + 1) % ROLES.length]);
  }, [role, setRole]);

  return (
    <RoleContext.Provider value={{ role, setRole, cycleRole }}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error('useRole RoleProvider içinde kullanılmalı');
  return ctx;
}
