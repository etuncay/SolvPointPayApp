/** Mock mutabakat parametreleri — 12.4 yerine sabit (plan §2) */
export const RECON_PARAMS = {
  amountToleranceTry: 0.01,
  dateToleranceHours: 1,
  unmatchedUrgencyThresholdTry: 10_000,
} as const;

export type ReconParams = typeof RECON_PARAMS;
