import { describe, expect, it } from 'vitest';
import {
  hasActionConflict,
  isNearRealTimeRule,
  isRealTimeRule,
} from './fraud-actions';

describe('fraud-actions RT/NRT split (§0.11)', () => {
  it('yalnızca AddRisk/NotifyCustomer/ContactCustomer → NRT (onay sonrası)', () => {
    expect(isNearRealTimeRule(['AddRisk', 'NotifyCustomer'])).toBe(true);
    expect(isNearRealTimeRule(['ContactCustomer'])).toBe(true);
    expect(isRealTimeRule(['AddRisk'])).toBe(false);
  });

  it('Block içeren kural → RT (işlem öncesi)', () => {
    expect(isRealTimeRule(['Block'])).toBe(true);
    expect(isRealTimeRule(['AddRisk', 'Block'])).toBe(true);
    expect(isNearRealTimeRule(['Block'])).toBe(false);
  });

  it('boş aksiyon kümesi NRT sayılmaz', () => {
    expect(isNearRealTimeRule([])).toBe(false);
  });

  it('Allow + Block çakışması tespit edilir', () => {
    expect(hasActionConflict(['Allow', 'Block'])).toBe(true);
  });
});
