import {
  createReconciliationCase,
  findOpenReconciliationCase,
  resolveSupportCase,
} from '@/mocks/support-cases';
import { deriveUrgencyLevels } from './tolerance-config';
import type { BankReconciliation } from './types';

/** Unmatched satır için destek talebi — tek açık talep kuralı */
export function ensureReconciliationCase(row: BankReconciliation): {
  caseId: number;
  caseNo: string;
  created: boolean;
} {
  const amountDelta = Math.abs(row.amount - row.bankAmount);
  const levels = deriveUrgencyLevels(amountDelta);
  const existing = row.caseId != null ? findOpenReconciliationCase(row.id) : null;
  const supportCase = createReconciliationCase({
    reconciliationId: row.id,
    amountDelta,
    referenceNo: row.referenceNo,
    urgencyLevel: levels.urgencyLevel,
    criticalityLevel: levels.criticalityLevel,
  });
  return {
    caseId: supportCase.id,
    caseNo: supportCase.caseNo,
    created: !existing,
  };
}

/** Talep kapanınca mutabakat Adjusted — idempotent */
export function closeReconciliationFromCase(row: BankReconciliation): {
  status: 'Adjusted';
  alreadyAdjusted: boolean;
} {
  if (row.status === 'Adjusted') {
    return { status: 'Adjusted', alreadyAdjusted: true };
  }
  if (row.caseId != null) {
    resolveSupportCase(row.caseId);
  }
  return { status: 'Adjusted', alreadyAdjusted: false };
}
