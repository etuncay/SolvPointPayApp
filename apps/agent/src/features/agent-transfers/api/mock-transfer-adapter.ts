import {
  canInitiateTopUp,
  findCustomerByQuery,
  lookupSender,
  type SenderLookupResult,
} from '@/features/agent-transactions/domain/customer-lookup';
import { isDuplicateReference } from '@/features/agent-transactions/domain/idempotency';
import { screenSanction } from '@/features/agent-transactions/domain/sanction';
import { agentTransactionsStore, DEMO_AGENT_ID } from '@/features/transaction-confirmation/api/agent-transactions-store';
import type { TransactionType } from '@/features/transaction-confirmation/domain/transaction-types';
import { CUSTOMERS } from '@/mocks/data';
import { receiverInfoStore } from '@/mocks/receiver-info';
import { assessCountryRisk } from '../domain/risk-country';
import { getTransferFeeTiers } from '../domain/fees';
import { getFxQuote } from '../domain/fx-quote';
import { isValidIban, normalizeIban } from '../domain/iban';
import { lookupRecipientMasked } from '../domain/mask-recipient';
import {
  VARIANT_TX_TYPE,
  type FxQuote,
  type TransferFeeTier,
  type TransferSubmitPayload,
  type TransferSubmitResult,
  type TransferVariant,
} from '../domain/types';

export interface TransferService {
  lookupSender(query: { customerNo?: string; idNo?: string }): SenderLookupResult | null;
  getTransferFees(variant: TransferVariant, currency: string): TransferFeeTier[];
  validateIban(iban: string): boolean;
  getFxQuote(sourceCcy: string, targetCcy: string, amount: number): FxQuote;
  lookupRecipientMasked(idNo: string): ReturnType<typeof lookupRecipientMasked>;
  createReceiverInfo(input: { idNo: string; name: string; phone: string; email: string }): void;
  initiateTransfer(payload: TransferSubmitPayload, options?: { receiverScreenName?: string; skipReceiverSanction?: boolean }): TransferSubmitResult;
  rescreenReceiver(name: string): boolean;
}

function getSenderById(customerId: number): SenderLookupResult | null {
  const c = CUSTOMERS.find((x) => x.id === customerId);
  if (!c) return null;
  return lookupSender({ idNo: String(c.idNo) });
}

function createTx(
  payload: TransferSubmitPayload,
  status: 'Pending' | 'OnHold',
  sanctionHit: boolean,
): TransferSubmitResult {
  const txType: TransactionType = VARIANT_TX_TYPE[payload.variant];
  const now = new Date();
  const createdAt = now.toISOString().slice(0, 19).replace('T', ' ');

  let receiverCustomerId: number | null = null;
  let receiverIban: string | null = null;
  let foreignRef: string | null = null;
  let targetCurrency: string | undefined;
  let targetAmount: number | undefined;
  let fxRate: number | null = null;
  let description = payload.description ?? '';

  if (payload.variant === 'person') {
    if (payload.receiverCustomerId) receiverCustomerId = payload.receiverCustomerId;
    description = payload.description || `Kişiye: ${payload.receiverName}`;
  }
  if (payload.variant === 'bankAccount') {
    receiverIban = normalizeIban(payload.iban);
    description = payload.description || `Banka: ${payload.receiverName}`;
  }
  if (payload.variant === 'abroad') {
    receiverIban = 'DE89370400440532013000';
    foreignRef = `INT-${now.getTime()}`;
    targetCurrency = payload.targetCurrency;
    targetAmount = payload.targetAmount;
    fxRate = payload.fxRate;
    description = payload.description || `Yurt dışı: ${payload.receiverName}`;
  }
  if (payload.variant === 'ownWallet') {
    description = 'Kendi cüzdanına para yatırma';
  }

  const senderWalletId = payload.variant === 'ownWallet' ? payload.walletId : null;

  const tx = agentTransactionsStore.addRecord({
    txNo: `TX-TR-${now.getTime().toString().slice(-8)}`,
    referenceNo: payload.clientReference,
    foreignReferenceNo: foreignRef,
    senderCustomerId: payload.senderCustomerId,
    senderAgentId: DEMO_AGENT_ID,
    receiverCustomerId,
    receiverAgentId: null,
    senderWalletId,
    receiverWalletId: payload.variant === 'ownWallet' ? payload.walletId : null,
    senderIban: null,
    receiverIban,
    type: txType,
    currency: payload.currency,
    targetCurrency,
    amount: payload.amount,
    targetAmount: targetAmount ?? null,
    fxRate,
    status,
    recordStatus: 1,
    createdAt,
    paymentPurpose: payload.paymentPurpose ?? null,
    description: payload.isSuspicious ? `Şüpheli: ${description}` : description,
  });

  return { ok: true, transactionId: tx.id, status, sanctionHit };
}

export const mockTransferAdapter: TransferService = {
  lookupSender,
  getTransferFees(variant, currency) {
    return getTransferFeeTiers(variant, currency);
  },
  validateIban(iban) {
    return isValidIban(iban);
  },
  getFxQuote(sourceCcy, targetCcy, amount) {
    return getFxQuote(sourceCcy, targetCcy, amount);
  },
  lookupRecipientMasked,
  createReceiverInfo(input) {
    receiverInfoStore.create(input);
  },
  rescreenReceiver(name) {
    return screenSanction(name);
  },

  initiateTransfer(payload, options) {
    const ref = payload.clientReference.trim();
    if (ref && isDuplicateReference(ref)) {
      return { ok: false, code: 'DUPLICATE', message: 'ag_tr_err_duplicate' };
    }

    const sender = getSenderById(payload.senderCustomerId);
    if (payload.variant === 'ownWallet' && sender && !canInitiateTopUp(sender)) {
      return { ok: false, code: 'KYC_BLOCKED', message: 'ag_tr_err_kyc_l2' };
    }

    if (payload.variant === 'abroad') {
      const risk = assessCountryRisk(payload.country);
      if (risk === 'blocked') {
        return { ok: false, code: 'RISK_COUNTRY', message: 'ag_tr_err_risk_country' };
      }
    }

    if (screenSanction(payload.screenName)) {
      return createTx(payload, 'OnHold', true);
    }

    const recvName = options?.receiverScreenName ?? getReceiverName(payload);
    const needsReceiverScreen =
      !options?.skipReceiverSanction &&
      (payload.variant === 'person' || payload.variant === 'abroad' || payload.variant === 'bankAccount');

    if (needsReceiverScreen && recvName && screenSanction(recvName)) {
      return { ok: true, transactionId: 0, status: 'Pending', sanctionHit: false, receiverSanctionHit: true };
    }

    return createTx(payload, 'Pending', false);
  },
};

function getReceiverName(payload: TransferSubmitPayload): string {
  if (payload.variant === 'bankAccount' || payload.variant === 'person' || payload.variant === 'abroad') {
    return payload.receiverName;
  }
  return '';
}
