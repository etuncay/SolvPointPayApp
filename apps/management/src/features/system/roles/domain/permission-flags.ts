/** Ekran yetki matrisi kolonları */
export const PERMISSION_FLAG_KEYS = [
  'canList',
  'canView',
  'canInsert',
  'canUpdate',
  'canDelete',
  'canExport',
  'canFirstApprove',
  'canSecondApprove',
] as const;

export type PermissionFlagKey = (typeof PERMISSION_FLAG_KEYS)[number];

export type PermissionFlags = Record<PermissionFlagKey, boolean>;

export const EMPTY_PERMISSION_FLAGS: PermissionFlags = {
  canList: false,
  canView: false,
  canInsert: false,
  canUpdate: false,
  canDelete: false,
  canExport: false,
  canFirstApprove: false,
  canSecondApprove: false,
};

export function permissionFlagLabelKey(flag: PermissionFlagKey): string {
  const map: Record<PermissionFlagKey, string> = {
    canList: 'rol_perm_list',
    canView: 'rol_perm_view',
    canInsert: 'rol_perm_insert',
    canUpdate: 'rol_perm_update',
    canDelete: 'rol_perm_delete',
    canExport: 'rol_perm_export',
    canFirstApprove: 'ap_col_first_approver',
    canSecondApprove: 'ap_col_second_approver',
  };
  return map[flag];
}
