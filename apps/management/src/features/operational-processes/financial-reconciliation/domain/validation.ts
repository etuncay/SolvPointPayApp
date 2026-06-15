import type { FinReconStatus } from './types';

export function validateAdjustDescription(description: string): 'finrec_description_required' | null {
  if (!description.trim()) return 'finrec_description_required';
  return null;
}

export function canAdjustStatus(status: FinReconStatus): boolean {
  return status === 'PendingReview';
}
