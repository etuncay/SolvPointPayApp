import { describe, expect, it } from 'vitest';
import { AGENT_FEES } from '@/mocks/agent-fees';
import { calculateAgentFee, hasActiveBaseTier } from './calculate-agent-fee';
import type { AgentFee } from './types';

const AS_OF = '2025-06-01';

describe('calculateAgentFee', () => {
  it('base tier yoksa afee_no_base_tier döner', () => {
    const withoutBase = AGENT_FEES.filter(
      (f) => !(f.groupCode === 'PLATINUM' && f.transactionType === 'WalletToPerson' && f.lowerLimit === 0),
    );
    const result = calculateAgentFee(withoutBase, {
      groupCode: 'PLATINUM',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      amount: 1000,
      asOfDate: AS_OF,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('afee_no_base_tier');
  });

  it('15.000 TRY PLATINUM için 10.000 kademesi seçilir', () => {
    const result = calculateAgentFee(AGENT_FEES, {
      groupCode: 'PLATINUM',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      amount: 15000,
      asOfDate: AS_OF,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.variableFeePct).toBe(0.25);
      expect(result.lowerLimit).toBe(10000);
      expect(result.totalFee).toBe(37.5);
    }
  });

  it('en yüksek uygun lowerLimit kademesi seçilir', () => {
    const result = calculateAgentFee(AGENT_FEES, {
      groupCode: 'PLATINUM',
      transactionType: 'WalletToPerson',
      currency: 'TRY',
      amount: 55000,
      asOfDate: AS_OF,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lowerLimit).toBe(50000);
      expect(result.variableFeePct).toBe(0.2);
    }
  });
});

describe('hasActiveBaseTier', () => {
  it('seed PLATINUM WalletToPerson TRY için base tier mevcut', () => {
    expect(hasActiveBaseTier(AGENT_FEES, 'PLATINUM', 'WalletToPerson', 'TRY', AS_OF)).toBe(true);
  });

  it('base tier pasif ise false döner', () => {
    const passiveBase: AgentFee[] = AGENT_FEES.map((f) =>
      f.groupCode === 'PLATINUM' && f.lowerLimit === 0
        ? { ...f, status: 'Passive' }
        : f,
    );
    expect(hasActiveBaseTier(passiveBase, 'PLATINUM', 'WalletToPerson', 'TRY', AS_OF)).toBe(false);
  });
});
