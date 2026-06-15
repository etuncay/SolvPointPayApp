import { describe, expect, it } from 'vitest';
import { validateInterventionReason } from './detail-validation';

describe('validateInterventionReason', () => {
  it('boş gerekçe reddedilir', () => {
    expect(validateInterventionReason('')).toBe('wd_block_reason_required');
    expect(validateInterventionReason('   ')).toBe('wd_block_reason_required');
  });

  it('dolu gerekçe geçer', () => {
    expect(validateInterventionReason('AML inceleme')).toBeNull();
  });
});
