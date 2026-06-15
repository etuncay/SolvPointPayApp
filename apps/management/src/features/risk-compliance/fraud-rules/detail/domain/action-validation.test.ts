import { describe, expect, it } from 'vitest';
import { validateActionSet, isBlockTransactionTarget } from './action-validation';
import type { FraudRuleAction } from './types';

describe('validateActionSet', () => {
  it('Allow + Block conflict', () => {
    const actions: FraudRuleAction[] = [{ type: 'Allow' }, { type: 'Block', params: { target: 'Transaction' } }];
    expect(validateActionSet(actions)).toEqual({ ok: false, error: 'frd_action_conflict' });
  });

  it('Block Transaction channel hidden validation skip', () => {
    const actions: FraudRuleAction[] = [{ type: 'Block', params: { target: 'Transaction' } }];
    expect(validateActionSet(actions)).toEqual({ ok: true });
    expect(isBlockTransactionTarget(actions[0]!)).toBe(true);
  });
});
