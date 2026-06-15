import { describe, expect, it } from 'vitest';
import { canAdjustStatus, validateAdjustDescription } from './validation';

describe('financial-reconciliation validation', () => {
  it('boş açıklama reddedilir', () => {
    expect(validateAdjustDescription('   ')).toBe('finrec_description_required');
    expect(validateAdjustDescription('ok')).toBeNull();
  });

  it('yalnızca PendingReview düzeltilebilir', () => {
    expect(canAdjustStatus('PendingReview')).toBe(true);
    expect(canAdjustStatus('Matched')).toBe(false);
    expect(canAdjustStatus('Adjusted')).toBe(false);
  });
});
