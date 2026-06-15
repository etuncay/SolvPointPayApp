import { describe, expect, it } from 'vitest';
import { getLeavePermissions } from './leave-permissions';

describe('leave-permissions', () => {
  it('allows compliance employee self access', () => {
    const p = getLeavePermissions({
      hrPersona: null,
      departmentId: null,
      employeeId: 'emp-002',
      managerEmployeeId: null,
    });
    expect(p.canViewList).toBe(true);
  });

  it('denies without employeeId or persona scope', () => {
    const p = getLeavePermissions({
      hrPersona: null,
      departmentId: null,
      employeeId: null,
      managerEmployeeId: null,
    });
    expect(p.canViewList).toBe(false);
  });
});
