import { beforeEach, describe, expect, it } from 'vitest';
import { resetEmployeesListStore } from '@/mocks/employees';
import { employeesService } from './mock-employees-adapter';

describe('mock-employees-adapter', () => {
  beforeEach(() => {
    resetEmployeesListStore();
    employeesService.resetAccessLog();
  });

  it('lists all employees for all scope', () => {
    const rows = employeesService.list({ mode: 'all' }, {
      query: '',
      status: 'any',
      hireFrom: '',
      hireTo: '',
    });
    expect(rows.length).toBeGreaterThanOrEqual(6);
  });

  it('department scope returns only dept-ops', () => {
    const rows = employeesService.list({ mode: 'department', departmentId: 'dept-ops' }, {
      query: '',
      status: 'any',
      hireFrom: '',
      hireTo: '',
    });
    expect(rows.every((r) => r.departmentId === 'dept-ops')).toBe(true);
    expect(rows.some((r) => r.employeeId === 'emp-001')).toBe(true);
  });

  it('filters by employment status', () => {
    const rows = employeesService.list({ mode: 'all' }, {
      query: '',
      status: 'Terminated',
      hireFrom: '',
      hireTo: '',
    });
    expect(rows.every((r) => r.employmentStatus === 'Terminated')).toBe(true);
  });

  it('getListRow respects scope', () => {
    const inScope = employeesService.getListRow('emp-001', {
      mode: 'department',
      departmentId: 'dept-ops',
    });
    const outScope = employeesService.getListRow('emp-002', {
      mode: 'department',
      departmentId: 'dept-ops',
    });
    expect(inScope?.employeeId).toBe('emp-001');
    expect(outScope).toBeNull();
  });

  it('records access log on list', () => {
    employeesService.list({ mode: 'all' }, {
      query: '',
      status: 'any',
      hireFrom: '',
      hireTo: '',
    });
    expect(employeesService.getAccessLog().length).toBe(1);
  });
});
