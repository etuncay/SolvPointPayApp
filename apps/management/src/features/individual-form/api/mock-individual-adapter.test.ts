import { beforeEach, describe, expect, it } from 'vitest';
import { resetCustomersStore } from '@/features/customers/api/mock-customers-adapter';
import { SAMPLE_PERSON } from '@/mocks/sample-person';
import {
  createEmptyFormValues,
  mockIndividualAdapter,
  resetIndividualStore,
} from './mock-individual-adapter';

function draftPayload() {
  return {
    ...createEmptyFormValues(),
    fullName: 'Test User',
    idNo: '98765432109',
    birthDate: '1990-01-01',
    birthPlace: 'Ankara',
    serialNo: 'A12 B34567',
    issueDate: '2020-01-01',
    issuingAuthority: 'Test Md.',
    validityDate: '2030-01-01',
    motherName: 'Anne',
    fatherName: 'Baba',
    education: 'bachelors',
    employment: 'salaried',
    occupation: 'Mühendis',
    language: 'tr',
  };
}

function savePayload() {
  return {
    ...draftPayload(),
    banks: SAMPLE_PERSON.banks.slice(0, 1),
    addresses: SAMPLE_PERSON.addresses.filter((a) => a.isContact),
    contacts: SAMPLE_PERSON.contacts.filter((c) => c.verified),
    documents: [
      {
        id: 1,
        category: 'Identity',
        type: 'TC Kimlik',
        validFrom: '2020-01-01',
        validTo: '2030-01-01',
        status: 'approved',
      },
    ],
  };
}

describe('mockIndividualAdapter', () => {
  beforeEach(() => {
    resetIndividualStore();
    resetCustomersStore();
  });

  it('getById mevcut bireysel müşteriyi döner', () => {
    const detail = mockIndividualAdapter.getById('99901');
    expect(detail).not.toBeNull();
    expect(detail!.id).toBe(99901);
  });

  it('fetchKps demo TCKN ile nüfus alanlarını döner', () => {
    const kps = mockIndividualAdapter.fetchKps('12345678901', '1991-04-18');
    expect(kps?.firstName).toBe(SAMPLE_PERSON.firstName);
    expect(kps?.motherName).toBe(SAMPLE_PERSON.motherName);
  });

  it('taslak kayıt inactive status ile oluşturulur', () => {
    const result = mockIndividualAdapter.create(draftPayload(), { draft: true });
    expect(result.ok).toBe(true);
    const detail = mockIndividualAdapter.getById(String(result.id));
    expect(detail?.status).toBe('inactive');
  });

  it('kaydet Identity belgesi olmadan reddedilir', () => {
    const result = mockIndividualAdapter.create(draftPayload());
    expect(result.ok).toBe(false);
    expect(result.error).toBe('if_doc_identity_required');
  });

  it('kaydet geçerli payload ile active olur ve liste senkronu yapılır', () => {
    const result = mockIndividualAdapter.create(savePayload());
    expect(result.ok).toBe(true);
    const detail = mockIndividualAdapter.getById(String(result.id));
    expect(detail?.status).toBe('active');
  });

  it('block/unblock status geçişi', () => {
    const created = mockIndividualAdapter.create(savePayload());
    const id = String(created.id);
    mockIndividualAdapter.block(id, 'Test bloke', '2026-12-31');
    expect(mockIndividualAdapter.getById(id)?.status).toBe('blocked');
    mockIndividualAdapter.unblock(id);
    expect(mockIndividualAdapter.getById(id)?.status).toBe('active');
  });

  it('runBackgroundChecks sanction hit tespit eder', () => {
    const checks = mockIndividualAdapter.runBackgroundChecks(null, {
      ...savePayload(),
      fullName: 'John Sanction',
      lastName: 'Sanction',
    });
    expect(checks.sanction).toBe('hit');
  });

  it('lookupByIdentity eşleşen kaydı bulur', () => {
    const detail = mockIndividualAdapter.lookupByIdentity('75683988090', '1991-04-18');
    expect(detail?.id).toBe(99901);
  });
});
