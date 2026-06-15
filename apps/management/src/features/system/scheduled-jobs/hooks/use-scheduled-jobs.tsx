import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { scheduledJobsService } from '../api/mock-scheduled-jobs-adapter';
import type { JobFilters } from '../domain/types';

export function useScheduledJobs(role: BackOfficeRole) {
  const [filters, setFilters] = useState<JobFilters>({
    query: '',
    status: 'any',
    jobType: 'any',
  });
  const [tick, setTick] = useState(0);

  const rows = useMemo(
    () => scheduledJobsService.list(role, filters),
    [role, filters, tick],
  );

  const bump = useCallback(() => setTick((n) => n + 1), []);

  const updateFilters = useCallback((patch: Partial<JobFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  return { rows, filters, updateFilters, bump };
}
