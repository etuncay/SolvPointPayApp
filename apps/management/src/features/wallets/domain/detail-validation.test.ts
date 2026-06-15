import { describe, expect, it } from 'vitest';
import { emptyLimitSet } from './detail-types';
import { validateBalanceBlock, validateAddNote, validateLimitSet } from './detail-validation';

describe('detail-validation', () => {
  it('geçmiş bloke bitiş tarihini reddeder', () => {
    expect(
      validateBalanceBlock(
        { blockedAmount: 1000, blockEndDate: '2026-05-01', reason: 'test' },
        '2026-05-24',
      ),
    ).toBe('wd_block_end_past');
  });

  it('boş notu reddeder', () => {
    expect(validateAddNote('   ')).toBe('wd_note_required');
  });

  it('geçerli limit setini kabul eder', () => {
    const limits = emptyLimitSet();
    limits.Withdrawal.Single = -1;
    limits.Transfer.DailyAmount = 50000;
    expect(validateLimitSet(limits)).toBeNull();
  });
});
