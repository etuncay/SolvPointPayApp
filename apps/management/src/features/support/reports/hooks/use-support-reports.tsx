import { useCallback, useEffect, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { supportReportsService } from '../api/mock-support-reports-adapter';
import { getSupportReportPermissions } from '../domain/permissions';
import { panelResultToState } from '../domain/types';
import type { PanelState, ReportCode, SupportReportBundle } from '../domain/types';

export type SupportReportPanels = Partial<
  Record<ReportCode, PanelState<unknown> | undefined>
>;

export function useSupportReports() {
  const { role } = useRole();
  const user = getCurrentUser(role);
  const canView = getSupportReportPermissions(role).canView;
  const [bundle, setBundle] = useState<SupportReportBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReportCode, setActiveReportCode] = useState<ReportCode | null>(null);

  const load = useCallback(async () => {
    if (!canView) {
      setBundle(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const next = await supportReportsService.getAll(role, user.id);
      setBundle(next);
    } catch {
      setBundle({ panels: {} });
    }
    setLoading(false);
  }, [canView, role, user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const panels: SupportReportPanels = {};
  if (bundle) {
    for (const code of Object.keys(bundle.panels) as ReportCode[]) {
      const raw = bundle.panels[code];
      panels[code] = panelResultToState(raw as never) ?? (loading ? { status: 'loading' } : undefined);
    }
  } else if (loading && canView) {
    for (const code of ['by-complaint-type', 'by-case-age', 'customers-by-cases', 'agents-by-cases'] as ReportCode[]) {
      panels[code] = { status: 'loading' };
    }
  }

  return {
    canView,
    panels,
    loading,
    refresh: load,
    activeReportCode,
    setActiveReportCode,
  };
}
