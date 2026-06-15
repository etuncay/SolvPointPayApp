import type { DetailLevel, WidgetCode, WidgetVisibility } from '@/features/dashboard/domain/types';

export type { DetailLevel, WidgetVisibility };

export type DashboardWidgetVisibilityRow = WidgetVisibility;

/** Spec §10 — widget × rol görünürlük matrisi (registry roles ile hizalı). */
export const DASHBOARD_WIDGET_VISIBILITY: DashboardWidgetVisibilityRow[] = [
  { widget_code: 'my_approvals', role: 'ops', is_visible: true, detail_level: 'compact' },
  { widget_code: 'my_approvals', role: 'finance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'my_approvals', role: 'compliance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'my_approvals', role: 'management', is_visible: true, detail_level: 'full' },

  { widget_code: 'pending_xfer', role: 'ops', is_visible: true, detail_level: 'compact' },
  { widget_code: 'pending_xfer', role: 'management', is_visible: true, detail_level: 'full' },

  { widget_code: 'kyc_manual', role: 'ops', is_visible: true, detail_level: 'compact' },
  { widget_code: 'kyc_manual', role: 'compliance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'kyc_manual', role: 'management', is_visible: true, detail_level: 'full' },

  { widget_code: 'aml_held', role: 'compliance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'aml_held', role: 'ops', is_visible: true, detail_level: 'compact' },
  { widget_code: 'aml_held', role: 'management', is_visible: true, detail_level: 'full' },

  { widget_code: 'rejected', role: 'ops', is_visible: true, detail_level: 'compact' },
  { widget_code: 'rejected', role: 'compliance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'rejected', role: 'finance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'rejected', role: 'management', is_visible: true, detail_level: 'full' },

  { widget_code: 'daily_volume', role: 'finance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'daily_volume', role: 'management', is_visible: true, detail_level: 'full' },

  { widget_code: 'new_customers', role: 'finance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'new_customers', role: 'management', is_visible: true, detail_level: 'full' },

  { widget_code: 'top_customers', role: 'finance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'top_customers', role: 'management', is_visible: true, detail_level: 'full' },
  { widget_code: 'top_customers', role: 'ops', is_visible: true, detail_level: 'compact' },

  { widget_code: 'top_agents', role: 'finance', is_visible: true, detail_level: 'compact' },
  { widget_code: 'top_agents', role: 'management', is_visible: true, detail_level: 'full' },
  { widget_code: 'top_agents', role: 'ops', is_visible: true, detail_level: 'compact' },

  { widget_code: 'sys_health', role: 'management', is_visible: true, detail_level: 'full' },
];
