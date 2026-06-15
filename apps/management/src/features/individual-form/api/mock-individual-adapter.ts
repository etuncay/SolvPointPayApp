import { CUSTOMERS, type Customer } from '@/mocks/data';
import { SAMPLE_PERSON } from '@/mocks/sample-person';
import { upsertCustomerFromIndividual } from '@/features/customers/api/mock-customers-adapter';
import type { IndividualCustomersService } from './individual-customers-service';
import type {
  BackgroundCheckStatus,
  IndividualCustomerDetail,
  IndividualFormValues,
  KpsIdentityPayload,
  SaveResult,
} from '../domain/types';
import type { DocumentRow } from '@/mocks/sample-person';
import { validateDocumentsForSave } from '../domain/validation';
import {
  assignCampaignIfChanged,
  campaignEndDateForKey,
} from '@/features/customer-campaigns/api';
import { registerIndividualApprovalApply } from './individual-approval-bridge';

const KPS_DEMO_TCKN = '12345678901';
const KPS_DEMO_BIRTH = '1991-04-18';

let nextId = 100001;
let nextDocId = 100;
let nextBankId = 100;
let nextAddrId = 100;
let nextContactId = 100;

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') || (parts[0] ?? '') };
}

function customerToDetail(c: (typeof CUSTOMERS)[number], index: number): IndividualCustomerDetail {
  const { firstName, lastName } = splitName(c.name);
  const isSample = c.idNo === SAMPLE_PERSON.idNo;
  const base = isSample
    ? { ...SAMPLE_PERSON }
    : {
        ...SAMPLE_PERSON,
        firstName,
        lastName,
        idNo: c.idNo,
        idType: (c.idKind === 'TCKN' ? 'TCKN' : 'PASSPORT') as 'TCKN' | 'PASSPORT',
        idCountry: 'TUR',
        birthPlace: c.city,
        customerNo: `MUS-${String(c.id).padStart(7, '0')}`,
        status: c.status === 'prospect' ? 'prospect' : c.status,
        statusReason: c.blockReason ?? c.closeReason,
        kycLevel: c.kyc.startsWith('L') ? c.kyc : 'L2',
        riskScore: c.riskScore,
        riskSegment: c.riskSeg,
        createdAt: `${c.createdAt}T12:00:00`,
        campaign: c.campaign ?? '',
        customerType: c.type === 'prospective' ? 'prospective' : 'individual',
        banks: index % 3 === 0 ? [] : SAMPLE_PERSON.banks.slice(0, 1),
        addresses: index % 2 === 0 ? SAMPLE_PERSON.addresses.slice(0, 1) : [],
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
          },
        ],
        documents: isSample ? SAMPLE_PERSON.documents : [],
        wallets: c.type === 'prospective' ? [] : SAMPLE_PERSON.wallets.slice(0, 1),
      };

  return { ...base, id: c.id, blockEndDate: null };
}

function buildStore(): Map<number, IndividualCustomerDetail> {
  const map = new Map<number, IndividualCustomerDetail>();
  CUSTOMERS.forEach((c, i) => {
    if (c.type === 'individual' || c.type === 'prospective') {
      map.set(c.id, customerToDetail(c, i));
    }
  });
  return map;
}

let store = buildStore();

/** Test izolasyonu — store'u seed'e döndürür. */
export function resetIndividualStore(): void {
  store = buildStore();
  nextId = 100001;
  nextDocId = 100;
  nextBankId = 100;
  nextAddrId = 100;
  nextContactId = 100;
}

/** Belge inceleme kararı sonrası müşteri alanlarını günceller (mock). */
export function patchIndividualFromReview(
  id: number,
  patch: {
    status?: string;
    kycLevel?: string;
    statusReason?: string | null;
  },
): void {
  const existing = store.get(id);
  if (!existing) return;
  const detail: IndividualCustomerDetail = {
    ...existing,
    status: patch.status ?? existing.status,
    kycLevel: patch.kycLevel ?? existing.kycLevel,
    statusReason: patch.statusReason !== undefined ? patch.statusReason : existing.statusReason,
  };
  store.set(id, detail);
  syncList(detail);
}

