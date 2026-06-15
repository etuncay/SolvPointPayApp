import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { rolesService } from '../api/mock-roles-adapter';
import type {
  AppRoleStatus,
  RoleDetail,
  RoleFieldApprovalRow,
  ScreenPermissionRow,
} from '../domain/types';

export function useRoleDetail(role: BackOfficeRole, roleId: string | undefined) {
  const [detail, setDetail] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [permDraft, setPermDraft] = useState<ScreenPermissionRow[]>([]);
  const [fieldDraft, setFieldDraft] = useState<RoleFieldApprovalRow[]>([]);
  const [metaDraft, setMetaDraft] = useState<{
    name: string;
    description: string;
    status: AppRoleStatus;
  }>({ name: '', description: '', status: 'Active' });

  const reload = useCallback(() => {
    if (!roleId) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const d = rolesService.getById(role, roleId);
    setDetail(d);
    if (d) {
      setPermDraft(d.screenPermissions.map((p) => ({ ...p })));
      setFieldDraft(d.fieldApprovals.map((f) => ({ ...f })));
      setMetaDraft({
        name: d.role.name,
        description: d.role.description,
        status: d.role.status,
      });
    }
    setLoading(false);
  }, [role, roleId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const dirty = useMemo(() => {
    if (!detail) return false;
    if (
      metaDraft.name !== detail.role.name ||
      metaDraft.description !== detail.role.description ||
      metaDraft.status !== detail.role.status
    ) {
      return true;
    }
    if (JSON.stringify(permDraft) !== JSON.stringify(detail.screenPermissions)) return true;
    if (JSON.stringify(fieldDraft) !== JSON.stringify(detail.fieldApprovals)) return true;
    return false;
  }, [detail, metaDraft, permDraft, fieldDraft]);

  const patchPermission = useCallback(
    (screenId: string, flag: keyof ScreenPermissionRow, value: boolean) => {
      setPermDraft((rows) =>
        rows.map((r) => (r.screenId === screenId ? { ...r, [flag]: value } : r)),
      );
    },
    [],
  );

  const save = useCallback(async () => {
    if (!roleId || !detail) return { ok: false as const, errorCode: 'rol_not_found' };
    const result = rolesService.update(role, roleId, {
      name: metaDraft.name,
      description: metaDraft.description,
      status: metaDraft.status,
      screenPermissions: permDraft,
      fieldApprovals: fieldDraft,
    });
    if (result.ok) {
      setDetail(result.detail);
      setPermDraft(result.detail.screenPermissions.map((p) => ({ ...p })));
      setFieldDraft(result.detail.fieldApprovals.map((f) => ({ ...f })));
      setMetaDraft({
        name: result.detail.role.name,
        description: result.detail.role.description,
        status: result.detail.role.status,
      });
    }
    return result;
  }, [role, roleId, detail, metaDraft, permDraft, fieldDraft]);

  const setFieldApprovals = useCallback((rows: RoleFieldApprovalRow[]) => {
    setFieldDraft(rows);
  }, []);

  return {
    detail,
    loading,
    permDraft,
    fieldDraft,
    metaDraft,
    setMetaDraft,
    patchPermission,
    setFieldApprovals,
    dirty,
    save,
    reload,
  };
}
