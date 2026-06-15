import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { accountingIntegrationsService } from '../api';
import { getTransactionLinkLabel } from '../api/mock-accounting-integrations-adapter';
import { getAccountingPermissions } from '../domain/permissions';
import type {
  AccountingIntegrationDetail,
  AccountingIntegrationFilters,
  AccountingIntegrationRow,
} from '../domain/types';

const DEFAULT_FILTERS: AccountingIntegrationFilters = { query: '', status: 'all' };

export function useAccountingIntegrations(role: BackOfficeRole) {
  const [filters, setFilters] = useState<AccountingIntegrationFilters>(DEFAULT_FILTERS);
  const [tick, setTick] = useState(0);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const permissions = getAccountingPermissions(role);

  const rows = useMemo(() => {
    void tick;
    return accountingIntegrationsService.list(filters, role);
  }, [filters, role, tick]);

  const detail = useMemo((): AccountingIntegrationDetail | null => {
    void tick;
    if (!drawerId) return null;
    return accountingIntegrationsService.getById(drawerId, role);
  }, [drawerId, role, tick]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const updateFilters = useCallback((patch: Partial<AccountingIntegrationFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const openDrawer = useCallback((id: string) => setDrawerId(id), []);
  const closeDrawer = useCallback(() => setDrawerId(null), []);

  const retry = useCallback(
    (id: string) => {
      const result = accountingIntegrationsService.retry(id, role);
      if (result.ok) refresh();
      return result;
    },
    [role, refresh],
  );

  const hold = useCallback(
    (id: string) => {
      const result = accountingIntegrationsService.hold(id, role);
      if (result.ok) refresh();
      return result;
    },
    [role, refresh],
  );

  const cancel = useCallback(
    (id: string) => {
      const result = accountingIntegrationsService.cancel(id, role);
      if (result.ok) refresh();
      return result;
    },
    [role, refresh],
  );

  const transactionLinkLabel = drawerId ? getTransactionLinkLabel(detail?.transactionId ?? '') : undefined;

  return {
    filters,
    updateFilters,
    rows,
    detail,
    permissions,
    openDrawer,
    closeDrawer,
    drawerOpen: drawerId != null,
    retry,
    hold,
    cancel,
    transactionLinkLabel,
    refresh,
  };
}

export type { AccountingIntegrationRow };
