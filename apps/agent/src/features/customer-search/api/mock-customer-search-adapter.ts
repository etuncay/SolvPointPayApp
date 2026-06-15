import { CUSTOMERS } from '@/mocks/data';
import { TRANSACTIONS } from '@/mocks/transactions';
import { getWallets } from '@/lib/wallets-store';
import { documentValidityLabel } from '../domain/document-validity';
import { formatCustomerNo, parseCustomerNo } from '../domain/format-customer-no';
import { isPendingTransactionStatus } from '../domain/pending-transaction-status';
import type {
  CustomerAccountRow,
  CustomerDocumentViewRow,
  CustomerPendingTxRow,
  CustomerProfilePanel,
  CustomerSearchQuery,
  CustomerSearchResult,
  CustomerSearchWarning,
  DocumentUploadInput,
} from '../domain/types';

type MockCustomer = (typeof CUSTOMERS)[number];

const documentStore = new Map<number, CustomerDocumentViewRow[]>();

function seedDocuments(): void {
  if (documentStore.size > 0) return;
  const samples: Array<{ id: number; docs: CustomerDocumentViewRow[] }> = [
    {
      id: 99901,
      docs: [
        {
          id: 'doc-99901-1',
          category: 'Identity',
          type: 'IdentityCard',
          validFrom: '2020-01-15',
          validTo: '2030-01-14',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'kimlik-on.pdf',
        },
        {
          id: 'doc-99901-2',
          category: 'ProofOfFunds',
          type: 'SalarySlip',
          validFrom: '2025-01-01',
          validTo: null,
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'unlimited',
          fileName: 'gelir-belgesi.pdf',
        },
      ],
    },
    {
      id: 99902,
      docs: [
        {
          id: 'doc-99902-1',
          category: 'Identity',
          type: 'IdentityCard',
          validFrom: '2019-06-01',
          validTo: '2025-04-01',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'expired',
          fileName: 'hacar-kimlik.pdf',
        },
      ],
    },
    {
      id: 99904,
      docs: [
        {
          id: 'doc-99904-1',
          category: 'Identity',
          type: 'IdentityCard',
          validFrom: '2021-03-10',
          validTo: '2031-03-09',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'karaca-kimlik-on.pdf',
        },
        {
          id: 'doc-99904-2',
          category: 'Identity',
          type: 'IdentityCard',
          validFrom: '2021-03-10',
          validTo: '2031-03-09',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'karaca-kimlik-arka.pdf',
        },
        {
          id: 'doc-99904-3',
          category: 'ProofOfAddress',
          type: 'UtilityBill',
          validFrom: '2026-04-01',
          validTo: '2026-07-01',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'karaca-fatura.pdf',
        },
      ],
    },
    {
      id: 99909,
      docs: [
        {
          id: 'doc-99909-1',
          category: 'Identity',
          type: 'Passport',
          validFrom: '2022-08-20',
          validTo: '2032-08-19',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'ozturk-pasaport.pdf',
        },
        {
          id: 'doc-99909-2',
          category: 'ProofOfFunds',
          type: 'BankStatement',
          validFrom: '2026-03-01',
          validTo: '2026-06-30',
          documentStatus: 'Active',
          approvalStatus: 'Pending',
          validityLabel: 'soon',
          fileName: 'ozturk-hesap-ozeti.pdf',
        },
      ],
    },
    {
      id: 99917,
      docs: [
        {
          id: 'doc-99917-1',
          category: 'Identity',
          type: 'IdentityCard',
          validFrom: '2023-01-10',
          validTo: '2033-01-09',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'koc-kimlik.pdf',
        },
        {
          id: 'doc-99917-2',
          category: 'ProofOfFunds',
          type: 'TaxReturn',
          validFrom: '2025-04-01',
          validTo: null,
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'unlimited',
          fileName: 'koc-vergi-beyanname.pdf',
        },
        {
          id: 'doc-99917-3',
          category: 'ProofOfAddress',
          type: 'ResidencePermit',
          validFrom: '2024-06-01',
          validTo: '2026-06-01',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'soon',
          fileName: 'koc-ikamet.pdf',
        },
      ],
    },
    {
      id: 99921,
      docs: [
        {
          id: 'doc-99921-1',
          category: 'Identity',
          type: 'DrivingLicense',
          validFrom: '2020-11-15',
          validTo: '2030-11-14',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'ozturk-ehliyet.pdf',
        },
      ],
    },
    {
      id: 99959,
      docs: [
        {
          id: 'doc-99959-1',
          category: 'Identity',
          type: 'IdentityCard',
          validFrom: '2022-05-18',
          validTo: '2032-05-17',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'aktas-kimlik-on.pdf',
        },
        {
          id: 'doc-99959-2',
          category: 'ProofOfAddress',
          type: 'UtilityBill',
          validFrom: '2026-05-01',
          validTo: '2026-08-01',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'aktas-elektrik-fatura.pdf',
        },
        {
          id: 'doc-99959-3',
          category: 'ProofOfFunds',
          type: 'SalarySlip',
          validFrom: '2026-05-01',
          validTo: null,
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'unlimited',
          fileName: 'aktas-maas-bordro.pdf',
        },
      ],
    },
    {
      id: 99960,
      docs: [
        {
          id: 'doc-99960-1',
          category: 'Identity',
          type: 'IdentityCard',
          validFrom: '2018-09-12',
          validTo: '2028-09-11',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'demirtas-kimlik.pdf',
        },
        {
          id: 'doc-99960-2',
          category: 'Other',
          type: 'PowerOfAttorney',
          validFrom: '2025-01-01',
          validTo: '2026-12-31',
          documentStatus: 'Active',
          approvalStatus: 'Approved',
          validityLabel: 'valid',
          fileName: 'demirtas-vekaletname.pdf',
        },
      ],
    },
  ];
  for (const s of samples) {
    documentStore.set(
      s.id,
      s.docs.map((d) => ({ ...d, validityLabel: documentValidityLabel(d.validTo) })),
    );
  }
}

