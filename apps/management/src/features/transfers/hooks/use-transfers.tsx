import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { transactionsService } from '../api';
import { getTransactionPermissions } from '../domain/permissions';
import { mapUrlStatus } from '../domain/status-map';
import { DEFAULT_TRANSACTION_FILTERS, type TransactionFilters, type TransactionListItem } from '../domain/types';

export function useTransfers() {
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<TransactionFilters>(() => ({
    ...DEFAULT_TRANSACTION_FILTERS,
    status: mapUrlStatus(searchParams.get('status')),
  }));
  const [version, setVersion] = useState(0);
  const [rows, setRows] = useState<TransactionListItem[]>([]);
  const [stats, setStats] = useState({ pending: 0, onHold: 0, todayCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlStatus = mapUrlStatus(searchParams.get('status'));
    if (urlStatus !== filters.status) {
      setFilters((prev) => ({ ...prev, status: urlStatus }));
    }
  }, [searchParams, filters.status]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      transactionsService.list(filters, role),
      transactionsService.getStats(role),
    ]).then(([nextRows, nextStats]) => {
      if (cancelled) return;
      setRows(nextRows);
      setStats(nextStats);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [filters, role, version]);

  const permissions = useMemo(() => getTransactionPermissions(role), [role]);

  const highlightId = searchParams.get('id');

  const updateFilters = useCallback(
    (patch: Partial<TransactionFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
        if (patch.status !== undefined) {
          const params = new URLSearchParams(searchParams);
          if (next.status === 'all') params.delete('status');
          else {
            const reverse: Record<string, string> = {
              Pending: 'pending',
              OnHold: 'aml',
              Canceled: 'rejected',
            };
            params.set('status', reverse[next.status] ?? next.status);
          }
          setSearchParams(params, { replace: true });
        }
        return next;
      });
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_TRANSACTION_FILTERS);
    const params = new URLSearchParams(searchParams);
    params.delete('status');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const exportRows = useCallback(
    () => transactionsService.exportRows(filters, role),
    [filters, role],
  );

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return {
    filters,
    updateFilters,
    resetFilters,
    rows,
    stats,
    permissions,
    exportRows,
    refresh,
    highlightId,
    loading,
  };
}
