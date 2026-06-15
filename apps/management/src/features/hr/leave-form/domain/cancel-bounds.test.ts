import { describe, expect, it } from 'vitest';
import { validateCancelDates } from './cancel-bounds';

const original = { start: '2026-03-10', end: '2026-03-14' };

describe('validateCancelDates', () => {
  it('rejects start before original', () => {
    const r = validateCancelDates(original, { start: '2026-03-09', end: '2026-03-14' }, false);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('lf_cancel_start_before');
  });

  it('rejects end after original', () => {
    const r = validateCancelDates(original, { start: '2026-03-10', end: '2026-03-15' }, false);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('lf_cancel_end_after');
  });

  it('rejects unchanged range', () => {
    const r = validateCancelDates(original, { start: '2026-03-10', end: '2026-03-14' }, false);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('lf_cancel_no_change');
  });

  it('allows narrowed range', () => {
    const r = validateCancelDates(original, { start: '2026-03-11', end: '2026-03-13' }, false);
    expect(r.ok).toBe(true);
  });

  it('allows full cancel flag', () => {
    const r = validateCancelDates(original, { start: '2026-03-10', end: '2026-03-14' }, true);
    expect(r.ok).toBe(true);
  });
});
