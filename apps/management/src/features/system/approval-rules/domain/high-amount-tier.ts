import type { ApprovalCount } from './types';

/** Yüksek rakamlar kademesi — §8 */
export function tierApprovalCount(
  value: number,
  noApprovalLimit: number | null,
  oneApprovalLimit: number | null,
  maxCount: ApprovalCount,
): ApprovalCount {
  if (noApprovalLimit == null || oneApprovalLimit == null) return maxCount;
  let tier: ApprovalCount = 2;
  if (value <= noApprovalLimit) tier = 0;
  else if (value <= oneApprovalLimit) tier = 1;
  return Math.min(tier, maxCount) as ApprovalCount;
}
