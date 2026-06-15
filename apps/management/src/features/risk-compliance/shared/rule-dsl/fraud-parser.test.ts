import { describe, expect, it } from 'vitest';
import { validateFraudConditionDsl } from './parser';

describe('validateFraudConditionDsl — entity.attribute modeli (GenelIsleyis)', () => {
  it('T-006-2.5 koşulu doğrulanır', () => {
    const dsl =
      'Sender.SendingTxCount(1) >= 3 AND ABS(Transaction.Amount - Sender.SendingAmountAvg(7)) <= 0.2 * Sender.SendingAmountAvg(7) AND Sender.UniqueReceiverCount(1) < 3';
    expect(validateFraudConditionDsl(dsl, 'Remittance').ok).toBe(true);
  });

  it('T-006-2.20 (Transaction.Type IN (...)) doğrulanır', () => {
    const dsl =
      'Sender.EODBalanceAvg(30) < 1000 AND Transaction.Amount > 100000 AND (Sender.SendingAmountLastHour > 0 OR Transaction.Type IN (AgentWithdrawal, BankWithdrawal))';
    expect(validateFraudConditionDsl(dsl, 'Remittance').ok).toBe(true);
  });

  it('T-006-2.70 (Receiver agregasyonu) doğrulanır', () => {
    const dsl =
      'Sender.UniqueSenderCount(7) >= 5 AND Sender.UniqueReceiverCount(7) >= 4 AND Receiver.ReceivingAmountTotal(7) > 0';
    expect(validateFraudConditionDsl(dsl, 'Remittance').ok).toBe(true);
  });

  it('referans listesi IN ile kullanılabilir', () => {
    const dsl = 'Transaction.Currency IN RiskyCountries OR SenderAgent.Country IN RiskyCountries';
    expect(validateFraudConditionDsl(dsl, 'Remittance').ok).toBe(true);
  });

  it('bilinmeyen entity reddedilir', () => {
    const r = validateFraudConditionDsl('Sendr.Amount > 1', 'Remittance');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.startsWith('frd_dsl_unknown_entity'))).toBe(true);
  });

  it('bilinmeyen attribute reddedilir', () => {
    const r = validateFraudConditionDsl('Sender.Foo > 1', 'Remittance');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.startsWith('frd_dsl_unknown_attr'))).toBe(true);
  });

  it('pencere gerektiren attribute penceresiz reddedilir', () => {
    const r = validateFraudConditionDsl('Sender.SendingTxCount > 3', 'Remittance');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.startsWith('frd_dsl_window_required'))).toBe(true);
  });

  it('geçersiz pencere değeri reddedilir', () => {
    const r = validateFraudConditionDsl('Sender.SendingTxCount(5) > 3', 'Remittance');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.startsWith('frd_dsl_bad_window'))).toBe(true);
  });

  it('düz attribute için pencere verilirse reddedilir', () => {
    const r = validateFraudConditionDsl('Transaction.Amount(7) > 1', 'Remittance');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.startsWith('frd_dsl_window_not_allowed'))).toBe(true);
  });

  it('dengesiz parantez reddedilir', () => {
    const r = validateFraudConditionDsl('(Transaction.Amount > 1', 'Remittance');
    expect(r.ok).toBe(false);
  });

  it('geriye dönük düz değişkenler hâlâ geçerli', () => {
    expect(validateFraudConditionDsl('amount > 100000', 'Remittance').ok).toBe(true);
    expect(validateFraudConditionDsl('pepFlag = true', 'Onboarding').ok).toBe(true);
    expect(validateFraudConditionDsl("country NOT IN ('TR')", 'Remittance').ok).toBe(true);
  });
});
