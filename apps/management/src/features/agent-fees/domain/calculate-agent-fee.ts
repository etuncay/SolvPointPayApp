import type {
  AgentFee,
  CalculateAgentFeeParams,
  CalculateAgentFeeResult,
} from './types';

/** Grup+işlem+PB için aktif base tier (lowerLimit=0) var mı */
export function hasActiveBaseTier(
  fees: AgentFee[],
  groupCode: string,
  transactionType: string,
  currency: string,
  asOfDate: string,
): boolean {
  const code = groupCode.toUpperCase();
  return fees.some(
    (f) =>
      f.groupCode === code &&
      f.transactionType === transactionType &&
      f.currency === currency &&
      f.lowerLimit === 0 &&
      isFeeEffective(f, asOfDate),
  );
}

function isFeeEffective(fee: AgentFee, asOfDate: string): boolean {
  if (fee.status !== 'Active' || fee.recordStatus !== 1) return false;
  if (fee.startDate && fee.startDate > asOfDate) return false;
  if (fee.endDate && fee.endDate < asOfDate) return false;
  return true;
}

/** Spec §8 — en yüksek uygun lowerLimit kademesi */
export function calculateAgentFee(
  fees: AgentFee[],
  params: CalculateAgentFeeParams,
): CalculateAgentFeeResult {
  const asOfDate = params.asOfDate ?? new Date().toISOString().slice(0, 10);
  const code = params.groupCode.toUpperCase();

  if (!hasActiveBaseTier(fees, code, params.transactionType, params.currency, asOfDate)) {
    return { ok: false, error: 'afee_no_base_tier' };
  }

  const candidates = fees.filter(
    (f) =>
      f.groupCode === code &&
      f.transactionType === params.transactionType &&
      f.currency === params.currency &&
      f.lowerLimit <= params.amount &&
      isFeeEffective(f, asOfDate),
  );

  if (candidates.length === 0) {
    return { ok: false, error: 'afee_no_matching_tier' };
  }

  const selected = [...candidates].sort((a, b) => b.lowerLimit - a.lowerLimit)[0]!;
  const variablePart = (params.amount * selected.variableFeePct) / 100;
  const totalFee = selected.fixedFee + variablePart;

  return {
    ok: true,
    feeId: selected.id,
    fixedFee: selected.fixedFee,
    variableFeePct: selected.variableFeePct,
    totalFee: Math.round(totalFee * 100) / 100,
    lowerLimit: selected.lowerLimit,
  };
}
