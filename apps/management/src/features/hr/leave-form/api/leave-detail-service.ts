import type { BackOfficeRole } from '@epay/ui';
import type { LeaveDetail, LeaveFormSubmitResult, LeaveFormValues } from '../domain/types';

export interface LeaveDetailService {
  getById(leaveId: string): LeaveDetail | null;
  create(values: LeaveFormValues, role: BackOfficeRole, employeeId: string): LeaveFormSubmitResult;
  submitCancel(
    leaveId: string,
    values: LeaveFormValues,
    role: BackOfficeRole,
    employeeId: string,
  ): LeaveFormSubmitResult;
}
