import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { getHrCurrentUserExtras } from '@/domain/hr-persona';
import { getHrLeaveParams } from '../domain/hr-leave-params';
import { resolveLeaveListScope } from '../domain/leave-scope-filter';
import { countLeaveRows, createEmployeeLeavesService } from '../api/mock-employee-leaves-adapter';
import type { LeaveFilters } from '../domain/types';

const CURRENT_YEAR = new Date().getFullYear();

export function useLeaves() {
  const { role } = useRole();
  const extras = getHrCurrentUserExtras(role);
  const scope = resolveLeaveListScope(extras);
  const service = useMemo(() => createEmployeeLeavesService(role), [role]);

  const [filters, setFilters] = useState<LeaveFilters>({
    query: '',
    leaveType: 'any',
    taskStatus: 'any',
    departmentId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [tick, setTick] = useState(0);

  const rows = useMemo(() => {
    if (!scope) return [];
    void tick;
    return service.list(scope, filters);
  }, [scope, filters, tick, service]);

  const totalMatching = useMemo(() => {
    if (!scope) return 0;
    void tick;
    return countLeaveRows(scope, filters);
  }, [scope, filters, tick]);

  const maxRows = getHrLeaveParams().leaveReportMaxRows;
  const truncated = totalMatching > maxRows;

  const summary = useMemo(() => {
    if (!extras.employeeId) return null;
    void tick;
    return service.getSummary(extras.employeeId, CURRENT_YEAR);
  }, [extras.employeeId, tick, service]);

  return {
    rows,
    filters,
    scope,
    extras,
    summary,
    truncated,
    maxRows,
    year: CURRENT_YEAR,
    updateFilters: useCallback((p: Partial<LeaveFilters>) => {
      setFilters((f) => ({ ...f, ...p }));
    }, []),
    bump: useCallback(() => setTick((n) => n + 1), []),
  };
}
