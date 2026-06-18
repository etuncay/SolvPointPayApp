import { describe, expect, it } from 'vitest';
import {
  BACK_OFFICE_TRANSACTION_SEED,
  BACK_OFFICE_WALLET_SEED,
} from '@epay/data';
import { TRANSACTIONS } from './transactions';
import { WALLETS } from './wallets';

describe('management mocks seed sync', () => {
  it('TRANSACTIONS re-exports @epay/data seed', () => {
    expect(TRANSACTIONS).toBe(BACK_OFFICE_TRANSACTION_SEED);
  });

  it('WALLETS re-exports @epay/data seed', () => {
    expect(WALLETS).toBe(BACK_OFFICE_WALLET_SEED);
  });
});
