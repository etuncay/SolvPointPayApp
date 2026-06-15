import type { FraudAction } from '../../../shared/fraud-actions';
import { hasActionConflict } from '../../../shared/fraud-actions';
import type { BlockParams, FraudRuleAction } from './types';

export function validateActionSet(actions: FraudRuleAction[]): { ok: true } | { ok: false; error: string } {
  if (actions.length === 0) {
    return { ok: false, error: 'frd_actions_required' };
  }

  const types = actions.map((a) => a.type);
  if (hasActionConflict(types)) {
    return { ok: false, error: 'frd_action_conflict' };
  }

  for (const action of actions) {
    const err = validateSingleAction(action);
    if (err) return { ok: false, error: err };
  }

  return { ok: true };
}

function validateSingleAction(action: FraudRuleAction): string | null {
  switch (action.type) {
    case 'Block': {
      const p = (action.params ?? {}) as BlockParams;
      if (!p.target) return 'frd_block_target_required';
      if (p.target === 'Transaction') return null;
      if (p.durationMinutes == null || p.durationMinutes < 0) return 'frd_block_duration_required';
      return null;
    }
    case 'AddRisk': {
      const p = action.params as { durationDays?: number; riskPoints?: number } | undefined;
      if (p?.durationDays == null || p.durationDays < 1) return 'frd_addrisk_duration';
      if (p.riskPoints == null || p.riskPoints < 0 || p.riskPoints > 100) return 'frd_addrisk_points';
      return null;
    }
    case 'CreateCase': {
      const p = action.params as { severity?: string } | undefined;
      if (!p?.severity) return 'frd_case_severity_required';
      return null;
    }
    default:
      return null;
  }
}

export function isBlockTransactionTarget(action: FraudRuleAction): boolean {
  return action.type === 'Block' && (action.params as BlockParams | undefined)?.target === 'Transaction';
}

export function toggleActionType(
  actions: FraudRuleAction[],
  type: FraudAction,
  checked: boolean,
): FraudRuleAction[] {
  if (checked) {
    if (actions.some((a) => a.type === type)) return actions;
    const next: FraudRuleAction = { type };
    if (type === 'Block') next.params = { target: 'Transaction', durationMinutes: 60 };
    if (type === 'AddRisk') next.params = { target: 'Customer', durationDays: 30, riskPoints: 10 };
    if (type === 'CreateCase') next.params = { severity: 'Medium' };
    return [...actions, next];
  }
  return actions.filter((a) => a.type !== type);
}
