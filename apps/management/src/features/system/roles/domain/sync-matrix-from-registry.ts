import { BACKOFFICE_SCREENS } from '@/features/system/shared/screen-registry';
import type { ScreenPermissionRow } from './types';

/** Registry ile mevcut matrisi birleştirir — eksik ekran false, fazla satır korunur */
export function mergeScreenPermissions(
  existing: ScreenPermissionRow[],
  roleId: string,
): ScreenPermissionRow[] {
  const byScreenId = new Map(existing.map((r) => [r.screenId, r]));
  const merged: ScreenPermissionRow[] = [];

  for (const def of BACKOFFICE_SCREENS) {
    const prev = byScreenId.get(def.screenId);
    if (prev) {
      merged.push(prev);
      byScreenId.delete(def.screenId);
    } else {
      merged.push({
        id: `rsp-${roleId}-${def.screenId}`,
        roleId,
        screenId: def.screenId,
        screenKey: def.screenKey,
        moduleLabelKey: def.moduleLabelKey,
        screenLabelKey: def.labelKey,
        canList: false,
        canView: false,
        canInsert: false,
        canUpdate: false,
        canDelete: false,
        canExport: false,
        canFirstApprove: false,
        canSecondApprove: false,
      });
    }
  }

  for (const orphan of byScreenId.values()) {
    merged.push(orphan);
  }

  return merged.sort((a, b) => a.screenLabelKey.localeCompare(b.screenLabelKey, 'tr'));
}
