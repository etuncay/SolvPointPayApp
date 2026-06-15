import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { getVisibleReportCodes } from '../domain/report-permissions';
import { riskComplianceService } from '../api';
import type { ReportCode, RiskDashboardPanels } from '../domain/types';

export function useRiskDashboard() {
  const { role } = useRole();
  const [searchParams] = useSearchParams();
  const [panels, setPanels] = useState<RiskDashboardPanels>({});
  const [loading, setLoading] = useState(true);

  const simulateError = searchParams.get('simulateError') as ReportCode | null;
  const visibleCodes = getVisibleReportCodes(role);

  const load = useCallback(async () => {
    if (visibleCodes.length === 0) {
      setPanels({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const next = await riskComplianceService.getDashboard(role, {
      simulateError: simulateError ?? undefined,
    });
    setPanels(next);
    setLoading(false);
  }, [role, simulateError, visibleCodes.length]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    panels,
    loading,
    visibleCodes,
    refresh: load,
  };
}
