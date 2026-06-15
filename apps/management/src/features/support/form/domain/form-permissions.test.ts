import { describe, expect, it } from 'vitest';
import { getSupportCasePermissions } from '../../domain/permissions';
import { visibleActionButtons } from './form-permissions';

describe('form-permissions', () => {
  it('finance cannot insert', () => {
    expect(getSupportCasePermissions('finance').insert).toBe(false);
  });

  it('reopen only when closed', () => {
    const open = visibleActionButtons('edit', 'Assigned', { insert: true, canAct: true }, false);
    expect(open).not.toContain('reopen');
    const closed = visibleActionButtons('edit', 'Rejected', { insert: true, canAct: true }, false);
    expect(closed).toEqual(['reopen']);
  });
});
