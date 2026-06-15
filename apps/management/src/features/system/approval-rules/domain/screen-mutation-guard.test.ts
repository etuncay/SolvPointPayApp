import { describe, expect, it } from 'vitest';
import {
  getBlockedScreenKeys,
  isScreenWriteBlocked,
  rebuildBlockedScreenWrites,
} from './screen-mutation-guard';

describe('screen-mutation-guard', () => {
  it('risk.admin not blocked when second approver pool exists (12.3)', () => {
    rebuildBlockedScreenWrites();
    expect(isScreenWriteBlocked('risk.admin')).toBe(false);
  });

  it('agents.form write guard example', () => {
    rebuildBlockedScreenWrites();
    const blocked = isScreenWriteBlocked('agents.form');
    expect(typeof blocked).toBe('boolean');
  });
});
