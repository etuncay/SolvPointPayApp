import type { ReviewQueueItem } from './types';

/** Spec §8 — kuyruk öncelik sıralaması */
function priorityRank(item: ReviewQueueItem): number {
  if (item.suspiciousFlag && item.nationality !== 'TUR') return 1;
  if (item.suspiciousFlag) return 2;
  if (item.nationality !== 'TUR') return 3;
  return 4;
}

export function sortQueueItems(items: ReviewQueueItem[]): ReviewQueueItem[] {
  return [...items].sort((a, b) => {
    const ra = priorityRank(a);
    const rb = priorityRank(b);
    if (ra !== rb) return ra - rb;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
