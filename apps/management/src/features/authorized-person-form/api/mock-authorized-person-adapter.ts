import { SAMPLE_PERSON } from '@/mocks/sample-person';
import { SAMPLE_AUTHORIZED_PERSON } from '@/mocks/sample-authorized-person';
import type { DocumentRow } from '@/mocks/sample-person';
import type { AuthorizedPersonService } from './authorized-person-service';
import type {
  AuthorizedPersonDetail,
  AuthorizedPersonFormValues,
  BackgroundCheckStatus,
  KpsIdentityPayload,
} from '../domain/types';
import { assertAuthorizedPersonAge } from '../domain/age-guard';
import { validatePersonDocumentsForSave } from '../domain/validation';
import { registerAuthorizedPersonApprovalApply } from './authorized-person-approval-bridge';

const KPS_DEMO_TCKN = '12345678901';
const KPS_DEMO_BIRTH = '1991-04-18';

let nextId = 88002;
let nextDocId = 500;

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') || (parts[0] ?? '') };
}

function buildStore(): Map<number, AuthorizedPersonDetail> {
  const map = new Map<number, AuthorizedPersonDetail>();
  map.set(SAMPLE_AUTHORIZED_PERSON.id, { ...SAMPLE_AUTHORIZED_PERSON });
  return map;
}

const store = buildStore();

function formToDetail(
  id: number,
  payload: AuthorizedPersonFormValues,
  status: string,
  personNo: string,
): AuthorizedPersonDetail {
  const { firstName, lastName } = splitName(payload.fullName);
  return {
    ...payload,
    firstName,
    lastName,
    id,
    personNo,
    status,
    kycLevel: payload.kycLevel ?? 'L1',
    riskScore: payload.riskScore ?? 0,
    riskSegment: payload.riskSegment ?? 'low',
    createdAt: payload.createdAt ?? new Date().toISOString(),
    statusReason: payload.statusReason ?? null,
    lastLogin: payload.lastLogin ?? new Date().toISOString(),
    failedAttempts: payload.failedAttempts ?? 0,
    device: payload.device ?? '—',
    ipLocation: payload.ipLocation ?? '—',
    blockEndDate: null,
  };
}

export const mockAuthorizedPersonAdapter: AuthorizedPersonService = {
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
    const status = opts?.draft ? 'inactive' : 'active';
    if (!opts?.draft) {
      const ageErr = assertAuthorizedPersonAge(payload.birthDate);
      if (ageErr) return { ok: false, error: ageErr };
      const docErr = validatePersonDocumentsForSave(payload.documents);
      if (docErr) return { ok: false, error: docErr };
    }
    const id = nextId++;
    const personNo = `KIS-${String(id).padStart(6, '0')}`;
    const detail = formToDetail(id, payload, status, personNo);
    store.set(id, detail);
    return { ok: true, id, personNo };
  },

  update(id, payload) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'ap2_not_found' };

    const ageErr = assertAuthorizedPersonAge(payload.birthDate);
    if (ageErr) return { ok: false, error: ageErr };

    const docErr = validatePersonDocumentsForSave(payload.documents);
    if (docErr) return { ok: false, error: docErr };

    const detail = formToDetail(numId, {
      ...payload,
      createdAt: existing.createdAt,
      lastLogin: existing.lastLogin,
      failedAttempts: existing.failedAttempts,
      device: existing.device,
      ipLocation: existing.ipLocation,
      kycLevel: existing.kycLevel,
      riskScore: existing.riskScore,
      riskSegment: existing.riskSegment,
    }, existing.status, existing.personNo);
    store.set(numId, detail);
    return { ok: true, id: numId, personNo: detail.personNo };
  },

  block(id, reason, blockEndDate) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'ap2_not_found' };
    store.set(numId, {
      ...existing,
      status: 'blocked',
      statusReason: reason,
      blockEndDate: blockEndDate ?? null,
    });
    return { ok: true, id: numId };
  },

  unblock(id) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'ap2_not_found' };
    store.set(numId, {
      ...existing,
      status: 'active',
      statusReason: null,
      blockEndDate: null,
    });
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
    const hit = payload.lastName.toLowerCase().includes('sanction');
    return {
      kps: payload.idCountry === 'TUR' ? 'ok' : 'pending',
      sanction: hit ? 'hit' : 'clean',
      ibanVerified: 0,
      ibanTotal: 0,
      lastRunAt: new Date().toISOString(),
    } satisfies BackgroundCheckStatus;
  },

  uploadDocument(personId, doc) {
    const row: DocumentRow = {
      id: nextDocId++,
      category: doc.category,
      type: doc.type,
      validFrom: doc.validFrom,
      validTo: doc.validTo,
      status: 'pending',
    };
    if (personId) {
      const numId = Number(personId);
      const existing = store.get(numId);
      if (existing) {
        store.set(numId, { ...existing, documents: [...existing.documents, row] });
      }
    }
    return row;
  },
};

export function createEmptyAuthorizedPersonValues(): AuthorizedPersonFormValues {
  return {
    personNo: '',
    fullName: '',
    firstName: '',
    lastName: '',
    idType: 'TCKN',
    idCountry: 'TUR',
    idNo: '',
    birthDate: '',
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
    addresses: [],
    contacts: [],
    documents: [],
  };
}

export function detailToFormValues(d: AuthorizedPersonDetail): AuthorizedPersonFormValues {
  return {
    ...d,
    fullName: `${d.firstName} ${d.lastName}`.trim(),
  };
}

registerAuthorizedPersonApprovalApply((meta) => {
  if (meta.mode === 'new') {
    mockAuthorizedPersonAdapter.create(meta.fullValues);
  } else if (meta.personId) {
    mockAuthorizedPersonAdapter.update(meta.personId, meta.fullValues);
  }
});
