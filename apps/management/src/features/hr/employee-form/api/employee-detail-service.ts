import type { EmployeeDetail, EmployeeFormValues, DocumentUploadInput } from '../domain/types';

export type EmployeeSaveResult =
  | { ok: true; detail: EmployeeDetail }
  | { ok: false; errorCode: string };

export interface EmployeeDetailService {
  getById(employeeId: string): EmployeeDetail | null;
  create(values: EmployeeFormValues): EmployeeSaveResult;
  update(employeeId: string, values: EmployeeFormValues): EmployeeSaveResult;
  uploadDocument(employeeId: string, input: DocumentUploadInput): EmployeeSaveResult;
}
