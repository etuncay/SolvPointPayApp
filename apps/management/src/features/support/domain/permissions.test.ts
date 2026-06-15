import { describe, expect, it } from 'vitest';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { getSupportCasesStore } from '@/mocks/support-cases-store';
import { filterCasesByRole, getSupportCasePermissions } from './permissions';

describe('support permissions', () => {
  it('ops sees all cases', () => {
    const user = getCurrentUser('ops');
    const filtered = filterCasesByRole('ops', getSupportCasesStore(), user.id);
    expect(filtered.length).toBe(getSupportCasesStore().length);
  });

  it('finance sees only assigned or department', () => {
    const user = getCurrentUser('finance');
    const filtered = filterCasesByRole('finance', getSupportCasesStore(), user.id);
    expect(filtered.every((c) => c.ownerUserId === user.id || c.departmentId === 'finance')).toBe(
      true,
    );
    expect(filtered.length).toBeLessThan(getSupportCasesStore().length);
  });

  it('finance cannot insert', () => {
    expect(getSupportCasePermissions('finance').insert).toBe(false);
  });
});
