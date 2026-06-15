import { describe, expect, it } from 'vitest';
import { BACKOFFICE_SCREENS } from '@/features/system/shared/screen-registry';
import { mergeScreenPermissions } from './sync-matrix-from-registry';

describe('mergeScreenPermissions', () => {
  it('adds new registry screens with false defaults', () => {
    const merged = mergeScreenPermissions([], 'role-test');
    expect(merged.length).toBe(BACKOFFICE_SCREENS.length);
    expect(merged.every((r) => !r.canList)).toBe(true);
  });

  it('preserves existing permission flags', () => {
    const existing = mergeScreenPermissions([], 'role-ops');
    const first = existing[0]!;
    const patched = existing.map((r) =>
      r.screenId === first.screenId ? { ...r, canList: true, canView: true } : r,
    );
    const merged = mergeScreenPermissions(patched, 'role-ops');
    const row = merged.find((r) => r.screenId === first.screenId);
    expect(row?.canList).toBe(true);
    expect(row?.canView).toBe(true);
  });
});
