import { describe, expect, it } from 'vitest';
import { validateFraudRecordInput } from './validation';
import type { FraudRecordInput } from './types';

const base: FraudRecordInput = {
  transactionNo: 'TX-1',
  fraudType: '',
  detectionSource: 'ManualReview',
  verdict: 'Unknown',
  discoveryAt: '2026-05-24T14:00',
  lossAmount: 0,
  recoveredAmount: 0,
  notes: '',
};

describe('validateFraudRecordInput', () => {
  it('NotFraud + loss>0 fail', () => {
    const r = validateFraudRecordInput(
      { ...base, verdict: 'NotFraud', lossAmount: 100 },
      { transactionDate: '2026-05-24 10:00:00' },
    );
    expect(r).toEqual({ ok: false, error: 'frp_amount_must_be_zero' });
  });

  it('ConfirmedFraud no type fail', () => {
    const r = validateFraudRecordInput(
      { ...base, verdict: 'ConfirmedFraud', fraudType: '' },
      { transactionDate: '2026-05-24 10:00:00' },
    );
    expect(r).toEqual({ ok: false, error: 'frp_type_required' });
  });

  it('discovery before tx fail', () => {
    const r = validateFraudRecordInput(
      { ...base, discoveryAt: '2026-05-20T10:00' },
      { transactionDate: '2026-05-24 10:00:00' },
    );
    expect(r).toEqual({ ok: false, error: 'frp_discovery_before_tx' });
  });
});
