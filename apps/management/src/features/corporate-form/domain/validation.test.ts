import { describe, expect, it } from 'vitest';
import { SAMPLE_CORPORATE } from '@/mocks/sample-corporate';
import { corporateFormSchema } from './validation';

function validPayload() {
  return { ...SAMPLE_CORPORATE, customerNo: '', statusReason: null as string | null };
}

describe('corporateFormSchema', () => {
  it('LimitedCompany geçerli örnek payload parse eder', () => {
    const result = corporateFormSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it('ForeignLegalEntity kaydı reddeder', () => {
    const result = corporateFormSchema.safeParse({
      ...validPayload(),
      organizationType: 'ForeignLegalEntity',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'cf_foreign_blocked')).toBe(true);
    }
  });

  it('doğrudan pay toplamı 100 üzeri reddedilir', () => {
    const payload = validPayload();
    payload.shareholders = [
      { ...payload.shareholders[0], directShare: 60 },
      { ...payload.shareholders[1], directShare: 41 },
    ];
    const result = corporateFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'cf_share_sum_exceeded')).toBe(true);
    }
  });

  it('tüzel ortak UBO işaretlenemez', () => {
    const payload = validPayload();
    payload.shareholders = [{ ...payload.shareholders[1], isUbo: true }];
    const result = corporateFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'cf_ubo_individual_only')).toBe(true);
    }
  });

  it('işlem yetkisi L1 ile reddedilir', () => {
    const payload = validPayload();
    payload.authorizedPersons = [{ ...payload.authorizedPersons[0], kycLevel: 'L1' }];
    const result = corporateFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'cf_auth_kyc_required')).toBe(true);
    }
  });

  it('SoleProprietorship MERSİS opsiyonel — boş MERSİS OK', () => {
    const payload = {
      ...validPayload(),
      organizationType: 'SoleProprietorship',
      mersisNo: '',
      registryNo: '12345',
    };
    const result = corporateFormSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('aynı refNo çakışan tarihler reddedilir', () => {
    const payload = validPayload();
    payload.shareholders = [
      { ...payload.shareholders[0], refNo: '11111111111', startDate: '2020-01-01', endDate: '2025-12-31' },
      { ...payload.shareholders[0], id: 99, refNo: '11111111111', startDate: '2025-06-01', endDate: '' },
    ];
    const result = corporateFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.message === 'cf_share_overlap')).toBe(true);
    }
  });
});
