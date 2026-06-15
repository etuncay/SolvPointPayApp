import { describe, expect, it } from 'vitest';
import { getAuthorizedPersonPermissions } from './permissions';

describe('getAuthorizedPersonPermissions', () => {
  it('ops has full form access', () => {
    const p = getAuthorizedPersonPermissions('ops');
    expect(p.insert).toBe(true);
    expect(p.update).toBe(true);
    expect(p.draft).toBe(true);
    expect(p.block).toBe(true);
  });

  it('compliance cannot insert or draft but can update and block', () => {
    const p = getAuthorizedPersonPermissions('compliance');
    expect(p.insert).toBe(false);
    expect(p.draft).toBe(false);
    expect(p.update).toBe(true);
    expect(p.view).toBe(true);
    expect(p.block).toBe(true);
  });

  it('finance is view-only', () => {
    const p = getAuthorizedPersonPermissions('finance');
    expect(p.insert).toBe(false);
    expect(p.update).toBe(false);
    expect(p.view).toBe(true);
    expect(p.block).toBe(false);
  });
});
