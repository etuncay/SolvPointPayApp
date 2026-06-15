import { useCallback, useMemo, useState } from 'react';
import { customerFeesService } from '../api';
import {
  DEFAULT_FEE_FILTERS,
  type CustomerFeeFilters,
  type CustomerFeeInput,
} from '../domain/types';

export function useCustomerFees() {
  const [filters, setFilters] = useState<CustomerFeeFilters>(DEFAULT_FEE_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(
    () => customerFeesService.list(filters),
    [filters, version],
  );

  const updateFilters = useCallback((patch: Partial<CustomerFeeFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const create = useCallback(
    (input: CustomerFeeInput) => {
      const result = customerFeesService.create(input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const update = useCallback(
    (id: number, input: CustomerFeeInput) => {
      const result = customerFeesService.update(id, input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return { filters, updateFilters, rows, create, update, refresh, version };
}
