import type { EntityStatePatch, KycDecision } from './types';

export type TransitionResult = {
  decision: KycDecision;
  entityPatch: EntityStatePatch;
};

export function applyFalsePositive(): TransitionResult {
  return {
    decision: 'FalsePositive',
    entityPatch: { status: 'active', blockReason: null },
  };
}

export function applyRequestAdditional(): TransitionResult {
  return {
    decision: 'RequestAdditional',
    entityPatch: { status: 'blocked', blockReason: 'UnderInvestigation' },
  };
}

export function applyReject(): TransitionResult {
  return {
    decision: 'Rejected',
    entityPatch: { status: 'closed', closeReason: 'RejectedDueToKyc', blockReason: null },
  };
}

export function applyVerifySubmit(proposedRiskScore: number): TransitionResult {
  return {
    decision: 'PendingVerification',
    entityPatch: { riskScore: proposedRiskScore },
  };
}

export function applyVerifyFinalize(proposedRiskScore: number): TransitionResult {
  return {
    decision: 'Verified',
    entityPatch: { status: 'active', blockReason: null, riskScore: proposedRiskScore },
  };
}

export function canApplyDecision(current: KycDecision): boolean {
  return current == null || current === 'RequestAdditional';
}
