import { CUSTOMERS } from '@/mocks/data';
import { getWallets } from '@/lib/wallets-store';
import { agentTransactionsStore, DEMO_AGENT_ID } from '@/features/transaction-confirmation/api/agent-transactions-store';
import { formatCustomerNo, parseCustomerNo } from '@/features/customer-search/domain/format-customer-no';
import type { CustomerSearchWarning } from '@/features/customer-search/domain/types';
import { releaseReference, tryAcquireReference } from '../domain/idempotency';
import { checkTransactionLimit } from '@/features/limits/api/check-transaction-limit';
import { getWithdrawalFeeTiers } from '../domain/fees';
import type {
  AuthorizedPerson,
  RecipientLookupResult,
  RecipientWallet,
  WithdrawalFeeTier,
  WithdrawalSubmitPayload,
  WithdrawalSubmitResult,
} from '../domain/types';

type MockCustomer = (typeof CUSTOMERS)[number];

function findCustomer(query: { customerNo?: string; idNo?: string }): MockCustomer | null {
  const no = query.customerNo?.trim();
  const idNo = query.idNo?.trim();
  if (!no && !idNo) return null;

  return (
    CUSTOMERS.find((c) => {
      if (no) {
        const parsed = parseCustomerNo(no);
        if (parsed != null && c.id === parsed) return true;
        if (String(c.id) === no) return true;
        if (formatCustomerNo(c.id).toLowerCase() === no.toLowerCase()) return true;
      }
      if (idNo && String(c.idNo).trim() === idNo) return true;
      return false;
    }) ?? null
  );
}

function buildWarnings(c: MockCustomer): CustomerSearchWarning[] {
  const warnings: CustomerSearchWarning[] = [];
  if (c.status === 'blocked') warnings.push({ code: 'blocked', message: 'ag_cs_warn_blocked' });
  if (c.kyc === 'L1' || c.kyc === 'Tier 0') warnings.push({ code: 'kyc_low', message: 'ag_cs_warn_kyc' });
  if (c.riskSeg === 'high' || c.riskSeg === 'critical') {
    warnings.push({ code: 'risk_high', message: 'ag_cs_warn_risk' });
  }
  return warnings;
}

function buildRecipientWallets(customerId: number): RecipientWallet[] {
  return getWallets().filter(
    (w) => w.cat === 'customer' && w.customerId === customerId && w.recordStatus === 1,
  ).map((w) => ({
    walletId: w.id,
    walletNo: w.walletNo,
    currency: w.ccy,
    available: w.available,
    walletKind: w.walletKind ?? 'CustomerPersistent',
  }));
}

/** Tüzel müşteri yetkili kişileri (mock) — biri sanction tetikler. */
function authorizedPersonsFor(c: MockCustomer): AuthorizedPerson[] {
  if (c.type !== 'corporate') return [];
  return [
    { idNo: '10000000146', name: 'Ahmet Yetkili' },
    { idNo: '20000000147', name: 'Sanction Test Kişi' },
  ];
}

/** Onaylı belge eksikliği (mock) — tüzelde kyc 'Approved' değilse eksik say. */
function corporateDocumentMissing(c: MockCustomer): boolean {
  return c.type === 'corporate' && c.kyc !== 'Approved';
}

function requiresIdentityScan(c: MockCustomer): boolean {
  if (c.type !== 'individual') return false;
  if (c.status !== 'active') return false;
  return c.kyc === 'L1' || c.kyc === 'L2' || c.kyc === 'L3';
}

/** Sanction taraması — isimde "sanction" geçen gerçek kişi hit (mock). */
function screenSanction(name: string): boolean {
  return name.toLowerCase().includes('sanction');
}

export interface WithdrawalService {
  lookupRecipient(query: { customerNo?: string; idNo?: string }): RecipientLookupResult | null;
  getWithdrawalFees(currency: string): WithdrawalFeeTier[];
  initiateWithdrawal(payload: WithdrawalSubmitPayload): Promise<WithdrawalSubmitResult>;
}

export const mockWithdrawalAdapter: WithdrawalService = {
  lookupRecipient(query) {
    const c = findCustomer(query);
    if (!c) return null;
    return {
      customerId: c.id,
      customerNo: formatCustomerNo(c.id),
      fullName: c.name,
      idNo: String(c.idNo),
      customerType: c.type === 'corporate' ? 'corporate' : 'individual',
      kycLevel: String(c.kyc),
      status: c.status,
      warnings: buildWarnings(c),
      wallets: buildRecipientWallets(c.id),
      authorizedPersons: authorizedPersonsFor(c),
      requiresIdentityScan: requiresIdentityScan(c),
      documentMissing: corporateDocumentMissing(c),
    };
  },

  getWithdrawalFees(currency) {
    return getWithdrawalFeeTiers(currency);
  },

  async initiateWithdrawal(payload) {
    const ref = payload.transactionReferenceNo.trim() || payload.foreignReferenceNo?.trim() || '';
    if (ref && !tryAcquireReference(ref)) {
      return { ok: false, code: 'DUPLICATE', message: 'ag_wd_err_duplicate' };
    }

    try {
      const limitCheck = await checkTransactionLimit({
        operationType: 'WalletWithdrawal',
        currency: payload.currency,
        amount: payload.amount,
        customerId: payload.customerId,
        walletId: payload.walletId,
        corporateAuthorizedPersonId: payload.authorizedPersonIdNo,
      });
      if (!limitCheck.ok) {
        return { ok: false, code: 'LIMIT_EXCEEDED', message: limitCheck.message };
      }

      const sanctionHit = screenSanction(payload.screenName);
      const status: 'Pending' | 'OnHold' = sanctionHit ? 'OnHold' : 'Pending';

      const now = new Date();
      const createdAt = now.toISOString().slice(0, 19).replace('T', ' ');

      const tx = agentTransactionsStore.addRecord({
        txNo: `TX-WD-${now.getTime().toString().slice(-8)}`,
        referenceNo: ref || `REF-WD-${now.getTime().toString().slice(-8)}`,
        foreignReferenceNo: payload.foreignReferenceNo?.trim() || null,
        senderCustomerId: payload.customerId,
        senderAgentId: null,
        receiverCustomerId: null,
        receiverAgentId: DEMO_AGENT_ID,
        senderWalletId: payload.walletId,
        receiverWalletId: null,
        senderIban: null,
        receiverIban: null,
        type: 'WalletWithdrawal',
        currency: payload.currency,
        amount: payload.amount,
        feeFixed: 0,
        feeVariable: 0,
        status,
        recordStatus: 1,
        createdAt,
        paymentPurpose: 'Nakit Çekim',
        description: payload.isSuspicious ? 'Şüpheli işaretli para çekme' : 'Para çekme talebi',
        withdrawalDate: createdAt.slice(0, 10),
      });

      return { ok: true, transactionId: tx.id, status, sanctionHit };
    } finally {
      if (ref) releaseReference(ref);
    }
  },
};
