import { describe, expect, it } from 'vitest';
import {
  createEmptyAuthorizedPersonValues,
  detailToFormValues,
  mockAuthorizedPersonAdapter,
} from './mock-authorized-person-adapter';
import { SAMPLE_AUTHORIZED_PERSON } from '@/mocks/sample-authorized-person';

function validPayload() {
  const base = detailToFormValues(SAMPLE_AUTHORIZED_PERSON);
  return {
    ...base,
    fullName: 'Test Yetkili',
    idNo: '98765432109',
    birthDate: '1985-06-15',
    serialNo: 'A12 B34567',
    issueDate: '2010-01-01',
    issuingAuthority: 'Test Authority',
    validityDate: '2030-01-01',
    education: 'bachelors',
    employment: 'salaried',
    occupation: 'Manager',
  };
}

describe('mockAuthorizedPersonAdapter', () => {
  it('create rejects under 18', () => {
    const payload = {
      ...createEmptyAuthorizedPersonValues(),
      fullName: 'Genç Yetkili',
      birthDate: '2015-01-01',
      documents: SAMPLE_AUTHORIZED_PERSON.documents,
      contacts: SAMPLE_AUTHORIZED_PERSON.contacts,
      addresses: SAMPLE_AUTHORIZED_PERSON.addresses,
    };
    const result = mockAuthorizedPersonAdapter.create(payload);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ap2_under_18');
  });

  it('draft creates inactive without age guard', () => {
    const payload = {
      ...createEmptyAuthorizedPersonValues(),
      fullName: 'Taslak Kişi',
      birthDate: '2015-01-01',
    };
    const result = mockAuthorizedPersonAdapter.create(payload, { draft: true });
    expect(result.ok).toBe(true);
    const detail = mockAuthorizedPersonAdapter.getById(String(result.id));
    expect(detail?.status).toBe('inactive');
  });

  it('KPS demo fills identity fields', () => {
    const kps = mockAuthorizedPersonAdapter.fetchKps('12345678901', '1991-04-18');
    expect(kps?.firstName).toBe('Ayşe');
    expect(kps?.birthPlace).toBeTruthy();
  });

  it('create requires identity document', () => {
    const payload = {
      ...validPayload(),
      documents: [],
    };
    const result = mockAuthorizedPersonAdapter.create(payload);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('if_doc_identity_required');
  });

  it('block updates status', () => {
    const id = String(SAMPLE_AUTHORIZED_PERSON.id);
    const result = mockAuthorizedPersonAdapter.block(id, 'Test block');
    expect(result.ok).toBe(true);
    expect(mockAuthorizedPersonAdapter.getById(id)?.status).toBe('blocked');
  });

  it('lookup finds sample by identity', () => {
    const found = mockAuthorizedPersonAdapter.lookupByIdentity(
      SAMPLE_AUTHORIZED_PERSON.idNo,
      SAMPLE_AUTHORIZED_PERSON.birthDate,
    );
    expect(found?.id).toBe(SAMPLE_AUTHORIZED_PERSON.id);
  });
});
