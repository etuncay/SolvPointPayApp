import type { CalculateFeeParams, CalculateFeeResult, CustomerFee, FeeCountry } from './types';

/** Ülke öncelik skoru — düşük = daha spesifik (spec §8) */
export function countryPriorityScore(
  sourceCountry: FeeCountry,
  targetCountry: FeeCountry,
  feeSource: FeeCountry,
  feeTarget: FeeCountry,
): number {
  const srcMatch = feeSource === 'ALL' || feeSource === sourceCountry;
  const dstMatch = feeTarget === 'ALL' || feeTarget === targetCountry;
  if (!srcMatch || !dstMatch) return 99;

  const srcSpecific = feeSource !== 'ALL';
  const dstSpecific = feeTarget !== 'ALL';
  if (srcSpecific && dstSpecific) return 1;
  if (srcSpecific && !dstSpecific) return 2;
  if (!srcSpecific && dstSpecific) return 3;
  return 4;
}

/** İşlem+para birimi için aktif base tier (ALL+ALL, lowerLimit=0) var mı */
export function hasActiveBaseTier(
  fees: CustomerFee[],
  transactionType: string,
  currency: string,
  asOfDate: string,
): boolean {
  return fees.some(
    (f) =>
      f.transactionType === transactionType &&
      f.currency === currency &&
      f.lowerLimit === 0 &&
      f.sourceCountry === 'ALL' &&
      f.targetCountry === 'ALL' &&
      isFeeEffective(f, asOfDate),
  );
}

function hasBaseTier(
  fees: CustomerFee[],
  transactionType: string,
  currency: string,
  asOfDate: string,
): boolean {
  return hasActiveBaseTier(fees, transactionType, currency, asOfDate);
}

function isFeeEffective(fee: CustomerFee, asOfDate: string): boolean {
  if (fee.status !== 'Active' || fee.recordStatus !== 1) return false;
  if (fee.startDate && fee.startDate > asOfDate) return false;
  if (fee.endDate && fee.endDate < asOfDate) return false;
  return true;
}

/** Spec §8 — kademe + ülke önceliği ile ücret hesaplama */
export function calculateFee(
  fees: CustomerFee[],
  params: CalculateFeeParams,
): CalculateFeeResult {
  const asOfDate = params.asOfDate ?? new Date().toISOString().slice(0, 10);

  if (!hasBaseTier(fees, params.transactionType, params.currency, asOfDate)) {
    return { ok: false, error: 'cfe_no_base_tier' };
  }

  const candidates = fees.filter(
    (f) =>
      f.transactionType === params.transactionType &&
      f.currency === params.currency &&
      f.lowerLimit <= params.amount &&
      isFeeEffective(f, asOfDate),
  );

  if (candidates.length === 0) {
    return { ok: false, error: 'cfe_no_matching_tier' };
  }

  const ranked = candidates
    .map((f) => ({
      fee: f,
      countryScore: countryPriorityScore(
        params.sourceCountry,
        params.targetCountry,
        f.sourceCountry,
        f.targetCountry,
      ),
    }))
    .filter((r) => r.countryScore < 99)
    .sort((a, b) => {
      if (a.countryScore !== b.countryScore) return a.countryScore - b.countryScore;
      return b.fee.lowerLimit - a.fee.lowerLimit;
    });

  const selected = ranked[0]?.fee;
  if (!selected) {
    return { ok: false, error: 'cfe_no_matching_tier' };
  }

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
