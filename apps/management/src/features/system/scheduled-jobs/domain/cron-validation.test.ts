import { describe, expect, it } from 'vitest';
import { validateCronForJobType } from './cron-validation';

describe('validateCronForJobType', () => {
  it('requires cron for Recurring', () => {
    expect(validateCronForJobType('Recurring', null)).toBe('sj_cron_required');
    expect(validateCronForJobType('Recurring', '   ')).toBe('sj_cron_required');
  });

  it('allows Once without cron', () => {
    expect(validateCronForJobType('Once', null)).toBeNull();
  });

  it('accepts valid cron', () => {
    expect(validateCronForJobType('Recurring', '0 8 * * *')).toBeNull();
  });
});
