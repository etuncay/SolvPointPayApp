import type { BackOfficeRole } from '@epay/ui';
import type { DslValidationResult } from '../../shared/rule-dsl/parser';
import type { FraudRuleFilters, FraudRuleListItem, FraudRuleRecord } from '../domain/types';
import type {
  FraudExceptionInput,
  FraudRuleDetail,
  FraudRuleInput,
  FraudRuleSaveResult,
  FraudSimulationResult,
} from '../detail/domain/types';
import type { FraudScope } from '../domain/types';

export type FraudRuleAccessLogEntry = {
  id: number;
  action: 'list' | 'export' | 'detail' | 'create' | 'update' | 'toggle' | 'simulate' | 'exception';
  count?: number;
  at: string;
  by: string;
};

export type FraudRulesService = {
  list(filters: FraudRuleFilters, role: BackOfficeRole): FraudRuleListItem[];
  exportRows(filters: FraudRuleFilters, role: BackOfficeRole): FraudRuleListItem[];
  getDetail(id: string, role: BackOfficeRole): FraudRuleDetail | null;
  create(input: FraudRuleInput, role: BackOfficeRole): FraudRuleSaveResult;
  update(id: string, input: FraudRuleInput, role: BackOfficeRole): FraudRuleSaveResult;
  toggle(id: string, role: BackOfficeRole): FraudRuleSaveResult;
  validateDsl(dsl: string, scope: FraudScope): DslValidationResult;
  simulate(id: string | null, draft: FraudRuleInput | null, role: BackOfficeRole): FraudSimulationResult | null;
  addException(id: string, input: FraudExceptionInput, role: BackOfficeRole): FraudRuleSaveResult;
};

let port: FraudRulesService | null = null;

export function setFraudRulesPort(next: FraudRulesService): void {
  port = next;
}

export const fraudRulesService: FraudRulesService = {
  list(filters, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.list(filters, role);
  },
  exportRows(filters, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.exportRows(filters, role);
  },
  getDetail(id, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.getDetail(id, role);
  },
  create(input, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.create(input, role);
  },
  update(id, input, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.update(id, input, role);
  },
  toggle(id, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.toggle(id, role);
  },
  validateDsl(dsl, scope) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.validateDsl(dsl, scope);
  },
  simulate(id, draft, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.simulate(id, draft, role);
  },
  addException(id, input, role) {
    if (!port) throw new Error('FraudRulesService port not configured');
    return port.addException(id, input, role);
  },
};
