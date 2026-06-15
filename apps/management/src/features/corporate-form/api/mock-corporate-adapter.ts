import { CUSTOMERS, type Customer } from '@/mocks/data';
import { SAMPLE_CORPORATE } from '@/mocks/sample-corporate';
import { upsertCustomerFromCorporate } from '@/features/customers/api/mock-customers-adapter';
import type { CorporateCustomersService } from './corporate-customers-service';
import type {
  BackgroundCheckStatus,
  CorporateCustomerDetail,
  CorporateFormValues,
  SaveResult,
} from '../domain/types';
import type { DocumentRow } from '@/mocks/sample-person';
import {
  validateCorporateDocumentsForSave,
} from '../domain/required-documents';
import type { OrganizationType } from '../domain/types';
import {
  assignCampaignIfChanged,
  campaignEndDateForKey,
} from '@/features/customer-campaigns/api';
import { registerCorporateApprovalApply } from './corporate-approval-bridge';

const VKN_DEMO = '1792956117';

let nextId = 200001;
let nextDocId = 200;
let nextShId = 200;
let nextAuthId = 200;

/** Spec §14 — denetim izi stub (insert/update/block/shareholder/authorized) */
export type CorporateAuditEntry = {
  action: 'insert' | 'update' | 'block' | 'unblock';
  id: number;
  at: string;
};

let auditLog: CorporateAuditEntry[] = [];

export function logCorporateChange(action: CorporateAuditEntry['action'], id: number): void {
  auditLog.push({ action, id, at: new Date().toISOString() });
}

export function getCorporateAuditLog(): CorporateAuditEntry[] {
  return auditLog;
}

export function resetCorporateAuditLog(): void {
  auditLog = [];
}

function customerToDetail(c: (typeof CUSTOMERS)[number]): CorporateCustomerDetail {
  const isSample = c.idNo === SAMPLE_CORPORATE.taxNo;
  const base = isSample
    ? { ...SAMPLE_CORPORATE }
    : {
        ...SAMPLE_CORPORATE,
        tradeName: c.name,
        taxNo: c.idNo,
        customerNo: `MUS-${String(c.id).padStart(7, '0')}`,
        kycStatus: c.kycType === 'approval_status' ? c.kyc : 'Pending',
        riskScore: c.riskScore,
        riskSegment: c.riskSeg,
        createdAt: `${c.createdAt}T12:00:00`,
        status: c.status,
        statusReason: c.blockReason ?? c.closeReason,
        campaign: c.campaign ?? '',
        contacts: [
          {
            id: 1,
            type: 'email' as const,
            value: c.email,
            verified: true,
            primary: true,
          },
          {
            id: 2,
            type: 'phone' as const,
            value: c.phone,
            verified: true,
            primary: true,
            kind: 'mobile',
          },
        ],
        addresses: SAMPLE_CORPORATE.addresses.slice(0, 1),
        banks: [],
        documents: [],
        shareholders: [],
        authorizedPersons: [],
        wallets: SAMPLE_CORPORATE.wallets.slice(0, 1),
      };

  return { ...base, id: c.id, blockEndDate: null };
}

function buildStore(): Map<number, CorporateCustomerDetail> {
  const map = new Map<number, CorporateCustomerDetail>();
  CUSTOMERS.forEach((c) => {
    if (c.type === 'corporate') {
      map.set(c.id, customerToDetail(c));
    }
  });
  return map;
}

let store = buildStore();

function formToDetail(
  id: number,
  payload: CorporateFormValues,
  status: string,
  kycStatus?: string,
): CorporateCustomerDetail {
  return {
    ...payload,
    id,
    customerNo: payload.customerNo || `MUS-${String(id).padStart(7, '0')}`,
    status,
    kycStatus: kycStatus ?? payload.kycStatus,
    wallets: payload.wallets ?? [],
    limits: payload.limits ?? { perTx: 100000, daily: 500000, monthly: 2000000, currency: 'TRY' },
    createdAt: payload.createdAt ?? new Date().toISOString(),
    statusReason: payload.statusReason ?? null,
  };
}

