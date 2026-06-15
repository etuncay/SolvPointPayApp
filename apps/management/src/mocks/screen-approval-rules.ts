import { BACKOFFICE_SCREENS } from '@/features/system/shared/screen-registry';
import type { ApprovalCount } from '@/features/system/approval-rules/domain/types';

export interface ScreenApprovalRuleRecord {
  id: string;
  moduleId: string;
  screenId: string;
  screenKey: string;
  approvalCount: ApprovalCount;
}

function buildSeed(): ScreenApprovalRuleRecord[] {
  const counts: ApprovalCount[] = [0, 0, 1, 1, 2, 0, 1, 2, 0, 1, 0, 1, 2, 1, 0, 2, 1, 0, 1];
  return BACKOFFICE_SCREENS.map((s, i) => ({
    id: `sar-${s.screenId}`,
    moduleId: s.moduleId,
    screenId: s.screenId,
    screenKey: s.screenKey,
    approvalCount: counts[i % counts.length] ?? 0,
  }));
}

let store: ScreenApprovalRuleRecord[] = buildSeed();

/** risk.admin — 2 onaycı gerektirir; MVP'de 2. onaycı rolü yok → engel testi */
export function seedBlockedScreenScenario(): void {
  const idx = store.findIndex((r) => r.screenKey === 'risk.admin');
  if (idx >= 0) {
    store = [
      ...store.slice(0, idx),
      { ...store[idx]!, approvalCount: 2 },
      ...store.slice(idx + 1),
    ];
  }
}

seedBlockedScreenScenario();

export function resetScreenApprovalRulesStore(): void {
  store = buildSeed();
  seedBlockedScreenScenario();
}

export function getScreenApprovalRulesStore(): ScreenApprovalRuleRecord[] {
  return store;
}

export function updateScreenApprovalRules(
  updates: { id: string; approvalCount: ApprovalCount }[],
): ScreenApprovalRuleRecord[] {
  const byId = new Map(updates.map((u) => [u.id, u.approvalCount]));
  store = store.map((r) =>
    byId.has(r.id) ? { ...r, approvalCount: byId.get(r.id)! } : r,
  );
  return store;
}

export function getScreenRuleByKey(screenKey: string): ScreenApprovalRuleRecord | undefined {
  return store.find((r) => r.screenKey === screenKey);
}
