import { upsertEmployeeListRow } from '@/mocks/employees';
import { SAMPLE_EMPLOYEE_EMP001 } from '@/mocks/sample-employee';
import { getAppUsersStore } from '@/mocks/app-users';
import {
  provisionUserFromEmployeeId,
  syncUserInactiveFromEmployee,
} from '@/features/hr/domain/hr-user-bridge';
import type {
  EmployeeDetail,
  EmployeeFormValues,
  DocumentUploadInput,
  EmployeeContactRow,
} from '../domain/types';
import type { EmployeeDetailService, EmployeeSaveResult } from './employee-detail-service';
import { HR_DOCUMENT_TYPES } from '../domain/hr-document-types';

let detailStore = new Map<string, EmployeeDetail>([['emp-001', { ...SAMPLE_EMPLOYEE_EMP001 }]]);
let empSeq = 7;
let personSeq = 7;
let docSeq = 100;

function primaryContact(contacts: EmployeeContactRow[], type: 'email' | 'phone') {
  return (
    contacts.find((c) => c.type === type && c.primary)?.value ??
    contacts.find((c) => c.type === type)?.value ??
    ''
  );
}

function toListRow(detail: EmployeeDetail) {
  const user = getAppUsersStore().find((u) => u.hrEmployeeId === detail.employeeId);
  upsertEmployeeListRow({
    employeeId: detail.employeeId,
    personId: detail.personId,
    fullName: `${detail.firstName} ${detail.lastName}`.trim(),
    title: detail.title,
    departmentId: detail.departmentId,
    departmentName: '',
    primaryEmail: primaryContact(detail.contacts, 'email'),
    primaryPhone: primaryContact(detail.contacts, 'phone'),
    hireDate: detail.hireDate,
    employmentStatus: detail.employmentStatus,
    userNo: user?.userNo ?? detail.userNo,
  });
}

function valuesToDetail(
  values: EmployeeFormValues,
  ids: { employeeId: string; personId: string; userNo: string | null },
  existing?: EmployeeDetail,
): EmployeeDetail {
  const now = new Date('2026-05-25T12:00:00Z').toISOString();
  return {
    ...values,
    employeeId: ids.employeeId,
    personId: ids.personId,
    userNo: ids.userNo,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function resetEmployeeDetailStoreForTest(): void {
  detailStore = new Map([['emp-001', { ...SAMPLE_EMPLOYEE_EMP001 }]]);
  empSeq = 7;
  personSeq = 7;
  docSeq = 100;
}

export const employeeDetailService: EmployeeDetailService = {
  getById(employeeId) {
    const row = detailStore.get(employeeId);
    return row ? { ...row } : null;
  },

  create(values) {
    const employeeId = `emp-${String(empSeq++).padStart(3, '0')}`;
    const personId = `per-${String(personSeq++).padStart(3, '0')}`;
    const detail = valuesToDetail(values, { employeeId, personId, userNo: null });
    detailStore.set(employeeId, detail);
    const user = provisionUserFromEmployeeId(detail);
    detail.userNo = user.userNo;
    detailStore.set(employeeId, { ...detail });
    toListRow(detail);
    if (detail.employmentStatus === 'Terminated') {
      syncUserInactiveFromEmployee(employeeId);
    }
    return { ok: true, detail: { ...detail } };
  },

  update(employeeId, values) {
    const existing = detailStore.get(employeeId);
    if (!existing) return { ok: false, errorCode: 'ef_not_found' };
    const detail = valuesToDetail(
      values,
      { employeeId, personId: existing.personId, userNo: existing.userNo },
      existing,
    );
    detailStore.set(employeeId, detail);
    provisionUserFromEmployeeId(detail);
    if (detail.employmentStatus === 'Terminated') {
      syncUserInactiveFromEmployee(employeeId);
    }
    toListRow(detail);
    return { ok: true, detail: { ...detail } };
  },

  uploadDocument(employeeId, input) {
    const existing = detailStore.get(employeeId);
    if (!existing) return { ok: false, errorCode: 'ef_not_found' };
    const meta = HR_DOCUMENT_TYPES.find((t) => t.code === input.type);
    const doc = {
      id: `doc-${employeeId}-${docSeq++}`,
      type: input.type,
      typeLabelKey: meta?.labelKey ?? 'ef_doc_other',
      fileName: input.fileName,
      uploadedAt: new Date('2026-05-25T12:00:00Z').toISOString(),
    };
    const next = { ...existing, documents: [...existing.documents, doc] };
    detailStore.set(employeeId, next);
    return { ok: true, detail: { ...next } };
  },
};
