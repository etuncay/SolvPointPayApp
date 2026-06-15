import { CUSTOMERS } from '@/mocks/data';
import { getWallets } from '@/lib/wallets-store';
import type { WalletKind } from '@/mocks/wallets';
import { formatCustomerNo, parseCustomerNo } from '@/features/customer-search/domain/format-customer-no';
import type { CustomerSearchWarning } from '@/features/customer-search/domain/types';

type MockCustomer = (typeof CUSTOMERS)[number];

import type { CustomerType } from '@epay/domain';

export type { CustomerType };

export interface AgentCustomerWallet {
  walletId: number;
  walletNo: string;
  currency: string;
  available: number;
  walletKind: WalletKind;
}

export interface AuthorizedPerson {
  idNo: string;
  name: string;
}

/** Gönderen/alıcı ortak lookup sonucu. */
export interface SenderLookupResult {
  customerId: number;
  customerNo: string;
  fullName: string;
  idNo: string;
  customerType: CustomerType;
  kycLevel: string;
  status: string;
  warnings: CustomerSearchWarning[];
  wallets: AgentCustomerWallet[];
  authorizedPersons: AuthorizedPerson[];
  requiresIdentityScan: boolean;
  documentMissing: boolean;
}

export function findCustomerByQuery(query: { customerNo?: string; idNo?: string }): MockCustomer | null {
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

export function buildCustomerWarnings(c: MockCustomer): CustomerSearchWarning[] {
  const warnings: CustomerSearchWarning[] = [];
  if (c.status === 'blocked') warnings.push({ code: 'blocked', message: 'ag_cs_warn_blocked' });
  if (c.kyc === 'L1' || c.kyc === 'Tier 0') warnings.push({ code: 'kyc_low', message: 'ag_cs_warn_kyc' });
  if (c.riskSeg === 'high' || c.riskSeg === 'critical') {
    warnings.push({ code: 'risk_high', message: 'ag_cs_warn_risk' });
  }
  return warnings;
}

export function getCustomerWallets(customerId: number): AgentCustomerWallet[] {
  return getWallets().filter((w) => w.cat === 'customer' && w.customerId === customerId && w.recordStatus === 1).map(
    (w) => ({
      walletId: w.id,
      walletNo: w.walletNo,
      currency: w.ccy,
      available: w.available,
      walletKind: w.walletKind ?? 'CustomerPersistent',
    }),
  );
}

export function authorizedPersonsFor(c: MockCustomer): AuthorizedPerson[] {
  if (c.type !== 'corporate') return [];
  return [
    { idNo: '10000000146', name: 'Ahmet Yetkili' },
    { idNo: '20000000147', name: 'Sanction Test Kişi' },
  ];
}

export function corporateDocumentMissing(c: MockCustomer): boolean {
  return c.type === 'corporate' && c.kyc !== 'Approved';
}

export function requiresIdentityScan(c: MockCustomer): boolean {
  if (c.type !== 'individual') return false;
  if (c.status !== 'active') return false;
  return c.kyc === 'L1' || c.kyc === 'L2' || c.kyc === 'L3';
}

export function lookupSender(query: { customerNo?: string; idNo?: string }): SenderLookupResult | null {
  const c = findCustomerByQuery(query);
  if (!c) return null;
  return {
    customerId: c.id,
    customerNo: formatCustomerNo(c.id),
    fullName: c.name,
    idNo: String(c.idNo),
    customerType: c.type === 'corporate' ? 'corporate' : 'individual',
    kycLevel: String(c.kyc),
    status: c.status,
    warnings: buildCustomerWarnings(c),
    wallets: getCustomerWallets(c.id),
    authorizedPersons: authorizedPersonsFor(c),
    requiresIdentityScan: requiresIdentityScan(c),
    documentMissing: corporateDocumentMissing(c),
  };
}

/** 6.1 — bireysel müşteride KYC L2+ veya tüzel Approved gerekir. */
export { canTopUp as canInitiateTopUp } from '@/features/agent-transfers/domain/kyc-top-up-gate';
