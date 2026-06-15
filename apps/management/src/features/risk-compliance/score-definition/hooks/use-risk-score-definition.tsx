import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { riskScoreRulesService } from '../api';
import type { FraudAction } from '../../shared/fraud-actions';
import { RISK_LEVELS } from '../../shared/risk-classification';
import { RISK_SCORE_SCOPES, type RiskScoreScope } from '../../shared/rule-dsl/variables';
import type { RiskActionSet, RiskScoreRule, SimulationResult } from '../domain/types';

type ScopeState = {
  rules: RiskScoreRule[];
  actionSets: RiskActionSet[];
  dirty: boolean;
};

function emptyScopeState(): ScopeState {
  return { rules: [], actionSets: [], dirty: false };
}

export function useRiskScoreDefinition() {
  const { t } = useTranslation();
  const [scope, setScope] = useState<RiskScoreScope>('Customer');
  const [byScope, setByScope] = useState<Record<RiskScoreScope, ScopeState>>({
    Customer: emptyScopeState(),
    Agent: emptyScopeState(),
    Transaction: emptyScopeState(),
  });
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadScope = useCallback((s: RiskScoreScope) => {
    const rules = riskScoreRulesService.list(s);
    const actionSets = riskScoreRulesService.getActionSets(s);
    setByScope((prev) => ({
      ...prev,
      [s]: { rules, actionSets, dirty: false },
    }));
    setSelectedRuleId((cur) => (cur && rules.some((r) => r.id === cur) ? cur : rules[0]?.id ?? null));
  }, []);

  const loadAll = useCallback(() => {
    setLoading(true);
    for (const s of RISK_SCORE_SCOPES) loadScope(s);
    setLoading(false);
  }, [loadScope]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const current = byScope[scope];
  const selectedRule = useMemo(
    () => current.rules.find((r) => r.id === selectedRuleId) ?? null,
    [current.rules, selectedRuleId],
  );

  const markDirty = (s: RiskScoreScope = scope) => {
    setByScope((prev) => ({ ...prev, [s]: { ...prev[s], dirty: true } }));
  };

  const refreshRules = (s: RiskScoreScope = scope) => {
    const rules = riskScoreRulesService.list(s);
    setByScope((prev) => ({ ...prev, [s]: { ...prev[s], rules } }));
  };

  const createRule = (input: Parameters<typeof riskScoreRulesService.create>[1]) => {
    try {
      const row = riskScoreRulesService.create(scope, input);
      refreshRules();
      setSelectedRuleId(row.id);
      toast.success(t('rs_saved'));
      return row;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'rs_save_failed';
      toast.error(t(msg, msg));
      return null;
    }
  };

  const updateRule = (id: string, input: Parameters<typeof riskScoreRulesService.update>[1]) => {
    try {
      const row = riskScoreRulesService.update(id, input);
      refreshRules();
      toast.success(t('rs_saved'));
      return row;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'rs_save_failed';
      toast.error(t(msg, msg));
      return null;
    }
  };

  const toggleSelected = () => {
    if (!selectedRuleId) {
      toast.error(t('rs_select_rule'));
      return;
    }
    try {
      riskScoreRulesService.toggle(selectedRuleId);
      refreshRules();
      toast.success(t('rs_toggled'));
    } catch (e) {
      toast.error(t('rs_toggle_failed'));
    }
  };

  const validateDsl = (dsl: string) => riskScoreRulesService.validate(dsl, scope);

  const simulate = (draftRules?: RiskScoreRule[]): SimulationResult =>
    riskScoreRulesService.simulate(scope, draftRules);

  const updateActionSet = (level: (typeof RISK_LEVELS)[number], actions: FraudAction[]) => {
    setByScope((prev) => {
      const st = prev[scope];
      const nextSets = RISK_LEVELS.map((riskLevel) => {
        const existing = st.actionSets.find((a) => a.riskLevel === riskLevel);
        const base = existing ?? { scope, riskLevel, actions: [] as FraudAction[] };
        return riskLevel === level ? { ...base, actions } : base;
      });
      return {
        ...prev,
        [scope]: { ...st, actionSets: nextSets, dirty: true },
      };
    });
  };

  const saveScope = (s: RiskScoreScope = scope): boolean => {
    const st = byScope[s];
    if (!st.dirty) return true;
    try {
      riskScoreRulesService.saveActionSets(s, st.actionSets);
      setByScope((prev) => ({
        ...prev,
        [s]: { ...prev[s], dirty: false, actionSets: riskScoreRulesService.getActionSets(s) },
      }));
      toast.success(t('rs_actions_saved'));
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'rs_action_conflict';
      toast.error(t(msg, msg));
      return false;
    }
  };

  const saveAllDirty = (): boolean => {
    let ok = true;
    for (const s of RISK_SCORE_SCOPES) {
      if (byScope[s].dirty && !saveScope(s)) ok = false;
    }
    return ok;
  };

  const anyDirty = RISK_SCORE_SCOPES.some((s) => byScope[s].dirty);

  const switchScope = (next: RiskScoreScope) => {
    setScope(next);
    loadScope(next);
  };

  const scopeIndex = RISK_SCORE_SCOPES.indexOf(scope);
  const nextScope = RISK_SCORE_SCOPES[scopeIndex + 1];

  return {
    scope,
    switchScope,
    nextScope,
    loading,
    rules: current.rules,
    actionSets: current.actionSets,
    dirty: current.dirty,
    anyDirty,
    selectedRuleId,
    setSelectedRuleId,
    selectedRule,
    markDirty,
    createRule,
    updateRule,
    toggleSelected,
    validateDsl,
    simulate,
    updateActionSet,
    saveScope,
    saveAllDirty,
    reload: loadAll,
  };
}
