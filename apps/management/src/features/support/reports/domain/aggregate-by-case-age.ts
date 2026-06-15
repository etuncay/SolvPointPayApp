import { computeCaseAgeDays } from '../../domain/compute-case-age';
import { isOpenCaseStatus } from '../../domain/case-status-ui';
import type { SupportCase } from '../../domain/types';
import type { CaseAgeBucket, CaseAgeSummary } from './types';

/** Half-open gün aralıkları: tam 1 gün → 1_5 bucket */
export function assignSupportCaseAgeBucket(ageDays: number): CaseAgeBucket {
  if (ageDays < 1) return '0_1';
  if (ageDays < 5) return '1_5';
  if (ageDays < 10) return '5_10';
  return 'gt_10';
}

export function aggregateByCaseAge(
  cases: SupportCase[],
  at: Date = new Date('2026-05-24T12:00:00Z'),
): CaseAgeSummary {
  const summary: CaseAgeSummary = { '0_1': 0, '1_5': 0, '5_10': 0, gt_10: 0 };
  for (const c of cases) {
    if (!isOpenCaseStatus(c.caseStatus)) continue;
    const days = computeCaseAgeDays(c, at);
    summary[assignSupportCaseAgeBucket(days)] += 1;
  }
  return summary;
}
