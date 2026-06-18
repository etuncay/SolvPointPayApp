/**
 * §0.24 / 7.2 §8.1 — Kalan Limit Hesaplama (çok aktörlü).
 * Mock adapter yerel hesap için; production'da sunucu aynı algoritmayı uygular.
 */
import { mostRestrictive, remainingForLimit } from './limit-semantics';
import type { InternationalTransfer, LimitValue } from './limit-types';

export type LimitActorKey =
  | 'customer'
  | 'corporateAuthorized'
  | 'agent'
  | 'agentAuthorized'
  | 'wallet';

export type ActorLimits = {
  singleTxLimit: LimitValue;
  dailyLimit: LimitValue;
  monthlyLimit: LimitValue;
  internationalTransfer: InternationalTransfer;
};

export type ActorUsage = {
  dailyUsed: number;
  monthlyUsed: number;
};

export type LimitActor = {
  key: LimitActorKey;
  limits: ActorLimits;
  usage: ActorUsage;
  activeAndAuthorized?: boolean;
};

export type RemainingLimitInput = {
  asOf: string;
  operationType: string;
  channel: 'Agent' | 'Wallet';
  currency: string;
  isForeign: boolean;
  actors: LimitActor[];
};

export type RemainingLimitOutput = {
  asOf: string;
  operationType: string;
  channel: 'Agent' | 'Wallet';
  currency: string;
  nextTxMaxAmount: LimitValue;
  todayRemaining: LimitValue;
  monthRemaining: LimitValue;
  singleTxLimit: LimitValue;
};

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

  if (input.actors.some((a) => a.activeAndAuthorized === false)) {
    return allZero;
  }

  if (
    input.isForeign &&
    input.actors.some((a) => a.limits.internationalTransfer === 'Forbidden')
  ) {
    return allZero;
  }

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
