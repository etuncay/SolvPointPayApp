import { describe, expect, it } from 'vitest';
import { applyCancel, applyHold, applyUnblock, canCancel, canHold, canUnblock } from './transitions';

describe('transaction transitions', () => {
  it('Pending → hold/unblock/cancel matrix', () => {
    expect(canHold('Pending')).toBe(true);
    expect(canUnblock('Pending')).toBe(false);
    expect(canCancel('Pending')).toBe(true);
    expect(applyHold('Pending')).toBe('OnHold');
  });

  it('OnHold → unblock/cancel', () => {
    expect(canUnblock('OnHold')).toBe(true);
    expect(canCancel('OnHold')).toBe(true);
    expect(applyUnblock('OnHold')).toBe('Unblocked');
    expect(applyCancel('OnHold')).toBe('Canceled');
  });

  it('Completed müdahale yok', () => {
    expect(canHold('Completed')).toBe(false);
    expect(canUnblock('Completed')).toBe(false);
    expect(canCancel('Completed')).toBe(false);
    expect(applyCancel('Completed')).toBeNull();
  });
});
