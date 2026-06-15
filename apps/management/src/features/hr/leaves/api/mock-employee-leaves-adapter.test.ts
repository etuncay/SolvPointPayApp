import { beforeEach, describe, expect, it } from 'vitest';
import { resetEmployeeLeavesStore } from '@/mocks/employee-leaves';
import { createEmployeeLeavesService } from './mock-employee-leaves-adapter';

describe('mock-employee-leaves-adapter', () => {
  beforeEach(() => {
    resetEmployeeLeavesStore();
    createEmployeeLeavesService('ops').resetAccessLog();
  });

  it('self scope returns only employee rows', () => {
    const svc = createEmployeeLeavesService('ops');
    const rows = svc.list(
      { mode: 'self', employeeId: 'emp-001' },
      {
        query: '',
        leaveType: 'any',
        taskStatus: 'any',
        departmentId: '',
        dateFrom: '',
        dateTo: '',
      },
    );
    expect(rows.every((r) => r.employeeId === 'emp-001')).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('department scope filters dept-ops', () => {
    const svc = createEmployeeLeavesService('ops');
    const rows = svc.list(
      { mode: 'department', departmentId: 'dept-ops' },
      {
        query: '',
        leaveType: 'any',
        taskStatus: 'any',
        departmentId: '',
        dateFrom: '',
        dateTo: '',
      },
    );
    expect(rows.some((r) => r.id === 'LV-004')).toBe(true);
    expect(rows.every((r) => r.departmentId === 'dept-ops')).toBe(true);
  });

  it('records access log on list', () => {
    const svc = createEmployeeLeavesService('management');
    svc.resetAccessLog();
    svc.list({ mode: 'all' }, {
      query: '',
      leaveType: 'any',
      taskStatus: 'any',
      departmentId: '',
      dateFrom: '',
      dateTo: '',
    });
    expect(svc.getAccessLog().length).toBe(1);
  });

  it('summary uses approved annual for emp-001', () => {
    const svc = createEmployeeLeavesService('ops');
    const s = svc.getSummary('emp-001', 2026);
    expect(s.usedAnnualLeaveDays).toBe(5);
    expect(s.remainingAnnualLeaveDays).toBe(9);
  });
});
