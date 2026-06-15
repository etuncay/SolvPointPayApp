import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { bankReconciliationsService } from '../api';
import { getBankReconciliationPermissions } from '../domain/permissions';
import {
  DEFAULT_BANK_RECONCILIATION_FILTERS,
  type BankReconciliationFilters,
} from '../domain/types';

export function useBankReconciliations() {
  const { role } = useRole();
  const [filters, setFilters] = useState<BankReconciliationFilters>(
    DEFAULT_BANK_RECONCILIATION_FILTERS,
  );
  const [version, setVersion] = useState(0);
  const [runLoading, setRunLoading] = useState(false);

  const permissions = useMemo(() => getBankReconciliationPermissions(role), [role]);

  const rows = useMemo(
    () => bankReconciliationsService.list(filters, role),
    [filters, role, version],
  );

  const bankOptions = useMemo(() => {
    const banks = new Set(rows.map((r) => r.bank));
    return ['all', ...Array.from(banks).sort((a, b) => a.localeCompare(b, 'tr'))];
  }, [rows]);

  const updateFilters = useCallback((patch: Partial<BankReconciliationFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_BANK_RECONCILIATION_FILTERS);
  }, []);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const run = useCallback(async () => {
    setRunLoading(true);
    const result = bankReconciliationsService.run(role);
    setRunLoading(false);
    if (result.ok) refresh();
    return result;
  }, [role, refresh]);

  return {
    filters,
    updateFilters,
    resetFilters,
    rows,
    bankOptions,
    permissions,
    run,
    runLoading,
    refresh,
  };
}
