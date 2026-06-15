import { describe, expect, it } from 'vitest';
import { applyEmployeeScope } from './scope-filter';
import type { EmployeeListRow } from './types';

const row = (id: string, dept: string): EmployeeListRow => ({
  employeeId: id,
  personId: `per-${id}`,
  fullName: id,
  title: 'T',
  departmentId: dept,
  departmentName: dept,
  primaryEmail: `${id}@x.demo`,
  primaryPhone: '+90',
  hireDate: '2024-01-01',
  employmentStatus: 'Active',
  userNo: null,
});

describe('applyEmployeeScope', () => {
  const rows = [row('emp-001', 'dept-ops'), row('emp-002', 'dept-compliance')];

  it('all returns every row', () => {
    expect(applyEmployeeScope(rows, { mode: 'all' })).toHaveLength(2);
  });

  it('department filters by departmentId', () => {
    const scoped = applyEmployeeScope(rows, { mode: 'department', departmentId: 'dept-ops' });
    expect(scoped).toHaveLength(1);
    expect(scoped[0]!.employeeId).toBe('emp-001');
  });
});
