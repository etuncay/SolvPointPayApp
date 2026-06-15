import { describe, expect, it } from 'vitest';
import { movementUniqueKey } from './duplicate-key';

describe('movementUniqueKey', () => {
  it('joins bankTransactionNo, sourceBank and transactionDate', () => {
    const key = movementUniqueKey({
      bankTransactionNo: 'TX-100',
      sourceBank: 'Ziraat Bankası',
      transactionDate: '2026-05-20 14:00:00',
    });
    expect(key).toBe('TX-100|Ziraat Bankası|2026-05-20 14:00:00');
  });

  it('different transactionDate yields different key', () => {
    const a = movementUniqueKey({
      bankTransactionNo: 'TX-100',
      sourceBank: 'Ziraat Bankası',
      transactionDate: '2026-05-20 14:00:00',
    });
    const b = movementUniqueKey({
      bankTransactionNo: 'TX-100',
      sourceBank: 'Ziraat Bankası',
      transactionDate: '2026-05-21 14:00:00',
    });
    expect(a).not.toBe(b);
  });
});
