import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { parametersService } from '../api/mock-parameters-adapter';
import { DEFAULT_PARAMETER_FILTERS, type ParameterFilters, type SystemParameter } from '../domain/types';

export type RowDraft = {
  value: string;
  status: SystemParameter['status'];
};

export function useParameters(role: BackOfficeRole) {
  const [filters, setFilters] = useState<ParameterFilters>(DEFAULT_PARAMETER_FILTERS);
  const [rev, setRev] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});

  const bump = useCallback(() => {
    setRev((v) => v + 1);
    setDrafts({});
  }, []);

  const rows = useMemo(
    () => parametersService.list(role, filters),
    [role, filters, rev],
  );

  const updateFilters = useCallback((patch: Partial<ParameterFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const initDraft = useCallback((row: SystemParameter) => {
    setDrafts((prev) => ({
      ...prev,
      [row.id]: prev[row.id] ?? { value: row.value, status: row.status },
    }));
  }, []);

  const patchDraft = useCallback((id: string, patch: Partial<RowDraft>) => {
    setDrafts((prev) => {
      const base = prev[id];
      if (!base) return prev;
      return { ...prev, [id]: { ...base, ...patch } };
    });
  }, []);

  const isDirty = useCallback(
    (row: SystemParameter) => {
      const d = drafts[row.id];
      if (!d) return false;
      return d.value !== row.value || d.status !== row.status;
    },
    [drafts],
  );

  const cancelRow = useCallback((id: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const getDraft = useCallback(
    (row: SystemParameter): RowDraft => drafts[row.id] ?? { value: row.value, status: row.status },
    [drafts],
  );

  return {
    rows,
    filters,
    updateFilters,
    bump,
    initDraft,
    patchDraft,
    isDirty,
    cancelRow,
    getDraft,
  };
}
