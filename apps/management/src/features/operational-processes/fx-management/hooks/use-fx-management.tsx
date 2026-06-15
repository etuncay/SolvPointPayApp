import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { fxService } from '../api';
import { setTcmbSimulateError } from '../api/tcmb-source';
import { getFxPermissions } from '../domain/permissions';
import type { FxMarginDraft, FxRateFilters } from '../domain/types';
import { todayRateDate } from '../domain/work-hours';

function marginsToDraft(rows: ReturnType<typeof fxService.getSnapshot>['margins']): FxMarginDraft {
  return {
    rows: rows.map(
      ({
        currency,
        workHours,
        buyFixedMargin,
        buyVariableMarginPct,
        sellFixedMargin,
        sellVariableMarginPct,
        roundingDecimals,
      }) => ({
        currency,
        workHours,
        buyFixedMargin,
        buyVariableMarginPct,
        sellFixedMargin,
        sellVariableMarginPct,
        roundingDecimals,
      }),
    ),
  };
}

export function useFxManagement() {
  const { role } = useRole();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setTcmbSimulateError(searchParams.get('simulateTcmbError') === '1');
  }, [searchParams]);

  const permissions = useMemo(() => getFxPermissions(role), [role]);
  const [version, setVersion] = useState(0);
  const [rateFilters, setRateFilters] = useState<FxRateFilters>({ rateDate: todayRateDate() });
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const snapshot = useMemo(
    () => fxService.getSnapshot(role, rateFilters),
    [role, rateFilters, version],
  );

  const defaultDraft = useMemo(() => marginsToDraft(snapshot.margins), [snapshot.margins]);

  const form = useForm<FxMarginDraft>({
    defaultValues: defaultDraft,
    values: defaultDraft,
  });

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const resetForm = useCallback(() => {
    form.reset(marginsToDraft(snapshot.margins));
  }, [form, snapshot.margins]);

  const refreshRates = useCallback(async () => {
    setRefreshLoading(true);
    const result = fxService.refreshRates(role);
    setRefreshLoading(false);
    refresh();
    return result;
  }, [role, refresh]);

  const submitMargins = useCallback(
    async (draft: FxMarginDraft) => {
      setSaveLoading(true);
      const result = fxService.submitMargins(draft, role);
      setSaveLoading(false);
      if (result.ok) refresh();
      return result;
    },
    [role, refresh],
  );

  const updateRateDateFilter = useCallback((rateDate: string) => {
    setRateFilters({ rateDate });
  }, []);

  const formDisabled = !permissions.editMargins || snapshot.pendingApprovalId != null;

  return {
    permissions,
    snapshot,
    form,
    formDisabled,
    pendingApprovalId: snapshot.pendingApprovalId,
    pendingApprovalRef: snapshot.pendingApprovalRef,
    rateFilters,
    updateRateDateFilter,
    refreshRates,
    refreshLoading,
    submitMargins,
    saveLoading,
    resetForm,
    refresh,
    isDirty: form.formState.isDirty,
  };
}
