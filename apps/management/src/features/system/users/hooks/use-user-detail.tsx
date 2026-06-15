import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { listAssignableRoles } from '@/mocks/roles-store';
import { usersService } from '../api/mock-users-adapter';
import type { AppUserDetail, UpdateRolePayload } from '../domain/types';

export function useUserDetail(role: BackOfficeRole, userId: string | undefined) {
  const [detail, setDetail] = useState<AppUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!userId) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const d = usersService.getById(role, userId);
    setDetail(d);
    setLoading(false);
  }, [role, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveRole = useCallback(
    async (performedBy: string, payload: UpdateRolePayload) => {
      if (!userId) return { ok: false as const, errorCode: 'usr_not_found' as const };
      const result = usersService.updateRole(role, performedBy, userId, payload);
      if (result.ok) setDetail(result.user);
      return result;
    },
    [role, userId],
  );

  const assignableRoles = useMemo(() => listAssignableRoles(), []);

  return { detail, loading, reload, saveRole, assignableRoles };
}
