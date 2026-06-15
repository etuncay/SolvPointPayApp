import { describe, expect, it, beforeEach } from 'vitest';
import { __resetWalletStoresForTest } from '@/features/wallets/api/mock-wallets-adapter';
import { resetApprovalsStore } from '@/features/approval-pool/api/mock-approvals-adapter';
import { getWallets } from '@/lib/wallets-store';
import type { Wallet } from '@/features/wallets/domain/types';
import { EMPTY_CORRECTION_FORM, type CorrectionFormValues } from '../domain/correction-types';
import { MAX_RESERVE_CORRECTION_TRY } from '../domain/reserve-guard';
import {
  __getCorrectionStore,
  __resetCorrectionStoreForTest,
  mockCorrectionsAdapter,
} from './mock-corrections-adapter';
import { __resetTransactionStoresForTest } from './mock-transactions-adapter';

function pickCorrectionWallets(wallets: readonly Wallet[]) {
  const reserveWallet = wallets.find((w) => w.type === 'system_reserve' && w.ccy === 'TRY')!;
  const customerWallet = wallets.find((w) => w.cat === 'customer' && w.ccy === 'TRY')!;
  const targetWallet = wallets.find(
    (w) => w.cat === 'customer' && w.id !== customerWallet.id && w.ccy === 'TRY',
  )!;
  return { reserveWallet, customerWallet, targetWallet };
}

describe('mock-corrections-adapter', () => {
  let reserveWallet: Wallet;
  let customerWallet: Wallet;
  let targetWallet: Wallet;
  let validInput: CorrectionFormValues;

  function buildValidInput() {
    return {
      ...EMPTY_CORRECTION_FORM,
      sourceCustomerId: customerWallet.customerId,
      sourceWalletId: customerWallet.id,
      targetCustomerId: targetWallet.customerId,
      targetWalletId: targetWallet.id,
      requestedAmount: 1_500,
      requestedCurrency: 'TRY' as const,
      correctionReason: 'Refund' as const,
      manualDescription: 'Müşteri iadesi',
      transactionDescription: 'İade düzeltmesi',
    };
  }

  beforeEach(() => {
    __resetCorrectionStoreForTest();
    __resetTransactionStoresForTest();
    __resetWalletStoresForTest();
    resetApprovalsStore();
    ({ reserveWallet, customerWallet, targetWallet } = pickCorrectionWallets(getWallets()));
    validInput = buildValidInput();
  });

  it('draft create → correction + transaction id', () => {
    const result = mockCorrectionsAdapter.createDraft(validInput, 'ops');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.correctionId).toBeGreaterThan(0);
    expect(result.transactionId).toBeGreaterThan(0);
    const draft = mockCorrectionsAdapter.getDraft(result.correctionId, 'ops');
    expect(draft?.draftTransactionId).toBe(result.transactionId);
  });

  it('reserve max aşım', () => {
    const result = mockCorrectionsAdapter.createDraft(
      {
        ...validInput,
        sourceWalletId: reserveWallet.id,
        sourceCustomerId: null,
        requestedAmount: MAX_RESERVE_CORRECTION_TRY + 1,
      },
      'ops',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('cr_reserve_max_exceeded');
  });

  it('doc attach immutable', () => {
    const created = mockCorrectionsAdapter.createDraft(validInput, 'ops');
    if (!created.ok) throw new Error('setup');
    mockCorrectionsAdapter.attachDocument(created.correctionId, 'ek.pdf', 'ops');
    const again = mockCorrectionsAdapter.attachDocument(created.correctionId, 'ek2.pdf', 'ops');
    expect(again.ok).toBe(false);
    expect(again.error).toBe('cr_doc_immutable');
  });

  it('submitToApproval → approval pool kaydı', () => {
    const created = mockCorrectionsAdapter.createDraft(validInput, 'ops');
    if (!created.ok) throw new Error('setup');
    const submitted = mockCorrectionsAdapter.submitToApproval(created.transactionId, 'ops');
    expect(submitted.ok).toBe(true);
    expect(submitted.approvalId).toBeGreaterThan(0);
    const draft = __getCorrectionStore().find((c) => c.id === created.correctionId);
    expect(draft?.submittedToApproval).toBe(true);
  });

  it('finance form erişimi yok', () => {
    const result = mockCorrectionsAdapter.createDraft(validInput, 'finance');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('td_permission_denied');
  });
});
