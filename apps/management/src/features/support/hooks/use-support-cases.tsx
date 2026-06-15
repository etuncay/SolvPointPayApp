import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { supportCasesService } from '../api/mock-support-cases-adapter';
import {
  DEFAULT_SUPPORT_CASE_FILTERS,
  type CaseStatus,
  type SupportCaseFilters,
} from '../domain/types';
import {
  matchesStatusChip,
  type SupportCaseStatusChip,
} from '../domain/support-case-status-groups';

export type SupportCaseStatusCounts = Record<SupportCaseStatusChip, number>;

function countByChip(cases: { caseStatus: CaseStatus }[]): SupportCaseStatusCounts {
  const counts: SupportCaseStatusCounts = {
    open: 0,
    resolved: 0,
    rejected: 0,
    reOpened: 0,
    all: cases.length,
  };
  for (const c of cases) {
    if (matchesStatusChip(c.caseStatus, 'open')) counts.open++;
    if (matchesStatusChip(c.caseStatus, 'resolved')) counts.resolved++;
    if (matchesStatusChip(c.caseStatus, 'rejected')) counts.rejected++;
    if (matchesStatusChip(c.caseStatus, 'reOpened')) counts.reOpened++;
  }
  return counts;
}

/** Gelişmiş filtreler uygulanmış, durum chip'i hariç taban liste */
function listForCounts(
  role: BackOfficeRole,
  userId: string,
  filters: SupportCaseFilters,
) {
  return supportCasesService.list(role, userId, {
    ...filters,
    status: 'all',
  });
}

export function useSupportCases(role: BackOfficeRole) {
  const user = useMemo(() => getCurrentUser(role), [role]);
  const [filters, setFilters] = useState<SupportCaseFilters>(DEFAULT_SUPPORT_CASE_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);

  const updateFilters = useCallback((patch: Partial<SupportCaseFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const rows = useMemo(
    () => supportCasesService.list(role, user.id, filters),
    [role, user.id, filters, refreshKey],
  );

  const counts = useMemo(() => {
    void refreshKey;
    const base = listForCounts(role, user.id, filters);
    return countByChip(
      base.map((r) => ({ caseStatus: r.caseStatus })),
    );
  }, [role, user.id, filters, refreshKey]);

  const clearAdvancedFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      complaintType: 'any',
      urgency: 'any',
      criticality: 'any',
      ownerUserId: 'any',
      createdFrom: '',
      createdTo: '',
      updatedFrom: '',
      updatedTo: '',
      assignedToMe: false,
    }));
  }, []);

  return {
    filters,
    updateFilters,
    rows,
    counts,
    total: rows.length,
    user,
    refreshKey,
    bumpRefresh,
    clearAdvancedFilters,
  };
}
