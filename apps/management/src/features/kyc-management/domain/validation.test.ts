import { describe, expect, it } from 'vitest';
import { validateNoteInput, validateVerifyInput } from './validation';

describe('kyc validation', () => {
  it('requires evaluation note', () => {
    expect(validateNoteInput({ evaluationNote: '  ' }).ok).toBe(false);
  });

  it('verify requires docs score approver', () => {
    const docs = [{ id: '1', title: 'Kimlik', status: 'Active', uploadedAt: '2026-01-01' }];
    expect(
      validateVerifyInput(
        { evaluationNote: 'ok', riskScore: 40, approverUserId: 'u.mgmt' },
        docs,
      ).ok,
    ).toBe(true);
    expect(
      validateVerifyInput({ evaluationNote: 'ok', riskScore: 40, approverUserId: '' }, docs).ok,
    ).toBe(false);
    expect(validateVerifyInput({ evaluationNote: '', riskScore: 40, approverUserId: 'u.mgmt' }, docs).ok).toBe(
      false,
    );
  });
});
