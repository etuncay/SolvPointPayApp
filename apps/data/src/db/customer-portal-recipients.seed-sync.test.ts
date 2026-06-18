import { describe, expect, it } from 'vitest';
import {
  CUSTOMER_PORTAL_RECIPIENTS_SEED,
  CUSTOMER_PORTAL_SEED_RECIPIENT_IDS,
  getCustomerPortalRecipientsSeed,
  getCustomerPortalSeed,
} from './seed-customer-portal';
import { recipientInputFromTransferDraft } from './customer-recipient-ops';
import type { TransferDraftInput } from '../types/customer-portal';

describe('customer portal recipients seed sync', () => {
  it('exported seed matches getCustomerPortalRecipientsSeed with fixed timestamp', () => {
    expect(CUSTOMER_PORTAL_RECIPIENTS_SEED).toEqual(
      getCustomerPortalRecipientsSeed('2026-06-01T00:00:00.000Z'),
    );
  });

  it('getCustomerPortalSeed uses recipient seed builder', () => {
    const seed = getCustomerPortalSeed();
    expect(seed.recipients).toHaveLength(CUSTOMER_PORTAL_SEED_RECIPIENT_IDS.length);
    expect(seed.recipients.map((r) => r.id)).toEqual([...CUSTOMER_PORTAL_SEED_RECIPIENT_IDS]);
  });

  it('transfer save maps draft fields including customerNo', () => {
    const draft: TransferDraftInput = {
      kind: 'domestic',
      title: 'Yurt İçi',
      sourceWalletId: 'w1',
      recipientName: 'Ayşe Yılmaz',
      recipientCustomerNo: 'CUS-999',
      phone: '+90 532 111 22 33',
      email: 'ayse@ornek.com',
      country: 'Türkiye',
      currency: 'TRY',
      symbol: '₺',
      amount: 100,
      fee: 0,
      total: 100,
      purpose: 'FamilySupport',
      description: 'Hediye',
      saveRecipient: true,
    };
    expect(recipientInputFromTransferDraft(draft)).toEqual({
      label: 'Ayşe Yılmaz',
      name: 'Ayşe Yılmaz',
      country: 'Türkiye',
      isIntl: false,
      phone: '+90 532 111 22 33',
      email: 'ayse@ornek.com',
      customerNo: 'CUS-999',
      purpose: 'FamilySupport',
      description: 'Hediye',
    });
  });

  it('intl transfer marks isIntl', () => {
    const draft: TransferDraftInput = {
      kind: 'intl',
      title: 'Yurt Dışı',
      sourceWalletId: 'w2',
      recipientName: 'John Doe',
      country: 'Almanya',
      currency: 'EUR',
      symbol: '€',
      amount: 50,
      fee: 5,
      total: 55,
      purpose: 'GoodsPayment',
      saveRecipient: true,
    };
    expect(recipientInputFromTransferDraft(draft).isIntl).toBe(true);
  });
});
