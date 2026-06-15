import { useCallback, useMemo, useState } from 'react';
import { integratedBanksService } from '../api';
import {
  DEFAULT_INTEGRATED_BANK_FILTERS,
  type IntegratedBankFilters,
  type IntegratedBankInput,
  type IntegratedBankUpdateInput,
} from '../domain/types';

export function useIntegratedBanks() {
  const [filters, setFilters] = useState<IntegratedBankFilters>(DEFAULT_INTEGRATED_BANK_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(
    () => integratedBanksService.list(filters),
    [filters, version],
  );

  const allRows = useMemo(
    () => integratedBanksService.list({ query: '', status: 'any' }),
    [version],
  );

  const updateFilters = useCallback((patch: Partial<IntegratedBankFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const create = useCallback(
    (input: IntegratedBankInput) => {
      const result = integratedBanksService.create(input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const update = useCallback(
    (id: number, input: IntegratedBankUpdateInput) => {
      const result = integratedBanksService.update(id, input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const deactivate = useCallback(
    (id: number) => {
      const result = integratedBanksService.deactivate(id);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return { filters, updateFilters, rows, allRows, create, update, deactivate, refresh };
}
