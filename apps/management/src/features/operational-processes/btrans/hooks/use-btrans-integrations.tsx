import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { btransIntegrationsService } from '../api';
import { getBtransPermissions } from '../domain/permissions';
import type {
  BtransIntegrationDetail,
  BtransIntegrationFilters,
  BtransIntegrationRow,
} from '../domain/types';

const DEFAULT_FILTERS: BtransIntegrationFilters = {
  status: 'all',
  reportName: 'all',
  dateFrom: '',
  dateTo: '',
};

export function useBtransIntegrations(role: BackOfficeRole) {
  const [filters, setFilters] = useState<BtransIntegrationFilters>(DEFAULT_FILTERS);
  const [tick, setTick] = useState(0);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const permissions = getBtransPermissions(role);

  const rows = useMemo(() => {
    void tick;
    return btransIntegrationsService.list(filters, role);
  }, [filters, role, tick]);

  const detail = useMemo((): BtransIntegrationDetail | null => {
    void tick;
    if (!drawerId) return null;
    return btransIntegrationsService.getById(drawerId, role);
  }, [drawerId, role, tick]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const updateFilters = useCallback((patch: Partial<BtransIntegrationFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const openDrawer = useCallback((id: string) => setDrawerId(id), []);
  const closeDrawer = useCallback(() => setDrawerId(null), []);

  const retry = useCallback(
    (id: string) => {
      const result = btransIntegrationsService.retry(id, role);
      if (result.ok) refresh();
      return result;
    },
    [role, refresh],
  );

  const hold = useCallback(
    (id: string) => {
      const result = btransIntegrationsService.hold(id, role);
      if (result.ok) refresh();
      return result;
    },
    [role, refresh],
  );

  const cancel = useCallback(
    (id: string) => {
      const result = btransIntegrationsService.cancel(id, role);
      if (result.ok) refresh();
      return result;
    },
    [role, refresh],
  );

  return {
    filters,
    updateFilters,
    resetFilters,
    rows,
    detail,
    permissions,
    openDrawer,
    closeDrawer,
    drawerOpen: drawerId != null,
    retry,
    hold,
    cancel,
    refresh,
    showAdvanced,
    setShowAdvanced,
  };
}

export type { BtransIntegrationRow };
