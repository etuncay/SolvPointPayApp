import { useCallback, useMemo, useState } from 'react';
import { customersService } from '../api/customers-service';
import {
  DEFAULT_CUSTOMER_FILTERS,
  type CustomerFilters,
  type CustomerListItem,
} from '../domain/types';

export function useCustomers(initialFilters: CustomerFilters = DEFAULT_CUSTOMER_FILTERS) {
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const result = useMemo(
    () => customersService.list(filters),
    [filters, version],
  );

  const exportRows = useCallback(() => customersService.exportRows(filters), [filters, version]);

  const softDelete = useCallback(
    (id: number) => {
      customersService.softDelete(id);
      refresh();
    },
    [refresh],
  );

  const restoreInactive = useCallback(
    (id: number) => {
      customersService.restoreInactive(id);
      refresh();
    },
    [refresh],
  );

  const updateFilters = useCallback((patch: Partial<CustomerFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    filters,
    setFilters,
    updateFilters,
    rows: result.rows as CustomerListItem[],
    total: result.total,
    counts: result.counts,
    exportRows,
    softDelete,
    restoreInactive,
    refresh,
  };
}
