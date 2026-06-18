import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { useNavigationRole } from '@/hooks/use-navigation-role';
import { dashboardService } from '../api/dashboard-service';
import type { DashboardSnapshot, WidgetCode, WidgetDataMap } from '../domain/types';

type DashboardContextValue = {
  snapshot: DashboardSnapshot | null;
  loading: boolean;
  refreshCount: number;
  refresh: () => Promise<void>;
  getWidgetError: (code: WidgetCode) => string | undefined;
  getWidgetData: <K extends WidgetCode>(code: K) => WidgetDataMap[K] | null;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { navigationRole } = useNavigationRole();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const load = useCallback(
    async (count: number) => {
      setLoading(true);
      try {
        const next = await dashboardService.refreshAll(navigationRole as BackOfficeRole, count);
        setSnapshot(next);
      } finally {
        setLoading(false);
      }
    },
    [navigationRole],
  );

  useEffect(() => {
    void load(refreshCount);
  }, [navigationRole]); // eslint-disable-line react-hooks/exhaustive-deps -- rol değişince yeniden yükle

  const refresh = useCallback(async () => {
    const nextCount = refreshCount + 1;
    setRefreshCount(nextCount);
    await load(nextCount);
  }, [load, refreshCount]);

  const value = useMemo(
    () => ({
      snapshot,
      loading,
      refreshCount,
      refresh,
      getWidgetError: (code: WidgetCode) => snapshot?.errors[code],
      getWidgetData: <K extends WidgetCode>(code: K): WidgetDataMap[K] | null =>
        snapshot?.errors[code] ? null : (snapshot?.data[code] ?? null),
    }),
    [snapshot, loading, refreshCount, refresh],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard DashboardProvider içinde kullanılmalı');
  return ctx;
}

export function useWidgetData<K extends WidgetCode>(code: K) {
  const { getWidgetData, getWidgetError, loading, snapshot, refresh } = useDashboard();
  return {
    data: getWidgetData(code),
    error: getWidgetError(code),
    loading: loading && !snapshot,
    refreshedAt: snapshot?.refreshedAt,
    refresh,
  };
}
