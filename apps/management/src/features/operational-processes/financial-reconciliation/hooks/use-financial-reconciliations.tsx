import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { financialReconciliationsService } from '../api';
import { getFinancialReconciliationPermissions } from '../domain/permissions';
import {
  DEFAULT_FIN_RECON_FILTERS,
  type FinancialReconciliation,
  type FinancialReconciliationFilters,
} from '../domain/types';

export function useFinancialReconciliations() {
  const { role } = useRole();
  const [filters, setFilters] = useState<FinancialReconciliationFilters>(DEFAULT_FIN_RECON_FILTERS);
  const [version, setVersion] = useState(0);
  const [runLoading, setRunLoading] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<FinancialReconciliation | null>(null);

  const permissions = useMemo(() => getFinancialReconciliationPermissions(role), [role]);

  const rows = useMemo(
    () => financialReconciliationsService.list(filters, role),
    [filters, role, version],
  );

  const updateFilters = useCallback((patch: Partial<FinancialReconciliationFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FIN_RECON_FILTERS);
  }, []);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const run = useCallback(async () => {
    setRunLoading(true);
    const result = financialReconciliationsService.run(role);
    setRunLoading(false);
    if (result.ok) refresh();
    return result;
  }, [role, refresh]);

  const openAdjust = useCallback((row: FinancialReconciliation) => {
    if (row.status === 'PendingReview') setAdjustTarget(row);
  }, []);

  const closeAdjust = useCallback(() => setAdjustTarget(null), []);

  const adjust = useCallback(
    async (description: string) => {
      if (!adjustTarget) return { ok: false as const, error: 'finrec_not_found' as const };
      setAdjustLoading(true);
      const result = financialReconciliationsService.adjust(adjustTarget.id, description, role);
      setAdjustLoading(false);
      if (result.ok) {
        setAdjustTarget(null);
        refresh();
      }
      return result;
    },
    [adjustTarget, role, refresh],
  );

  return {
    filters,
    updateFilters,
    resetFilters,
    rows,
    permissions,
    run,
    runLoading,
    refresh,
    adjustTarget,
    openAdjust,
    closeAdjust,
    adjust,
    adjustLoading,
  };
}
