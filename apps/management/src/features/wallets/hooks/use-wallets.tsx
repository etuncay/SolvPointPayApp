import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { walletsService } from '../api';
import { getWalletPermissions } from '../domain/permissions';
import { getVisibleCategories } from '../domain/role-visibility';
import { DEFAULT_WALLET_FILTERS, type WalletFilters } from '../domain/types';

export function useWallets() {
  const { role } = useRole();
  const [filters, setFilters] = useState<WalletFilters>(DEFAULT_WALLET_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const permissions = useMemo(() => getWalletPermissions(role), [role]);
  const visibleCategories = useMemo(() => getVisibleCategories(role), [role]);

  const rows = useMemo(
    () => walletsService.list(filters, role),
    [filters, role, version],
  );

  const rowsWithoutCcyFilter = useMemo(
    () => walletsService.list({ ...filters, ccy: 'all' }, role),
    [filters, role, version],
  );

  const stats = useMemo(
    () => walletsService.getStats(role),
    [role, version],
  );

  const updateFilters = useCallback((patch: Partial<WalletFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const exportRows = useCallback(() => walletsService.exportRows(filters, role), [filters, role]);

  const resetFilters = useCallback(() => setFilters(DEFAULT_WALLET_FILTERS), []);

  return {
    role,
    filters,
    updateFilters,
    resetFilters,
    rows,
    rowsWithoutCcyFilter,
    stats,
    permissions,
    visibleCategories,
    exportRows,
    refresh,
  };
}
