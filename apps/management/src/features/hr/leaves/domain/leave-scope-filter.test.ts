import { describe, expect, it } from 'vitest';
import { applyLeaveScope, resolveLeaveListScope } from './leave-scope-filter';
import type { EmployeeLeaveListRow } from './types';

const row = (employeeId: string, dept: string): EmployeeLeaveListRow => ({
  id: 'LV-1',
  employeeId,
  leaveType: 'AnnualLeave',
  startDate: '2026-01-01',
  endDate: '2026-01-02',
  totalDays: 1,
  workingDays: 1,
  notes: null,
  taskStatus: 'Approved',
  recordStatus: 1,
  createdAt: '',
  createdBy: '',
  approvalRequestId: null,
  cancelType: 'none',
  originalStartDate: null,
  originalEndDate: null,
  firstName: 'A',
  lastName: 'B',
  departmentId: dept,
  departmentName: dept,
  title: 'T',
});

describe('leave-scope-filter', () => {
  it('resolves self for employee without hr persona', () => {
    const scope = resolveLeaveListScope({
      departmentId: null,
      hrPersona: null,
      employeeId: 'emp-002',
      managerEmployeeId: null,
    });
    expect(scope).toEqual({ mode: 'self', employeeId: 'emp-002' });
  });

  it('filters department rows', () => {
    const rows = [row('emp-001', 'dept-ops'), row('emp-002', 'dept-compliance')];
    const scoped = applyLeaveScope(rows, { mode: 'department', departmentId: 'dept-ops' });
    expect(scoped).toHaveLength(1);
    expect(scoped[0]!.employeeId).toBe('emp-001');
  });
});
