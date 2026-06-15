import { describe, expect, it } from 'vitest';
import { SAMPLE_PERSON } from '@/mocks/sample-person';
import { individualFormSchema, validateDocumentsForSave } from './validation';

function validPayload() {
  return {
    fullName: `${SAMPLE_PERSON.firstName} ${SAMPLE_PERSON.lastName}`,
    idType: 'TCKN' as const,
    idCountry: 'TUR',
    idNo: '12345678901',
    birthDate: '1991-04-18',
    customerType: 'individual' as const,
    birthPlace: SAMPLE_PERSON.birthPlace,
    maritalStatus: 'married' as const,
    serialNo: SAMPLE_PERSON.serialNo,
    issueDate: SAMPLE_PERSON.issueDate,
    issuingAuthority: SAMPLE_PERSON.issuingAuthority,
    validityDate: SAMPLE_PERSON.validityDate,
    motherName: SAMPLE_PERSON.motherName,
    fatherName: SAMPLE_PERSON.fatherName,
    gender: 'female' as const,
    maidenName: SAMPLE_PERSON.maidenName,
    taxCountry: 'TUR',
    education: 'bachelors',
    employment: 'salaried',
    occupation: SAMPLE_PERSON.occupation,
    employer: SAMPLE_PERSON.employer,
    language: 'tr',
    notes: '',
    visaType: null,
    visaEndDate: null,
    residencePermit: null,
    residencePermitEnd: null,
    birthCountry: 'TUR',
    residentCountry: 'TUR',
    banks: SAMPLE_PERSON.banks.slice(0, 1),
    addresses: SAMPLE_PERSON.addresses.filter((a) => a.isContact),
    contacts: SAMPLE_PERSON.contacts.filter((c) => c.verified),
    documents: SAMPLE_PERSON.documents.filter((d) => d.category === 'Identity'),
  };
}

describe('individualFormSchema', () => {
  it('geçerli bireysel kayıt doğrulanır', () => {
    expect(individualFormSchema.safeParse(validPayload()).success).toBe(true);
  });

  it('gelecek doğum tarihi reddedilir', () => {
    const payload = { ...validPayload(), birthDate: '2099-01-01' };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'if_birth_future')).toBe(true);
    }
  });

  it('TCKN formatı kontrol edilir', () => {
    const payload = { ...validPayload(), idNo: '01234567890' };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('notlarda PII reddedilir', () => {
    const payload = { ...validPayload(), notes: 'Kart 4111111111111111' };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('evli kadın için kızlık soyadı zorunlu', () => {
    const payload = { ...validPayload(), maidenName: '' };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('doğrulanmamış iletişim reddedilir', () => {
    const payload = {
      ...validPayload(),
      contacts: [{ id: 1, type: 'email' as const, value: 'a@b.com', verified: false, primary: true }],
    };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('18 yaş altı reddedilir (§7)', () => {
    const payload = { ...validPayload(), birthDate: '2020-01-01' };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'if_min_age')).toBe(true);
    }
  });

  it('süresi dolmuş kimlik belgesi reddedilir', () => {
    const payload = { ...validPayload(), validityDate: '2020-01-01' };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'if_validity_expired')).toBe(true);
    }
  });

  it('geçersiz telefon formatı reddedilir', () => {
    const payload = {
      ...validPayload(),
      contacts: [
        { id: 1, type: 'email' as const, value: 'a@b.com', verified: true, primary: true },
        { id: 2, type: 'phone' as const, value: '123', verified: true, primary: true },
      ],
    };
    const result = individualFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'if_phone_format')).toBe(true);
    }
  });
});

describe('validateDocumentsForSave', () => {
  it('Identity belgesi olmadan kayıt reddedilir', () => {
    expect(validateDocumentsForSave([])).toBe('if_doc_identity_required');
  });

  it('Identity belgesi ile geçer', () => {
    expect(
      validateDocumentsForSave([
        {
          id: 1,
          category: 'Identity',
          type: 'TC Kimlik',
          validFrom: '2020-01-01',
          validTo: '2030-01-01',
          status: 'approved',
        },
      ]),
    ).toBeNull();
  });
});