function syncList(detail: CorporateCustomerDetail) {
  const email =
    detail.contacts.find((c) => c.type === 'email' && c.primary)?.value ??
    detail.contacts.find((c) => c.type === 'email')?.value ??
    '';
  const phone =
    detail.contacts.find((c) => c.type === 'phone' && c.primary)?.value ??
    detail.contacts.find((c) => c.type === 'phone')?.value ??
    '';
  upsertCustomerFromCorporate({
    id: detail.id,
    type: 'corporate',
    name: detail.tradeName,
    isFemale: false,
    email,
    phone,
    idKind: 'VKN',
    idNo: detail.taxNo,
    city: detail.addresses[0]?.city ?? '—',
    campaign: detail.campaign || null,
    kyc: detail.kycStatus,
    kycType: 'approval_status',
    riskScore: detail.riskScore,
    riskSeg: detail.riskSegment as 'low' | 'med' | 'high',
    createdAt: detail.createdAt.slice(0, 10),
    status: detail.status as 'active' | 'inactive' | 'blocked' | 'closed',
    blockReason: detail.status === 'blocked' ? (detail.statusReason as Customer['blockReason']) : null,
    closeReason: detail.status === 'closed' ? (detail.statusReason as Customer['closeReason']) : null,
  } as Customer);
}

export const mockCorporateAdapter: CorporateCustomersService = {
  getById(id) {
    return store.get(Number(id)) ?? null;
  },

  lookupByTaxNo(taxNo) {
    for (const d of store.values()) {
      if (d.taxNo === taxNo) return d;
    }
    return null;
  },

  create(payload, opts) {
    if (!opts?.draft) {
      if (payload.organizationType === 'ForeignLegalEntity') {
        return { ok: false, error: 'cf_foreign_blocked' };
      }
      const docErr = validateCorporateDocumentsForSave(
        payload.organizationType as OrganizationType,
        payload.documents,
      );
      if (docErr) return { ok: false, error: docErr };
    }
    // Spec §9 basitleştirilmiş KYB: taslak → Inactive/NULL; Kaydet (belge+sanction OK) → Approved/Active
    const status = opts?.draft ? 'inactive' : 'active';
    const kycStatus = opts?.draft ? '' : 'Approved';
    const id = nextId++;
    const detail = formToDetail(id, payload, status, kycStatus);
    store.set(id, detail);
    syncList(detail);
    logCorporateChange('insert', id);
    return { ok: true, id, customerNo: detail.customerNo };
  },

  update(id, payload) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'if_not_found' };
    if (payload.organizationType === 'ForeignLegalEntity') {
      return { ok: false, error: 'cf_foreign_blocked' };
    }
    const docErr = validateCorporateDocumentsForSave(
      payload.organizationType as OrganizationType,
      payload.documents,
    );
    if (docErr) return { ok: false, error: docErr };

    const assignResult = assignCampaignIfChanged(
      numId,
      payload.campaign ?? '',
      existing.campaign ?? '',
    );
    if (assignResult && assignResult.startsWith('ccm_')) {
      return { ok: false, error: assignResult };
    }
    let campaignEndDate = existing.campaignEndDate;
    if ((payload.campaign ?? '').trim() !== (existing.campaign ?? '').trim()) {
      campaignEndDate = assignResult ?? campaignEndDateForKey(payload.campaign ?? '');
    }

    const detail = formToDetail(numId, {
      ...payload,
      campaignEndDate,
      customerNo: existing.customerNo,
      createdAt: existing.createdAt,
      wallets: existing.wallets,
      limits: existing.limits,
    }, existing.status);
    store.set(numId, detail);
    syncList(detail);
    logCorporateChange('update', numId);
    return { ok: true, id: numId, customerNo: detail.customerNo };
  },

  block(id, reason, blockEndDate) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'if_not_found' };
    const detail = { ...existing, status: 'blocked', statusReason: reason, blockEndDate: blockEndDate ?? null };
    store.set(numId, detail);
    syncList(detail);
    logCorporateChange('block', numId);
    return { ok: true, id: numId };
  },

  unblock(id) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'if_not_found' };
    const detail = { ...existing, status: 'active', statusReason: null, blockEndDate: null };
    store.set(numId, detail);
    syncList(detail);
    logCorporateChange('unblock', numId);
    return { ok: true, id: numId };
  },

  runBackgroundChecks(_id, payload) {
    const ibanTotal = payload.banks.length;
    const ibanVerified = payload.banks.filter((b) => b.iban.replace(/\s/g, '').startsWith('TR')).length;
    const names = [
      payload.tradeName,
      ...payload.shareholders.map((s) => s.name),
      ...payload.authorizedPersons.map((a) => a.name),
    ];
    const hit = names.some((n) => n.toLowerCase().includes('sanction'));
    return {
      vkn: payload.taxNo.length === 10 ? 'ok' : 'pending',
      sanction: hit ? 'hit' : 'clean',
      ibanVerified,
      ibanTotal,
      lastRunAt: new Date().toISOString(),
    } satisfies BackgroundCheckStatus;
  },

  uploadDocument(customerId, doc) {
    const row: DocumentRow = {
      id: nextDocId++,
      category: doc.category,
      type: doc.type,
      validFrom: doc.validFrom,
      validTo: doc.validTo,
      status: 'pending',
    };
    if (customerId) {
      const numId = Number(customerId);
      const existing = store.get(numId);
      if (existing) {
        store.set(numId, { ...existing, documents: [...existing.documents, row] });
      }
    }
    return row;
  },
};

