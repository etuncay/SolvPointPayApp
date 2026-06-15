import { describe, expect, it } from 'vitest';
import { computeLeaveSummary } from './compute-leave-summary';
import type { EmployeeLeave } from './types';

const params = {
  annualEntitlementDays: 14,
  sickLeaveLimitDaysPerYear: 10,
  leaveReportMaxRows: 500,
  publicHolidays: [] as string[],
};

const leaves: EmployeeLeave[] = [
  {
    id: 'LV-001',
    employeeId: 'emp-001',
    leaveType: 'AnnualLeave',
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    totalDays: 5,
    workingDays: 5,
    notes: null,
    taskStatus: 'Approved',
    recordStatus: 1,
    createdAt: '',
    createdBy: '',
    approvalRequestId: null,
    cancelType: 'none',
    originalStartDate: null,
    originalEndDate: null,
  },
  {
    id: 'LV-002',
    employeeId: 'emp-001',
    leaveType: 'AnnualLeave',
    startDate: '2026-06-01',
    endDate: '2026-06-05',
    totalDays: 5,
    workingDays: 5,
    notes: null,
    taskStatus: 'Pending',
    recordStatus: 1,
    createdAt: '',
    createdBy: '',
    approvalRequestId: null,
    cancelType: 'none',
    originalStartDate: null,
    originalEndDate: null,
  },
  {
    id: 'LV-003',
    employeeId: 'emp-001',
    leaveType: 'SickLeave',
    startDate: '2026-02-01',
    endDate: '2026-02-03',
    totalDays: 3,
    workingDays: 3,
    notes: null,
    taskStatus: 'Approved',
    recordStatus: 1,
    createdAt: '',
    createdBy: '',
    approvalRequestId: null,
    cancelType: 'none',
    originalStartDate: null,
    originalEndDate: null,
  },
];

describe('computeLeaveSummary', () => {
  it('counts only Approved annual and sick for year', () => {
    const s = computeLeaveSummary(leaves, 'emp-001', 2026, params);
    expect(s.usedAnnualLeaveDays).toBe(5);
    expect(s.remainingAnnualLeaveDays).toBe(9);
    expect(s.usedSickLeaveDays).toBe(3);
    expect(s.entitlementDays).toBe(14);
  });
});
