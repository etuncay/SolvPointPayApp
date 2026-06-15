import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { walletsService } from '../api';
import { getWalletActivityPermissions } from '../domain/activity-permissions';
import { DEFAULT_WALLET_ACTIVITY_FILTERS, type WalletActivity, type WalletActivityFilters } from '../domain/activity-types';

export function useWalletActivities() {
  const { walletId: walletIdParam } = useParams();
  const walletId = Number(walletIdParam);
  const { role } = useRole();
  const [filters, setFilters] = useState<WalletActivityFilters>(DEFAULT_WALLET_ACTIVITY_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const permissions = useMemo(() => getWalletActivityPermissions(role), [role]);

  const wallet = useMemo(
    () => (Number.isFinite(walletId) ? walletsService.getById(walletId, role) : null),
    [walletId, role, version],
  );

  const listResult = useMemo(
    () =>
      Number.isFinite(walletId)
        ? walletsService.listActivities(walletId, filters, role)
        : { ok: false as const, error: 'wa_not_found' as const },
    [walletId, filters, role, version],
  );

  const rows = listResult.ok ? listResult.rows : [];
  const forbidden = !listResult.ok && listResult.error === 'wa_wallet_forbidden';
  const notFound = !listResult.ok && listResult.error === 'wa_not_found';

  const updateFilters = useCallback((patch: Partial<WalletActivityFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_WALLET_ACTIVITY_FILTERS), []);

  const exportRows = useCallback((): { ok: true; rows: WalletActivity[] } | { ok: false; error: string } => {
    const result = walletsService.exportActivities(walletId, filters, role);
    if (!Array.isArray(result)) {
      return { ok: false, error: result.error };
    }
    return { ok: true, rows: result };
  }, [walletId, filters, role]);

  return {
    walletId,
    wallet,
    filters,
    updateFilters,
    resetFilters,
    rows,
    permissions,
    forbidden,
    notFound,
    exportRows,
    refresh,
  };
}
