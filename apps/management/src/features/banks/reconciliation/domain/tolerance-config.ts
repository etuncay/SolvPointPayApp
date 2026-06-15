import { getActiveParameterValue } from '@/mocks/system-parameters';
import type { ReconParams } from '@/mocks/reconciliation-params';

export function getReconParams(): ReconParams {
  return {
    amountToleranceTry: getActiveParameterValue('reconciliation.amount_tolerance_try', 0.01),
    dateToleranceHours: getActiveParameterValue('reconciliation.date_tolerance_hours', 1),
    unmatchedUrgencyThresholdTry: getActiveParameterValue(
      'reconciliation.unmatched_urgency_threshold_try',
      10_000,
    ),
  };
}

export function deriveUrgencyLevels(amountDelta: number): {
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  criticalityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
} {
  const abs = Math.abs(amountDelta);
  const threshold = getReconParams().unmatchedUrgencyThresholdTry;
  if (abs >= threshold * 5) {
    return { urgencyLevel: 'Critical', criticalityLevel: 'Critical' };
  }
  if (abs >= threshold) {
    return { urgencyLevel: 'High', criticalityLevel: 'High' };
  }
  if (abs >= threshold / 2) {
    return { urgencyLevel: 'Medium', criticalityLevel: 'Medium' };
  }
  return { urgencyLevel: 'Low', criticalityLevel: 'Low' };
}