function formToDetail(id: number, payload: IndividualFormValues, status: string): IndividualCustomerDetail {
  const { firstName, lastName } = splitName(payload.fullName);
  return {
    ...payload,
    firstName,
    lastName,
    id,
    customerNo: payload.customerNo || `MUS-${String(id).padStart(7, '0')}`,
    status,
    wallets: payload.wallets ?? [],
    limits: payload.limits ?? { perTx: 50000, daily: 80000, monthly: 500000, currency: 'TRY' },
    lastLogin: payload.lastLogin ?? new Date().toISOString(),
    failedAttempts: payload.failedAttempts ?? 0,
    device: payload.device ?? '—',
    ipLocation: payload.ipLocation ?? '—',
    campaignEndDate: payload.campaignEndDate ?? '',
    kycLevel: payload.kycLevel ?? 'L1',
    riskScore: payload.riskScore ?? 0,
    riskSegment: payload.riskSegment ?? 'low',
    createdAt: payload.createdAt ?? new Date().toISOString(),
    statusReason: payload.statusReason ?? null,
  };
}

function syncList(detail: IndividualCustomerDetail) {
  const email = detail.contacts.find((c) => c.type === 'email' && c.primary)?.value ?? detail.contacts.find((c) => c.type === 'email')?.value ?? '';
  const phone = detail.contacts.find((c) => c.type === 'phone' && c.primary)?.value ?? detail.contacts.find((c) => c.type === 'phone')?.value ?? '';
  upsertCustomerFromIndividual({
    id: detail.id,
    type: detail.customerType === 'prospective' ? 'prospective' : 'individual',
    name: `${detail.firstName} ${detail.lastName}`.trim(),
    isFemale: detail.gender === 'female',
    email,
    phone,
    idKind: detail.idType === 'TCKN' ? 'TCKN' : 'PASS',
    idNo: detail.idNo,
    city: detail.birthPlace,
    campaign: detail.campaign || null,
    kyc: detail.kycLevel,
    kycType: 'kyc_level',
    riskScore: detail.riskScore,
    riskSeg: detail.riskSegment as 'low' | 'med' | 'high',
    createdAt: detail.createdAt.slice(0, 10),
    status: detail.status === 'prospect' ? 'prospect' : (detail.status as 'active' | 'inactive' | 'blocked' | 'closed'),
    blockReason: detail.status === 'blocked' ? (detail.statusReason as Customer['blockReason']) : null,
    closeReason: detail.status === 'closed' ? (detail.statusReason as Customer['closeReason']) : null,
  } as Customer);
}

