import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { rolesService } from '../api/mock-roles-adapter';
import type { AppRoleStatus } from '../domain/types';

export type RoleListFilters = {
  query: string;
  status: 'any' | AppRoleStatus;
};

const DEFAULT_FILTERS: RoleListFilters = { query: '', status: 'any' };

export function useRoles(role: BackOfficeRole) {
  const [filters, setFilters] = useState<RoleListFilters>(DEFAULT_FILTERS);
  const [rev, setRev] = useState(0);

  const bump = useCallback(() => setRev((v) => v + 1), []);

  const rows = useMemo(() => {
    let list = rolesService.list(role);
    if (filters.status !== 'any') {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [role, filters, rev]);

  const updateFilters = useCallback((patch: Partial<RoleListFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  return { rows, filters, updateFilters, bump };
}
