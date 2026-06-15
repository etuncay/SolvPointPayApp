import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { usersService } from '../api/mock-users-adapter';
import { DEFAULT_APP_USER_FILTERS, type AppUserFilters } from '../domain/types';

export function useUsers(role: BackOfficeRole) {
  const [filters, setFilters] = useState<AppUserFilters>(DEFAULT_APP_USER_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);

  const updateFilters = useCallback((patch: Partial<AppUserFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const rows = useMemo(
    () => usersService.list(role, filters),
    [role, filters, refreshKey],
  );

  return { filters, updateFilters, rows, bumpRefresh };
}
