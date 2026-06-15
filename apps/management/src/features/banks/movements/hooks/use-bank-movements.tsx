import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { bankMovementsService } from '../api';
import { getBankMovementPermissions } from '../domain/permissions';
import { DEFAULT_BANK_MOVEMENT_FILTERS, type BankMovementFilters } from '../domain/types';

export function useBankMovements() {
  const { role } = useRole();
  const [filters, setFilters] = useState<BankMovementFilters>(DEFAULT_BANK_MOVEMENT_FILTERS);
  const [version, setVersion] = useState(0);

  const permissions = useMemo(() => getBankMovementPermissions(role), [role]);

  const rows = useMemo(
    () => bankMovementsService.list(filters, role),
    [filters, role, version],
  );

  const updateFilters = useCallback((patch: Partial<BankMovementFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_BANK_MOVEMENT_FILTERS);
  }, []);

  const exportRows = useCallback(
    () => bankMovementsService.exportRows(filters, role),
    [filters, role],
  );

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return {
    filters,
    updateFilters,
    resetFilters,
    rows,
    permissions,
    exportRows,
    refresh,
  };
}
