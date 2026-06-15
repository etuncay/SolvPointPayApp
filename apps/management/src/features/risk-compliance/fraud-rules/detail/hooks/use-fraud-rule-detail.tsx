import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { fraudRulesService } from '../../api';
import { getFraudRulesPermissions } from '../../domain/permissions';
import { validateActionSet } from '../domain/action-validation';
import {
  EMPTY_FRAUD_RULE_INPUT,
  recordToInput,
  type FraudExceptionInput,
  type FraudRuleInput,
  type FraudSimulationResult,
} from '../domain/types';

function inputsEqual(a: FraudRuleInput, b: FraudRuleInput): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useFraudRuleDetail() {
  const { ruleId: ruleIdParam } = useParams();
  const ruleId = ruleIdParam ?? '';
  const isNew = ruleId === 'new';
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = useMemo(() => getFraudRulesPermissions(role), [role]);
  const [version, setVersion] = useState(0);
  const [input, setInput] = useState<FraudRuleInput>(EMPTY_FRAUD_RULE_INPUT);
  const [baseline, setBaseline] = useState<FraudRuleInput>(EMPTY_FRAUD_RULE_INPUT);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const detail = useMemo(() => {
    if (isNew) return null;
    return fraudRulesService.getDetail(ruleId, role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, ruleId, role, version]);

  useEffect(() => {
    if (isNew) {
      setInput(EMPTY_FRAUD_RULE_INPUT);
      setBaseline(EMPTY_FRAUD_RULE_INPUT);
      return;
    }
    if (detail) {
      const next = recordToInput(detail.rule);
      setInput(next);
      setBaseline(next);
    }
  }, [isNew, detail]);

  const dirty = !inputsEqual(input, baseline);
  const savedId = isNew ? null : ruleId;
  const canPersist = !isNew && detail != null;

  const patchInput = useCallback((patch: Partial<FraudRuleInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
    setActionError(null);
  }, []);

  const validateDsl = useCallback(
    (dsl: string) => fraudRulesService.validateDsl(dsl, input.scope),
    [input.scope],
  );

  const save = useCallback(() => {
    const actions = validateActionSet(input.actionDetails);
    if (!actions.ok) {
      setActionError(actions.error ?? 'frd_action_conflict');
      return actions;
    }
    setActionError(null);
    if (isNew) {
      return fraudRulesService.create(input, role);
    }
    return fraudRulesService.update(ruleId, input, role);
  }, [input, isNew, ruleId, role]);

  const toggle = useCallback(() => {
    if (!canPersist) return { ok: false as const, error: 'frd_not_found' };
    const result = fraudRulesService.toggle(ruleId, role);
    if (result.ok) refresh();
    return result;
  }, [canPersist, ruleId, role, refresh]);

  const simulate = useCallback((): FraudSimulationResult | null => {
    return fraudRulesService.simulate(savedId, input, role);
  }, [savedId, input, role]);

  const addException = useCallback(
    (exc: FraudExceptionInput) => {
      if (!canPersist) return { ok: false as const, error: 'frd_save_first' };
      const result = fraudRulesService.addException(ruleId, exc, role);
      if (result.ok) refresh();
      return result;
    },
    [canPersist, ruleId, role, refresh],
  );

  const afterSave = useCallback(
    (id: string, stay: boolean) => {
      const loaded = fraudRulesService.getDetail(id, role);
      if (loaded) {
        const next = recordToInput(loaded.rule);
        setInput(next);
        setBaseline(next);
      }
      refresh();
      if (stay && isNew) {
        navigate(`/risk/fraud-rules/${id}`, { replace: true });
      }
    },
    [isNew, navigate, role, refresh],
  );

  return {
    ruleId,
    isNew,
    detail,
    input,
    patchInput,
    dirty,
    permissions,
    notFound: !isNew && detail == null,
    canPersist,
    actionError,
    validateDsl,
    save,
    toggle,
    simulate,
    addException,
    afterSave,
  };
}
