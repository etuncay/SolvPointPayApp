import type { CaseAgeBucket, CaseAgeSummary } from './types';

/** Açık vaka yaşı — her vaka tek bucket (spec §8) */
export function assignCaseAgeBucket(openedAt: string | Date, now: Date = new Date()): CaseAgeBucket {
  const opened = openedAt instanceof Date ? openedAt : new Date(openedAt);
  const days = (now.getTime() - opened.getTime()) / 86_400_000;
  if (days < 1) return '0_1';
  if (days < 5) return '1_5';
  if (days < 10) return '5_10';
  return 'gt_10';
}

export function buildCaseAgeSummary(
  openCases: { openedAt: string }[],
  now: Date = new Date(),
): CaseAgeSummary {
  const summary: CaseAgeSummary = { '0_1': 0, '1_5': 0, '5_10': 0, gt_10: 0 };
  for (const c of openCases) {
    summary[assignCaseAgeBucket(c.openedAt, now)] += 1;
  }
  return summary;
}
