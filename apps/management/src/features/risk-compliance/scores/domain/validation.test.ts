import { describe, expect, it } from 'vitest';
import { validateManualChange } from './validation';

describe('validateManualChange', () => {
  it('gerekçe yoksa rsc_reason_required', () => {
    expect(validateManualChange({ newScore: 50, reason: '   ' })).toEqual({
      ok: false,
      error: 'rsc_reason_required',
    });
  });

  it('skor 101 ise rsc_score_range', () => {
    expect(validateManualChange({ newScore: 101, reason: 'test' })).toEqual({
      ok: false,
      error: 'rsc_score_range',
    });
  });

  it('geçerli girdi', () => {
    expect(validateManualChange({ newScore: 72, reason: 'AML inceleme' })).toEqual({ ok: true });
  });
});
