import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { integrationsService } from '../api/mock-integrations-adapter';
import type { IntegrationFilters } from '../domain/types';

export function useIntegrations(role: BackOfficeRole) {
  const [filters, setFilters] = useState<IntegrationFilters>({
    query: '',
    type: 'any',
    status: 'any',
  });
  const [tick, setTick] = useState(0);

  const rows = useMemo(
    () => integrationsService.list(role, filters),
    [role, filters, tick],
  );

  return {
    rows,
    filters,
    updateFilters: useCallback((p: Partial<IntegrationFilters>) => {
      setFilters((f) => ({ ...f, ...p }));
    }, []),
    bump: useCallback(() => setTick((n) => n + 1), []),
  };
}
