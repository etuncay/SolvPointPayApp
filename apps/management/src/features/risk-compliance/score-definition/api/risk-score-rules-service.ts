import type { DslValidationResult } from '../../shared/rule-dsl/parser';
import type { RiskScoreScope } from '../../shared/rule-dsl/variables';
import type {
  RiskActionSet,
  RiskScoreRule,
  RiskScoreRuleAuditEntry,
  RiskScoreRuleInput,
  RiskScoreRuleUpdateInput,
  SimulationResult,
} from '../domain/types';

export type RiskScoreRulesPort = {
  list(scope: RiskScoreScope): RiskScoreRule[];
  create(scope: RiskScoreScope, input: RiskScoreRuleInput): RiskScoreRule;
  update(id: string, input: RiskScoreRuleUpdateInput): RiskScoreRule;
  toggle(id: string): RiskScoreRule;
  validate(dsl: string, scope: RiskScoreScope): DslValidationResult;
  simulate(scope: RiskScoreScope, draftRules?: RiskScoreRule[]): SimulationResult;
  getActionSets(scope: RiskScoreScope): RiskActionSet[];
  saveActionSets(scope: RiskScoreScope, sets: RiskActionSet[]): RiskActionSet[];
  getAuditLog(): RiskScoreRuleAuditEntry[];
  resetForTests(): void;
};

let port: RiskScoreRulesPort | null = null;

export function setRiskScoreRulesPort(next: RiskScoreRulesPort) {
  port = next;
}

function getPort(): RiskScoreRulesPort {
  if (!port) throw new Error('RiskScoreRulesPort not configured');
  return port;
}

export const riskScoreRulesService = {
  list(scope: RiskScoreScope) {
    return getPort().list(scope);
  },
  create(scope: RiskScoreScope, input: RiskScoreRuleInput) {
    return getPort().create(scope, input);
  },
  update(id: string, input: RiskScoreRuleUpdateInput) {
    return getPort().update(id, input);
  },
  toggle(id: string) {
    return getPort().toggle(id);
  },
  validate(dsl: string, scope: RiskScoreScope) {
    return getPort().validate(dsl, scope);
  },
  simulate(scope: RiskScoreScope, draftRules?: RiskScoreRule[]) {
    return getPort().simulate(scope, draftRules);
  },
  getActionSets(scope: RiskScoreScope) {
    return getPort().getActionSets(scope);
  },
  saveActionSets(scope: RiskScoreScope, sets: RiskActionSet[]) {
    return getPort().saveActionSets(scope, sets);
  },
  getAuditLog() {
    return getPort().getAuditLog();
  },
  resetForTests() {
    getPort().resetForTests();
  },
};
