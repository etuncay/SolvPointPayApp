import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';

/** Personel → birim yöneticisi app-user (1. onay kademesi MVP) */
const MANAGER_USER_BY_EMPLOYEE: Record<string, string> = {
  'emp-001': MOCK_USER_IDS.compliance,
  'emp-002': MOCK_USER_IDS.compliance,
  'emp-006': MOCK_USER_IDS.compliance,
};

export function resolveManagerUserId(employeeId: string): string {
  return MANAGER_USER_BY_EMPLOYEE[employeeId] ?? MOCK_USER_IDS.compliance;
}

export function getManagerEmployeeId(employeeId: string): string | null {
  if (employeeId === 'emp-001') return 'emp-006';
  return null;
}