export function resetCorporateStore(): void {
  store = buildStore();
  nextId = 200001;
  nextDocId = 200;
  nextShId = 200;
  nextAuthId = 200;
  auditLog = [];
}

/** Belge inceleme kararı sonrası tüzel müşteri alanlarını günceller (mock). */
export function patchCorporateFromReview(
  id: number,
  patch: {
    status?: string;
    kycStatus?: string;
    statusReason?: string | null;
  },
): void {
  const existing = store.get(id);
  if (!existing) return;
  const detail: CorporateCustomerDetail = {
    ...existing,
    status: patch.status ?? existing.status,
    kycStatus: patch.kycStatus ?? existing.kycStatus,
    statusReason: patch.statusReason !== undefined ? patch.statusReason : existing.statusReason,
  };
  store.set(id, detail);
  syncList(detail);
}

export function createEmptyFormValues(): CorporateFormValues {
  return {
    tradeName: '',
    taxNo: '',
    customerNo: '',
    campaign: '',
    campaignEndDate: '',
    kycStatus: '',
    riskScore: 0,
    riskSegment: 'low',
    createdAt: new Date().toISOString(),
    status: 'inactive',
    statusReason: null,
    organizationType: 'LimitedCompany',
    registryNo: '',
    mersisNo: '',
    taxOffice: '',
    activitySubject: '',
    establishmentDate: '',
    country: 'TUR',
    ownershipType: 'domestic',
    staffCount: 1,
    language: 'tr',
    notes: '',
    banks: [],
    wallets: [],
    addresses: [],
    contacts: [],
    documents: [],
    shareholders: [],
    authorizedPersons: [],
    limits: { perTx: 100000, daily: 500000, monthly: 2000000, currency: 'TRY' },
  };
}

export function detailToFormValues(d: CorporateCustomerDetail): CorporateFormValues {
  return { ...d };
}

/** VKN blur demo — örnek kayıt */
export function fetchVknDemo(taxNo: string): Partial<CorporateFormValues> | null {
  if (taxNo !== VKN_DEMO) return null;
  return {
    tradeName: SAMPLE_CORPORATE.tradeName,
    organizationType: SAMPLE_CORPORATE.organizationType,
    registryNo: SAMPLE_CORPORATE.registryNo,
    mersisNo: SAMPLE_CORPORATE.mersisNo,
    taxOffice: SAMPLE_CORPORATE.taxOffice,
    activitySubject: SAMPLE_CORPORATE.activitySubject,
    establishmentDate: SAMPLE_CORPORATE.establishmentDate,
    country: SAMPLE_CORPORATE.country,
    ownershipType: SAMPLE_CORPORATE.ownershipType,
    staffCount: SAMPLE_CORPORATE.staffCount,
  };
}

export function createShareholderRow(seed: number) {
  return {
    id: nextShId++,
    refNo: '',
    refType: 'TCKN' as const,
    partyType: 'individual' as const,
    name: '',
    directShare: 0,
    indirectShare: 0,
    isUbo: false,
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    status: 'active',
  };
}

export function createAuthorizedRow(seed: number) {
  return {
    id: nextAuthId++,
    personId: '',
    name: '',
    hasOperationAuth: false,
    hasSignatureAuth: false,
    singleTxLimit: 0,
    dailyLimit: 0,
    monthlyLimit: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    status: 'active',
    kycLevel: 'L0',
  };
}

// 8.1 Onay Havuzu — kurumsal müşteri onaylandığında gerçek create/update uygulanır.
registerCorporateApprovalApply((meta) => {
  if (meta.mode === 'new') {
    mockCorporateAdapter.create(meta.fullValues);
  } else if (meta.customerId) {
    mockCorporateAdapter.update(meta.customerId, meta.fullValues);
  }
});

/** Yetkili TCKN mock lookup — personId 11 hane ise ad + KYC seviyesi döner */
export function lookupAuthorizedPerson(personId: string): { name: string; kycLevel: string } | null {
  const id = personId.trim();
  if (!/^\d{11}$/.test(id) || id.startsWith('0')) return null;
  const kycLevel = id.startsWith('1') || id.startsWith('2') ? 'L2' : 'L1';
  return { name: `Yetkili ${id.slice(-4)}`, kycLevel };
}
