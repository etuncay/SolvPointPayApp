import { describe, expect, it } from 'vitest';
import {
  canSelectKycLevel,
  validateApprove,
  validateReject,
  validateRequestAdditional,
} from './decision-validation';
import type { ApprovePayload, ReviewCustomerSummary } from './types';

const customer: ReviewCustomerSummary = {
  customerId: 1,
  customerNo: 'MUS-000001',
  customerName: 'Test User',
  customerType: 'individual',
  idType: 'TCKN',
  idNo: '12345678901',
  nationality: 'TUR',
  birthDate: '1990-01-01',
  birthPlace: 'Ankara',
  maritalStatus: 'single',
  serialNo: 'A01',
  issueDate: '2020-01-01',
  issuingAuthority: 'NVI',
  validityDate: '2030-01-01',
  motherName: '—',
  fatherName: '—',
  gender: 'male',
  language: 'tr',
  notes: '',
  kycLevel: 'L1',
  kycStatus: 'Pending',
  status: 'active',
  statusReason: null,
  createdAt: '2025-01-01',
  approvalStatus: 'Pending',
  documents: [{ category: 'ProofOfAddress', type: 'Fatura', status: 'approved', approvalStatus: 'Approved' }],
};

describe('canSelectKycLevel', () => {
  it('L2 için ProofOfAddress gerekir', () => {
    expect(canSelectKycLevel(customer, 'L2')).toBe(true);
    expect(canSelectKycLevel({ ...customer, documents: [] }, 'L2')).toBe(false);
  });

  it('L3 için ProofOfFunds gerekir', () => {
    expect(canSelectKycLevel(customer, 'L3')).toBe(false);
    expect(
      canSelectKycLevel(
        {
          ...customer,
          documents: [{ category: 'ProofOfFunds', type: 'Bordro', status: 'approved', approvalStatus: 'Approved' }],
        },
        'L3',
      ),
    ).toBe(true);
  });
});

describe('validateApprove', () => {
  it('Blocked/Closed için gerekçe zorunlu', () => {
    const payload: ApprovePayload = {
      kycStatus: 'unchanged',
      entityStatus: 'blocked',
      comment: 'Onay',
      statusReason: '',
    };
    expect(validateApprove(payload, customer).ok).toBe(false);
  });

  it('geçerli onayda uyarı listesi döner', () => {
    const payload: ApprovePayload = {
      kycStatus: 'unchanged',
      entityStatus: 'active',
      kycLevel: 'L2',
      comment: 'Onaylandı',
    };
    const result = validateApprove(payload, customer);
    expect(result.ok).toBe(true);
  });
});

describe('validateReject', () => {
  it('açıklama zorunlu', () => {
    expect(validateReject({ kycStatus: 'unchanged', comment: '' }).ok).toBe(false);
    expect(validateReject({ kycStatus: 'unchanged', comment: 'Red' }).ok).toBe(true);
  });
});

describe('validateRequestAdditional', () => {
  it('kategori ve tür zorunlu', () => {
    expect(
      validateRequestAdditional({ category: 'Identity', documentType: '', comment: '' }).ok,
    ).toBe(false);
    expect(
      validateRequestAdditional({ category: 'Identity', documentType: 'Pasaport', comment: '' }).ok,
    ).toBe(true);
  });
});