function findCustomer(query: CustomerSearchQuery): MockCustomer | null {
  const no = query.customerNo?.trim();
  const idNo = query.idNo?.trim();
  if (!no && !idNo) return null;

  return (
    CUSTOMERS.find((c) => {
      if (c.type !== 'individual') return false;
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

function mapRiskSegment(seg: string): string {
  if (seg === 'low') return 'Low';
  if (seg === 'med') return 'Medium';
  if (seg === 'high') return 'High';
  return seg;
}

function buildProfile(c: MockCustomer): CustomerProfilePanel {
  return {
    customerId: c.id,
    customerNo: formatCustomerNo(c.id),
    fullName: c.name,
    idNo: String(c.idNo),
    kycLevel: String(c.kyc),
    riskSegment: mapRiskSegment(c.riskSeg),
    primaryPhone: c.phone,
    primaryEmail: c.email,
    city: c.city,
    district: '—',
    membershipDate: c.createdAt,
    campaign: c.campaign,
    campaignEndDate: c.campaign ? `${c.createdAt.slice(0, 4)}-12-31` : null,
    status: c.status,
    statusReason: c.blockReason ?? c.closeReason,
    isSuspicious: false,
  };
}

function buildWarnings(c: MockCustomer, docs: CustomerDocumentViewRow[]): CustomerSearchWarning[] {
  const warnings: CustomerSearchWarning[] = [];
  if (c.status === 'blocked') {
    warnings.push({ code: 'blocked', message: 'ag_cs_warn_blocked' });
  }
  if (c.kyc === 'L1' || c.kyc === 'Tier 0') {
    warnings.push({ code: 'kyc_low', message: 'ag_cs_warn_kyc' });
  }
  if (c.riskSeg === 'high') {
    warnings.push({ code: 'risk_high', message: 'ag_cs_warn_risk' });
  }
  if (docs.some((d) => d.validityLabel === 'expired')) {
    warnings.push({ code: 'doc_expired', message: 'ag_cs_warn_doc_expired' });
  }
  if (docs.some((d) => d.validityLabel === 'soon')) {
    warnings.push({ code: 'doc_soon', message: 'ag_cs_warn_doc_soon' });
  }
  return warnings;
}

function mockLimits(kyc: string): { w: number; t: number; i: number } {
  if (kyc === 'L2' || kyc === 'L3') return { w: 50000, t: 100000, i: 25000 };
  if (kyc === 'L1') return { w: 10000, t: 25000, i: 5000 };
  return { w: 5000, t: 10000, i: 0 };
}

function customerName(id: number | null): string {
  if (id == null) return '—';
  const c = CUSTOMERS.find((x) => x.id === id);
  return c?.name ?? '—';
}

export interface CustomerSearchService {
  search(query: CustomerSearchQuery): CustomerSearchResult | null;
  getProfileRow(customerId: number): CustomerProfilePanel | null;
  getAccounts(customerId: number): CustomerAccountRow[];
  getPendingTransactions(customerId: number): CustomerPendingTxRow[];
  listDocuments(customerId: number): CustomerDocumentViewRow[];
  uploadDocument(customerId: number, input: DocumentUploadInput): CustomerDocumentViewRow;
}

export const mockCustomerSearchAdapter: CustomerSearchService = {
  search(query) {
    seedDocuments();
    const c = findCustomer(query);
    if (!c) return null;
    const docs = documentStore.get(c.id) ?? [];
    const profile = buildProfile(c);
    const warnings = buildWarnings(c, docs);
    return { profile, warnings };
  },

  getProfileRow(customerId) {
    const c = CUSTOMERS.find((x) => x.id === customerId && x.type === 'individual');
    return c ? buildProfile(c) : null;
  },

  getAccounts(customerId) {
    const c = CUSTOMERS.find((x) => x.id === customerId);
    if (!c) return [];
    const limits = mockLimits(String(c.kyc));
    return getWallets().filter((w) => w.cat === 'customer' && w.customerId === customerId && w.recordStatus === 1).map(
      (w) => ({
        walletId: w.id,
        walletNo: w.walletNo,
        availableBalance: w.available,
        currency: w.ccy,
        withdrawalLimit: limits.w,
        transferLimit: limits.t,
        internationalLimit: limits.i,
      }),
    );
  },

  getPendingTransactions(customerId) {
    return TRANSACTIONS.filter(
      (tx) =>
        tx.recordStatus === 1 &&
        isPendingTransactionStatus(tx.status) &&
        (tx.senderCustomerId === customerId || tx.receiverCustomerId === customerId),
    ).map((tx) => ({
      transactionId: tx.id,
      transactionNo: tx.txNo,
      createdAt: tx.createdAt,
      transactionType: tx.type,
      currency: tx.currency,
      amount: tx.amount,
      status: tx.status,
      senderName: customerName(tx.senderCustomerId),
      receiverName: customerName(tx.receiverCustomerId),
      description: tx.description ?? null,
    }));
  },

  listDocuments(customerId) {
    seedDocuments();
    return [...(documentStore.get(customerId) ?? [])];
  },

  uploadDocument(customerId, input) {
    seedDocuments();
    const row: CustomerDocumentViewRow = {
      id: `doc-${customerId}-${Date.now()}`,
      category: input.category,
      type: input.type,
      validFrom: input.validFrom ?? null,
      validTo: input.validTo ?? null,
      documentStatus: 'Pending',
      approvalStatus: 'Pending',
      validityLabel: documentValidityLabel(input.validTo ?? null),
      fileName: input.fileName,
    };
    const list = documentStore.get(customerId) ?? [];
    documentStore.set(customerId, [...list, row]);
    return row;
  },
};
