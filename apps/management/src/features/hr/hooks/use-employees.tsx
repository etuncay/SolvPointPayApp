import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { getHrCurrentUserExtras } from '@/domain/hr-persona';
import { employeesService } from '../api/mock-employees-adapter';
import type { EmployeeFilters, HrListScope } from '../domain/types';

export function useEmployees() {
  const { role } = useRole();
  const extras = getHrCurrentUserExtras(role);
  const [filters, setFilters] = useState<EmployeeFilters>({
    query: '',
    status: 'any',
    hireFrom: '',
    hireTo: '',
  });
  const [tick, setTick] = useState(0);

  const scope: HrListScope = useMemo(() => {
    if (extras.hrPersona === 'unit_manager' && extras.departmentId) {
      return { mode: 'department', departmentId: extras.departmentId };
    }
    return { mode: 'all' };
  }, [extras]);

  const rows = useMemo(
    () => employeesService.list(scope, filters),
    [scope, filters, tick],
  );

  return {
    rows,
    filters,
    scope,
    hrPersona: extras.hrPersona,
    updateFilters: useCallback((p: Partial<EmployeeFilters>) => {
      setFilters((f) => ({ ...f, ...p }));
    }, []),
    bump: useCallback(() => setTick((n) => n + 1), []),
  };
}
