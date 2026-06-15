import type { BackOfficeRole } from '@epay/ui';
import type { HrPersona } from '@/features/hr/domain/types';

export type HrCurrentUserExtras = {
  departmentId: string | null;
  hrPersona: HrPersona | null;
  employeeId: string | null;
  managerEmployeeId: string | null;
};

/** Dev toolbar rolü → İK menü persona eşlemesi */
export function resolveHrPersona(role: BackOfficeRole): HrPersona | null {
  switch (role) {
    case 'management':
    case 'alltest':
      return 'hr';
    case 'ops':
      return 'unit_manager';
    case 'finance':
      return 'ceo';
    default:
      return null;
  }
}

export function resolveHrDepartmentId(role: BackOfficeRole): string | null {
  switch (role) {
    case 'management':
    case 'alltest':
      return 'dept-hr';
    case 'ops':
      return 'dept-ops';
    default:
      return null;
  }
}

export function resolveHrEmployeeId(role: BackOfficeRole): string | null {
  switch (role) {
    case 'ops':
      return 'emp-001';
    case 'management':
    case 'alltest':
      return 'emp-005';
    case 'finance':
      return 'emp-004';
    case 'compliance':
      return 'emp-002';
    default:
      return null;
  }
}

export function getHrCurrentUserExtras(role: BackOfficeRole): HrCurrentUserExtras {
  return {
    hrPersona: resolveHrPersona(role),
    departmentId: resolveHrDepartmentId(role),
    employeeId: resolveHrEmployeeId(role),
    managerEmployeeId: null,
  };
}
