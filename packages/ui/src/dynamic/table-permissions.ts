import type { TablePermissions } from './types';

/** Yeni kayıt — opt-out: undefined izinli; insert/new false ise kapalı */
export function canTableNew(permissions?: TablePermissions): boolean {
  if (!permissions) return true;
  if (permissions.new === false || permissions.insert === false) return false;
  return true;
}

/** Dışa aktar — opt-out */
export function canTableExport(permissions?: TablePermissions): boolean {
  if (!permissions) return true;
  if (permissions.export === false) return false;
  return true;
}

export function canTableView(permissions?: TablePermissions): boolean {
  if (!permissions) return true;
  if (permissions.view === false) return false;
  return true;
}

export function canTableEdit(permissions?: TablePermissions): boolean {
  if (!permissions) return true;
  if (permissions.edit === false || permissions.update === false) return false;
  return true;
}

export function canTableDelete(permissions?: TablePermissions): boolean {
  if (!permissions) return true;
  if (permissions.delete === false) return false;
  return true;
}

/** Özel toolbar butonu — permission tanımlıysa o anahtar false olmamalı */
export function canToolbarButton(
  permissions: TablePermissions | undefined,
  permission?: keyof TablePermissions,
): boolean {
  if (!permission) return true;
  if (!permissions) return true;
  const v = permissions[permission];
  if (v === false) return false;
  return true;
}
