import { describe, expect, it } from 'vitest';
import {
  combineLimits,
  computeRemainingLimit,
  kycLimitContribution,
  mostRestrictive,
  remainingForLimit,
  type ActorLimits,
  type LimitActor,
} from './compute-remaining-limit';

const head = {
  asOf: '2026-06-07T12:00:00Z',
  operationType: 'WalletToPerson',
  channel: 'Agent' as const,
  currency: 'TRY',
  isForeign: false,
};

const allowed = (l: Partial<ActorLimits>): ActorLimits => ({
  singleTxLimit: -1,
  dailyLimit: -1,
  monthlyLimit: -1,
  internationalTransfer: 'Allowed',
  ...l,
});

const actor = (key: LimitActor['key'], l: Partial<ActorLimits>, dailyUsed = 0, monthlyUsed = 0): LimitActor => ({
  key,
  limits: allowed(l),
  usage: { dailyUsed, monthlyUsed },
});

describe('mostRestrictive', () => {
  it('0 her zaman kazanır', () => {
    expect(mostRestrictive([-1, 100, 0])).toBe(0);
  });
  it('-1 yalnızca tüm değerler -1 ise kazanır', () => {
    expect(mostRestrictive([-1, 100])).toBe(100);
    expect(mostRestrictive([-1, -1])).toBe(-1);
  });
  it('pozitifler arasında en küçük', () => {
    expect(mostRestrictive([50, 100, 80])).toBe(50);
  });
  it('boş → -1 (limitsiz)', () => {
    expect(mostRestrictive([])).toBe(-1);
  });
});

describe('remainingForLimit', () => {
  it('pozitif limit - kullanım', () => {
    expect(remainingForLimit(1000, 300)).toBe(700);
    expect(remainingForLimit(1000, 1200)).toBe(0);
  });
  it('limitsiz/kapalı aynen geçer', () => {
    expect(remainingForLimit(-1, 500)).toBe(-1);
    expect(remainingForLimit(0, 0)).toBe(0);
  });
});

describe('combineLimits + kycLimitContribution', () => {
  it('Level 1 aylık 185.000 katkısı en kısıtlayıcı olur', () => {
    const base = allowed({ monthlyLimit: 500000 });
    const merged = combineLimits(base, kycLimitContribution(1));
    expect(merged.monthlyLimit).toBe(185000);
  });
  it('Level 0 işlem yapamaz (hepsi 0)', () => {
    const k = kycLimitContribution(0);
    expect(k.singleTxLimit).toBe(0);
    expect(k.monthlyLimit).toBe(0);
  });
  it('Level 2 tek işlem 1.000.000', () => {
    expect(kycLimitContribution(2).singleTxLimit).toBe(1000000);
  });
});

describe('computeRemainingLimit', () => {
  it('tek aktör limitsiz → hepsi -1', () => {
    const r = computeRemainingLimit({ ...head, actors: [actor('customer', {})] });
    expect(r).toMatchObject({ nextTxMaxAmount: -1, todayRemaining: -1, monthRemaining: -1, singleTxLimit: -1 });
  });

  it('yurt dışı + Forbidden → hepsi 0', () => {
    const r = computeRemainingLimit({
      ...head,
      isForeign: true,
      actors: [actor('customer', { internationalTransfer: 'Forbidden' })],
    });
    expect(r).toMatchObject({ nextTxMaxAmount: 0, todayRemaining: 0, monthRemaining: 0, singleTxLimit: 0 });
  });

  it('yetkili aktif/yetkili değil → hepsi 0', () => {
    const r = computeRemainingLimit({
      ...head,
      actors: [actor('customer', {}), { ...actor('agentAuthorized', {}), activeAndAuthorized: false }],
    });
    expect(r.nextTxMaxAmount).toBe(0);
  });

  it('çok aktör — en kısıtlayıcı kalanlar seçilir', () => {
    const r = computeRemainingLimit({
      ...head,
      actors: [
        actor('customer', { singleTxLimit: 50000, dailyLimit: 80000, monthlyLimit: 500000 }, 8200, 120000),
        actor('agent', { singleTxLimit: -1, dailyLimit: 200000, monthlyLimit: -1 }, 50000),
      ],
    });
    // today: min(71800, 150000) = 71800 ; month: min(380000, -1) = 380000 ; single: min(50000,-1)=50000
    expect(r.todayRemaining).toBe(71800);
    expect(r.monthRemaining).toBe(380000);
    expect(r.singleTxLimit).toBe(50000);
    // next = min(50000, 71800, 380000) = 50000
    expect(r.nextTxMaxAmount).toBe(50000);
  });

  it('günlük kullanım limiti aşmış → 0 ve next 0', () => {
    const r = computeRemainingLimit({
      ...head,
      actors: [actor('customer', { dailyLimit: 1000 }, 1500)],
    });
    expect(r.todayRemaining).toBe(0);
    expect(r.nextTxMaxAmount).toBe(0);
  });

  it('boş aktör listesi → limitsiz', () => {
    const r = computeRemainingLimit({ ...head, actors: [] });
    expect(r.nextTxMaxAmount).toBe(-1);
  });
});
