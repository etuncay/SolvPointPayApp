import {
  markUserInactiveByEmployeeId,
  provisionUserFromEmployee,
} from '@/features/system/users/api/hr-user-sync';
import type { EmployeeDetail } from '@/features/hr/employee-form/domain/types';

export function getEmployeeForUserSync(detail: EmployeeDetail) {
  const primaryEmail =
    detail.contacts.find((c) => c.type === 'email' && c.primary)?.value ??
    detail.contacts.find((c) => c.type === 'email')?.value ??
    '';
  const primaryPhone =
    detail.contacts.find((c) => c.type === 'phone' && c.primary)?.value ??
    detail.contacts.find((c) => c.type === 'phone')?.value ??
    '';
  return {
    id: detail.employeeId,
    fullName: `${detail.firstName} ${detail.lastName}`.trim(),
    email: primaryEmail,
    phone: primaryPhone,
    status: detail.employmentStatus === 'Terminated' ? ('Inactive' as const) : ('Active' as const),
  };
}

export function provisionUserFromEmployeeId(detail: EmployeeDetail) {
  return provisionUserFromEmployee(getEmployeeForUserSync(detail));
}

export function syncUserInactiveFromEmployee(employeeId: string) {
  markUserInactiveByEmployeeId(employeeId);
}