export const mockIndividualAdapter: IndividualCustomersService = {
  getById(id) {
    return store.get(Number(id)) ?? null;
  },

  lookupByIdentity(idNo, birthDate) {
    for (const d of store.values()) {
      if (d.idNo === idNo && d.birthDate === birthDate) return d;
    }
    return null;
  },

  create(payload, opts) {
    const status = opts?.draft ? 'inactive' : payload.customerType === 'prospective' ? 'prospect' : 'active';
    if (!opts?.draft) {
      const docErr = validateDocumentsForSave(payload.documents);
      if (docErr) return { ok: false, error: docErr };
    }
    const id = nextId++;
    const detail = formToDetail(id, payload, status);
    store.set(id, detail);
    syncList(detail);
    return { ok: true, id, customerNo: detail.customerNo };
  },

  update(id, payload) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'if_not_found' };
    const docErr = validateDocumentsForSave(payload.documents);
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
      lastLogin: existing.lastLogin,
      failedAttempts: existing.failedAttempts,
      device: existing.device,
      ipLocation: existing.ipLocation,
    }, existing.status === 'prospect' ? 'prospect' : existing.status);
    store.set(numId, detail);
    syncList(detail);
    return { ok: true, id: numId, customerNo: detail.customerNo };
  },

  block(id, reason, blockEndDate) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'if_not_found' };
    const detail = { ...existing, status: 'blocked', statusReason: reason, blockEndDate: blockEndDate ?? null };
    store.set(numId, detail);
    syncList(detail);
    return { ok: true, id: numId };
  },

  unblock(id) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'if_not_found' };
    const detail = { ...existing, status: 'active', statusReason: null, blockEndDate: null };
    store.set(numId, detail);
    syncList(detail);
    return { ok: true, id: numId };
  },

  fetchKps(idNo, birthDate) {
    if (idNo === KPS_DEMO_TCKN && birthDate === KPS_DEMO_BIRTH) {
      return {
        firstName: SAMPLE_PERSON.firstName,
        lastName: SAMPLE_PERSON.lastName,
        birthPlace: SAMPLE_PERSON.birthPlace,
        maritalStatus: SAMPLE_PERSON.maritalStatus,
        serialNo: SAMPLE_PERSON.serialNo,
        issueDate: SAMPLE_PERSON.issueDate,
        issuingAuthority: SAMPLE_PERSON.issuingAuthority,
        validityDate: SAMPLE_PERSON.validityDate,
        motherName: SAMPLE_PERSON.motherName,
        fatherName: SAMPLE_PERSON.fatherName,
        gender: SAMPLE_PERSON.gender,
      } satisfies KpsIdentityPayload;
    }
    return null;
  },

  runBackgroundChecks(_id, payload) {
    const ibanTotal = payload.banks.length;
    const ibanVerified = payload.banks.filter((b) => b.iban.replace(/\s/g, '').startsWith('TR')).length;
    const hit = payload.lastName.toLowerCase().includes('sanction');
    return {
      kps: payload.idCountry === 'TUR' ? 'ok' : 'pending',
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

export function createEmptyFormValues(): IndividualFormValues {
  return {
    fullName: '',
    firstName: '',
    lastName: '',
    idType: 'TCKN',
    idCountry: 'TUR',
    idNo: '',
    birthDate: '',
    customerType: 'individual',
    customerNo: '',
    campaign: '',
    campaignEndDate: '',
    kycLevel: 'L1',
    riskScore: 0,
    riskSegment: 'low',
    createdAt: new Date().toISOString(),
    status: 'inactive',
    statusReason: null,
    lastLogin: '',
    failedAttempts: 0,
    device: '',
    ipLocation: '',
    birthPlace: '',
    maritalStatus: 'single',
    serialNo: '',
    issueDate: '',
    issuingAuthority: '',
    validityDate: '',
    motherName: '',
    fatherName: '',
    gender: 'male',
    maidenName: '',
    taxCountry: 'TUR',
    education: '',
    employment: '',
    occupation: '',
    employer: '',
    language: 'tr',
    notes: '',
    visaType: null,
    visaEndDate: null,
    residencePermit: null,
    residencePermitEnd: null,
    birthCountry: 'TUR',
    residentCountry: 'TUR',
    banks: [],
    wallets: [],
    addresses: [],
    contacts: [],
    documents: [],
    limits: { perTx: 50000, daily: 80000, monthly: 500000, currency: 'TRY' },
  };
}

export function detailToFormValues(d: IndividualCustomerDetail): IndividualFormValues {
  return {
    ...d,
    fullName: `${d.firstName} ${d.lastName}`.trim(),
  };
}

// 8.1 Onay Havuzu — bireysel müşteri onaylandığında gerçek create/update uygulanır.
registerIndividualApprovalApply((meta) => {
  if (meta.mode === 'new') {
    mockIndividualAdapter.create(meta.fullValues);
  } else if (meta.customerId) {
    mockIndividualAdapter.update(meta.customerId, meta.fullValues);
  }
});

function allocId(seed: number) {
  return Date.now() + seed;
}
