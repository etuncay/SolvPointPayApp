import { describe, expect, it } from 'vitest';
import { getHrPermissions } from './permissions';

describe('getHrPermissions', () => {
  it('hr can insert and update', () => {
    const p = getHrPermissions('hr');
    expect(p.insert).toBe(true);
    expect(p.update).toBe(true);
    expect(p.list).toBe(true);
  });

  it('ceo can list and view only', () => {
    const p = getHrPermissions('ceo');
    expect(p.list).toBe(true);
    expect(p.view).toBe(true);
    expect(p.insert).toBe(false);
    expect(p.update).toBe(false);
  });

  it('unit_manager has no insert', () => {
    const p = getHrPermissions('unit_manager');
    expect(p.list).toBe(true);
    expect(p.insert).toBe(false);
  });

  it('null persona has no access', () => {
    const p = getHrPermissions(null);
    expect(p.list).toBe(false);
  });
});
