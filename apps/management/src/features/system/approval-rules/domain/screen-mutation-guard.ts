import { getScreenApprovalRulesStore } from '@/mocks/screen-approval-rules';
import { checkScreenApproverAvailability } from './approver-availability';
import { getScreenByKey } from '@/features/system/shared/screen-registry';

let blockedWrites = new Set<string>();

export function rebuildBlockedScreenWrites(): Set<string> {
  const next = new Set<string>();
  for (const rule of getScreenApprovalRulesStore()) {
    const def = getScreenByKey(rule.screenKey);
    const issue = checkScreenApproverAvailability(
      rule.screenKey,
      def?.labelKey ?? rule.screenKey,
      rule.approvalCount,
    );
    if (issue) next.add(rule.screenKey);
  }
  blockedWrites = next;
  return blockedWrites;
}

rebuildBlockedScreenWrites();

export function isScreenWriteBlocked(screenKey: string): boolean {
  return blockedWrites.has(screenKey);
}

export function getBlockedScreenKeys(): string[] {
  return [...blockedWrites];
}

export function setBlockedScreenWrites(keys: Iterable<string>): void {
  blockedWrites = new Set(keys);
}
