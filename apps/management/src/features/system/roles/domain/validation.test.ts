import { describe, expect, it, beforeEach } from 'vitest';
import { resetRolesStore } from '@/mocks/roles-store';
import { validateUniqueRoleName } from './validation';

describe('validateUniqueRoleName', () => {
  beforeEach(() => {
    resetRolesStore();
  });

  it('rejects duplicate name', () => {
    expect(validateUniqueRoleName('Operasyon')).toBe('rol_name_duplicate');
  });

  it('allows unique name', () => {
    expect(validateUniqueRoleName('Yeni Test Rol')).toBeNull();
  });
});
