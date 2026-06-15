import { describe, expect, it } from 'vitest';
import { MAX_RESERVE_CORRECTION_TRY, validateReserveMax } from './reserve-guard';

describe('reserve-guard', () => {
  it('reserve kaynak max aşım', () => {
    const err = validateReserveMax('system_reserve', 'system', MAX_RESERVE_CORRECTION_TRY + 1, 'TRY');
    expect(err).toBe('cr_reserve_max_exceeded');
  });

  it('müşteri cüzdanı — reserve kuralı yok', () => {
    const err = validateReserveMax('standard', 'customer', 1_000_000, 'TRY');
    expect(err).toBeNull();
  });
});
