import { describe, expect, it } from 'vitest';
import { employeeFormSchema, isValidTrIban } from './validation';

describe('employeeFormSchema', () => {
  const base = {
    firstName: 'Test',
    lastName: 'User',
    identityNo: '12345678901',
    identityDocument: 'IdentityCard' as const,
    title: 'Uzman',
    departmentId: 'dept-ops',
    hireDate: '2024-01-01',
    nationality: 'TUR',
    birthPlace: 'Ankara',
    birthDate: '1990-01-01',
    gender: 'Male' as const,
    maritalStatus: 'Single' as const,
    iban: 'TR330006100519786457841326',
    employmentStatus: 'Active' as const,
    addresses: [
      {
        id: 1,
        addressType: 'Home',
        country: 'TUR',
        city: 'Ankara',
        district: 'Çankaya',
        postcode: '06100',
        line: 'Adres 1',
      },
    ],
    contacts: [
      { id: 1, type: 'email' as const, value: 't@epay.demo', verified: true, primary: true },
      { id: 2, type: 'phone' as const, value: '+905551234567', verified: false, primary: true },
    ],
  };

  it('rejects unverified primary phone', () => {
    const r = employeeFormSchema.safeParse(base);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message === 'ef_phone_otp_required')).toBe(true);
    }
  });

  it('passes with verified phone', () => {
    const r = employeeFormSchema.safeParse({
      ...base,
      contacts: [
        { id: 1, type: 'email', value: 't@epay.demo', verified: true, primary: true },
        { id: 2, type: 'phone', value: '+905551234567', verified: true, primary: true },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('validates TR IBAN', () => {
    expect(isValidTrIban('TR330006100519786457841326')).toBe(true);
    expect(isValidTrIban('TR00')).toBe(false);
  });
});
