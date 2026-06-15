import type { EmployeeLeave, LeaveSummary } from './types';
import type { HrLeaveParams } from './hr-leave-params';

export function computeLeaveSummary(
  leaves: EmployeeLeave[],
  employeeId: string,
  year: number,
  params: HrLeaveParams,
): LeaveSummary {
  const inYear = leaves.filter(
    (l) =>
      l.employeeId === employeeId &&
      l.recordStatus === 1 &&
      l.taskStatus === 'Approved' &&
      l.startDate.startsWith(String(year)),
  );

  const usedAnnual = inYear
    .filter((l) => l.leaveType === 'AnnualLeave')
    .reduce((s, l) => s + l.totalDays, 0);

  const usedSick = inYear
    .filter((l) => l.leaveType === 'SickLeave')
    .reduce((s, l) => s + l.totalDays, 0);

  const entitlement = params.annualEntitlementDays;
  const remaining = Math.max(0, entitlement - usedAnnual);

  return {
    year,
    usedAnnualLeaveDays: usedAnnual,
    remainingAnnualLeaveDays: remaining,
    usedSickLeaveDays: usedSick,
    entitlementDays: entitlement,
  };
}
