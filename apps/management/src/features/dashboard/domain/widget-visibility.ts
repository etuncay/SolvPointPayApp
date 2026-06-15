import { DASHBOARD_WIDGET_VISIBILITY } from '@/mocks/dashboard-widget-visibility';
import type { DetailLevel } from './types';
import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { WidgetDef } from '../widget-registry';
import type { WidgetCode } from './types';

export type VisibleWidget = WidgetDef & { detailLevel: DetailLevel };

export function getWidgetDetailLevel(role: BackOfficeRole, code: WidgetCode): DetailLevel {
  if (isAllAccessRole(role)) return 'full';
  const row = DASHBOARD_WIDGET_VISIBILITY.find((v) => v.widget_code === code && v.role === role);
  return row?.detail_level ?? 'compact';
}

/** Rol + seed matrisine göre görünür widget listesi. */
export function resolveVisibleWidgets(role: BackOfficeRole, all: WidgetDef[]): VisibleWidget[] {
  if (isAllAccessRole(role)) {
    return all.map((w) => ({
      ...w,
      detailLevel: getWidgetDetailLevel(role, w.id as WidgetCode),
    }));
  }
  return all
    .filter((w) => {
      const row = DASHBOARD_WIDGET_VISIBILITY.find(
        (v) => v.widget_code === w.id && v.role === role,
      );
      if (row) return row.is_visible;
      return w.roles.includes(role);
    })
    .map((w) => ({
      ...w,
      detailLevel: getWidgetDetailLevel(role, w.id as WidgetCode),
    }));
}
