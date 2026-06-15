/**
 * §0.24 / 7.2 §8.1 — Kalan Limit Hesaplama (çok aktörlü servis).
 *
 * Tüm ilgili aktörlerin (müşteri, tüzel yetkili, temsilci, temsilci yetkilisi, cüzdan)
 * etkin limitleri ve kullanımları birleştirilerek bir sonraki işlemde yapılabilecek
 * azami tutar hesaplanır. Değer anlamı: `0` = kapalı, `-1` = limitsiz.
 */
import { limitPermissivenessRank } from './limit-semantics';
import type { InternationalTransfer, LimitValue } from './types';

export type LimitActorKey =
  | 'customer'
  | 'corporateAuthorized'
  | 'agent'
  | 'agentAuthorized'
  | 'wallet';

/** Aktörün (fallback + KYC sonrası) etkin limitleri */
export type ActorLimits = {
  singleTxLimit: LimitValue;
  dailyLimit: LimitValue;
  monthlyLimit: LimitValue;
  internationalTransfer: InternationalTransfer;
};

/** as_of penceresinde TRY cinsinden kullanım toplamları (onay bekleyenler hariç) */
export type ActorUsage = {
  dailyUsed: number;
  monthlyUsed: number;
};

export type LimitActor = {
  key: LimitActorKey;
  limits: ActorLimits;
  usage: ActorUsage;
  /** Yetkili kişiler: as_of itibarıyla aktif + işlem yetkili değilse tüm limitler 0 olur. */
  activeAndAuthorized?: boolean;
};

export type RemainingLimitInput = {
  asOf: string;
  operationType: string;
  channel: 'Agent' | 'Wallet';
  currency: string;
  /** Taraflardan biri yurt dışında mı (yurt dışı gönderim kontrolü) */
  isForeign: boolean;
  actors: LimitActor[];
};

export type RemainingLimitOutput = {
  asOf: string;
  operationType: string;
  channel: 'Agent' | 'Wallet';
  currency: string;
  /** 0 = kapalı, -1 = limitsiz */
  nextTxMaxAmount: LimitValue;
  todayRemaining: LimitValue;
  monthRemaining: LimitValue;
  singleTxLimit: LimitValue;
};

/** En kısıtlayıcı değer: rank en küçük olan (0 en kısıtlayıcı, -1 en gevşek). */
export function mostRestrictive(values: readonly LimitValue[]): LimitValue {
  if (values.length === 0) return -1;
  return values.reduce((acc, v) =>
    limitPermissivenessRank(v) < limitPermissivenessRank(acc) ? v : acc,
  );
}

/** Kalan = limit<=0 ? limit : max(0, limit - kullanım). (-1 limitsiz, 0 kapalı aynen geçer) */
export function remainingForLimit(limit: LimitValue, used: number): LimitValue {
  if (limit <= 0) return limit;
  return Math.max(0, limit - Math.max(0, used));
}

/** İki limit setini boyut bazında en kısıtlayıcı şekilde birleştirir. */
export function combineLimits(a: ActorLimits, b: ActorLimits): ActorLimits {
  return {
    singleTxLimit: mostRestrictive([a.singleTxLimit, b.singleTxLimit]),
    dailyLimit: mostRestrictive([a.dailyLimit, b.dailyLimit]),
    monthlyLimit: mostRestrictive([a.monthlyLimit, b.monthlyLimit]),
    internationalTransfer:
      a.internationalTransfer === 'Forbidden' || b.internationalTransfer === 'Forbidden'
        ? 'Forbidden'
        : 'Allowed',
  };
}

/**
 * Bireysel müşteri KYC limit katkısı (GenelIsleyis "İşlem Limiti").
 * Level 1: yasal aylık 185.000 TL; Level 2/3: tek işlem tavanı; Level 0: işlem yapamaz.
 */
export function kycLimitContribution(kycLevel: 0 | 1 | 2 | 3): ActorLimits {
  switch (kycLevel) {
    case 0:
      return { singleTxLimit: 0, dailyLimit: 0, monthlyLimit: 0, internationalTransfer: 'Forbidden' };
    case 1:
      return { singleTxLimit: -1, dailyLimit: -1, monthlyLimit: 185000, internationalTransfer: 'Allowed' };
    case 2:
      return { singleTxLimit: 1000000, dailyLimit: -1, monthlyLimit: -1, internationalTransfer: 'Allowed' };
    case 3:
      return { singleTxLimit: 3000000, dailyLimit: -1, monthlyLimit: -1, internationalTransfer: 'Allowed' };
  }
}

/** §0.24 / 7.2 §8.1 — çok aktörlü kalan limit hesaplama servisi. */
export function computeRemainingLimit(input: RemainingLimitInput): RemainingLimitOutput {
  const head = {
    asOf: input.asOf,
    operationType: input.operationType,
    channel: input.channel,
    currency: input.currency,
  };
  const allZero: RemainingLimitOutput = {
    ...head,
    nextTxMaxAmount: 0,
    todayRemaining: 0,
    monthRemaining: 0,
    singleTxLimit: 0,
  };

  // Yetkili aktif/yetki kontrolü — biri uygun değilse tüm limitler 0
  if (input.actors.some((a) => a.activeAndAuthorized === false)) {
    return allZero;
  }

  // Yurt dışı gönderim yasağı — herhangi bir aktörde Forbidden ise tüm limitler 0
  if (
    input.isForeign &&
    input.actors.some((a) => a.limits.internationalTransfer === 'Forbidden')
  ) {
    return allZero;
  }

  // Hiç aktör/limit kaydı yoksa tutar limitleri limitsiz (-1) kabul edilir
  if (input.actors.length === 0) {
    return { ...head, nextTxMaxAmount: -1, todayRemaining: -1, monthRemaining: -1, singleTxLimit: -1 };
  }

  const todayRemaining = mostRestrictive(
    input.actors.map((a) => remainingForLimit(a.limits.dailyLimit, a.usage.dailyUsed)),
  );
  const monthRemaining = mostRestrictive(
    input.actors.map((a) => remainingForLimit(a.limits.monthlyLimit, a.usage.monthlyUsed)),
  );
  const singleTxLimit = mostRestrictive(input.actors.map((a) => a.limits.singleTxLimit));
  const nextTxMaxAmount = mostRestrictive([singleTxLimit, todayRemaining, monthRemaining]);

  return { ...head, nextTxMaxAmount, todayRemaining, monthRemaining, singleTxLimit };
}
