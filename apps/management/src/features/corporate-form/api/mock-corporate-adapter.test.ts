import { beforeEach, describe, expect, it } from 'vitest';
import { SAMPLE_CORPORATE } from '@/mocks/sample-corporate';
import {
  createEmptyFormValues,
  getCorporateAuditLog,
  lookupAuthorizedPerson,
  mockCorporateAdapter,
  resetCorporateAuditLog,
  resetCorporateStore,
} from './mock-corporate-adapter';

function minimalSavePayload() {
  return {
    ...createEmptyFormValues(),
    tradeName: 'Test Tüzel A.Ş.',
    taxNo: '3131516608',
    organizationType: 'LimitedCompany',
    registryNo: '123456-5',
    mersisNo: '0179295611700001',
    taxOffice: 'Gaziantep Vergi Dairesi',
    activitySubject: 'Test faaliyet',
    establishmentDate: '2010-01-01',
    staffCount: 5,
    banks: SAMPLE_CORPORATE.banks,
    addresses: SAMPLE_CORPORATE.addresses,
    contacts: SAMPLE_CORPORATE.contacts,
    documents: SAMPLE_CORPORATE.documents,
    shareholders: SAMPLE_CORPORATE.shareholders,
    authorizedPersons: SAMPLE_CORPORATE.authorizedPersons,
  };
}

describe('mockCorporateAdapter', () => {
  beforeEach(() => {
    resetCorporateStore();
    resetCorporateAuditLog();
  });

  it('lookupByTaxNo mevcut VKN döndürür', () => {
    const hit = mockCorporateAdapter.lookupByTaxNo('1792956117');
    expect(hit?.id).toBe(99903);
  });

  it('ForeignLegalEntity create reddeder', () => {
    const payload = { ...minimalSavePayload(), organizationType: 'ForeignLegalEntity' };
    const result = mockCorporateAdapter.create(payload);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('cf_foreign_blocked');
  });

  it('belge eksik create reddeder', () => {
    const payload = { ...minimalSavePayload(), documents: [] };
    const result = mockCorporateAdapter.create(payload);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/^cf_doc_missing:/);
  });

  it('geçerli create audit log üretir ve KYB Approved/active', () => {
    const result = mockCorporateAdapter.create(minimalSavePayload());
    expect(result.ok).toBe(true);
    const detail = mockCorporateAdapter.getById(String(result.id));
    expect(detail?.status).toBe('active');
    expect(detail?.kycStatus).toBe('Approved');
    expect(getCorporateAuditLog().some((e) => e.action === 'insert')).toBe(true);
  });

  it('sanction hit tespit eder (ortak adında)', () => {
    const payload = minimalSavePayload();
    payload.shareholders = [{ ...payload.shareholders[0], name: 'Sanction Test Ortak' }];
    const checks = mockCorporateAdapter.runBackgroundChecks(null, payload);
    expect(checks.sanction).toBe('hit');
  });

  it('block/unblock status günceller', () => {
    const created = mockCorporateAdapter.create(minimalSavePayload());
    mockCorporateAdapter.block(String(created.id), 'Test bloke');
    expect(mockCorporateAdapter.getById(String(created.id))?.status).toBe('blocked');
    mockCorporateAdapter.unblock(String(created.id));
    expect(mockCorporateAdapter.getById(String(created.id))?.status).toBe('active');
    expect(getCorporateAuditLog().filter((e) => e.action === 'block').length).toBe(1);
  });

  it('lookupAuthorizedPerson TCKN için KYC döndürür', () => {
    expect(lookupAuthorizedPerson('12345678901')?.kycLevel).toBe('L2');
    expect(lookupAuthorizedPerson('98765432109')?.kycLevel).toBe('L1');
  });
});
