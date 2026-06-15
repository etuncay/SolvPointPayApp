import { describe, expect, it } from 'vitest';
import { assertAuthorizedKycLevel, assertUboPresent } from './kyc-guards';
import type { AuthorizedPersonRow, ShareholderRow } from '@/mocks/sample-corporate';

const auth = (kycLevel: string): AuthorizedPersonRow => ({
  id: 1,
  personId: '1',
  name: 'Test',
  hasOperationAuth: true,
  hasSignatureAuth: false,
  singleTxLimit: 0,
  dailyLimit: 0,
  monthlyLimit: 0,
  startDate: '2024-01-01',
  endDate: '',
  status: 'active',
  kycLevel,
});

const sh = (over: Partial<ShareholderRow>): ShareholderRow => ({
  id: 1,
  refNo: '1',
  refType: 'TCKN',
  partyType: 'individual',
  name: 'Ortak',
  directShare: 50,
  indirectShare: 0,
  isUbo: false,
  description: '',
  startDate: '2024-01-01',
  endDate: '',
  status: 'active',
  ...over,
});

describe('kyc-guards', () => {
  it('yetkili L1 kaydı reddeder', () => {
    expect(assertAuthorizedKycLevel([auth('L1')])).toBe('af_auth_kyc_low');
    expect(assertAuthorizedKycLevel([auth('L2')])).toBeNull();
  });

  it('UBO eksikse reddeder', () => {
    expect(assertUboPresent([sh({ isUbo: false, directShare: 60 })])).toBe('af_ubo_missing');
    expect(assertUboPresent([sh({ isUbo: true, description: 'UBO' })])).toBeNull();
  });
});
