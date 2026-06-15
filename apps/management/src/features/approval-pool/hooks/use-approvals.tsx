import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { getCurrentUser } from '../domain/current-user';
import type { ApprovalListFilter } from '../domain/types';
import { approvalsService } from '../api';

export function useApprovals(role: BackOfficeRole) {
  const user = useMemo(() => getCurrentUser(role), [role]);
  const [filter, setFilter] = useState<ApprovalListFilter>('pending_mine');

  const rows = useMemo(
    () => approvalsService.list(filter, user),
    [filter, user],
  );

  const pendingCount = useMemo(
    () => approvalsService.countPendingForUser(user),
    [user],
  );

  const setListFilter = useCallback((f: ApprovalListFilter) => setFilter(f), []);

  return {
    user,
    filter,
    setListFilter,
    rows,
    pendingCount,
  };
}
