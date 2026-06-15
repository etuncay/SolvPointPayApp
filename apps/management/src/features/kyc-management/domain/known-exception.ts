import type { KycKnownException, KycReview } from './types';

export function resolveKnownException(
  review: Pick<KycReview, 'identityNo' | 'queryResultLabel'>,
  exceptions: KycKnownException[],
): boolean {
  const identityKey = review.identityNo.trim();
  if (!identityKey) return false;
  const matchPct = parseMatchPercent(review.queryResultLabel);
  return exceptions.some(
    (ex) =>
      ex.identityKey === identityKey &&
      matchPct >= ex.threshold &&
      ex.matchRule === 'identity_match',
  );
}

function parseMatchPercent(label: string): number {
  const leading = label.match(/%\s*(\d+(?:\.\d+)?)/);
  if (leading) return Number(leading[1]);
  const trailing = label.match(/(\d+(?:\.\d+)?)\s*%/);
  return trailing ? Number(trailing[1]) : 0;
}
