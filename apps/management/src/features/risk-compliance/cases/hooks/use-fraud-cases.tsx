import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { fraudCasesService } from '../api';
import { getFraudCasesPermissions } from '../domain/permissions';
import {
  DEFAULT_CASE_FILTERS,
  type CaseListFilters,
  type CaseQuickFilter,
} from '../domain/types';

export function useFraudCases() {
  const { role } = useRole();
  const [filters, setFilters] = useState<CaseListFilters>(DEFAULT_CASE_FILTERS);
  const [rev, setRev] = useState(0);
  const refresh = useCallback(() => setRev((v) => v + 1), []);

  const permissions = useMemo(() => getFraudCasesPermissions(role), [role]);

  const rows = useMemo(() => {
    void rev;
    return fraudCasesService.list(filters, role);
  }, [filters, role, rev]);

  const exportRows = useMemo(() => {
    void rev;
    return fraudCasesService.exportRows(filters, role);
  }, [filters, role, rev]);

  const setShowClosed = useCallback((showClosed: boolean) => {
    setFilters((f) => ({
      ...f,
      showClosed,
      quickFilter: showClosed ? 'closed' : f.quickFilter === 'closed' ? 'none' : f.quickFilter,
    }));
  }, []);

  const setQuickFilter = useCallback((quickFilter: CaseQuickFilter) => {
    setFilters((f) => ({
      ...f,
      quickFilter,
      showClosed: quickFilter === 'closed',
    }));
  }, []);

  const updateQuery = useCallback((query: string) => {
    setFilters((f) => ({ ...f, query }));
  }, []);

  return {
    filters,
    rows,
    exportRows,
    permissions,
    setShowClosed,
    setQuickFilter,
    updateQuery,
    refresh,
  };
}
