import type { BackOfficeRole } from '@epay/ui';
import type { FraudExceptionInput } from '@/features/risk-compliance/fraud-rules/detail/domain/types';
import type { CompliancePersona } from '../detail/domain/compliance-persona';
import type {
  CaseActionResult,
  CaseDecisionInput,
  CaseDetail,
  CaseRouteInput,
} from '../detail/domain/types';
import type { CaseListFilters, FraudCaseHeader, FraudCaseListItem } from '../domain/types';

export type FraudCaseAccessLogEntry = {
  id: number;
  action: 'list' | 'detail';
  count?: number;
  at: string;
};

export type FraudCasesService = {
  list(filters: CaseListFilters, role: BackOfficeRole): FraudCaseListItem[];
  exportRows(filters: CaseListFilters, role: BackOfficeRole): FraudCaseListItem[];
  getById(id: string, role: BackOfficeRole): FraudCaseHeader | null;
  countOpen(role: BackOfficeRole): number;
  getDetail(id: string, role: BackOfficeRole): CaseDetail | null;
  approve(id: string, input: CaseDecisionInput, role: BackOfficeRole, persona: CompliancePersona): CaseActionResult;
  reject(id: string, input: CaseDecisionInput, role: BackOfficeRole, persona: CompliancePersona): CaseActionResult;
  route(id: string, input: CaseRouteInput, role: BackOfficeRole, persona: CompliancePersona): CaseActionResult;
  addException(
    id: string,
    input: FraudExceptionInput,
    role: BackOfficeRole,
    persona: CompliancePersona,
  ): CaseActionResult;
  report(id: string, input: CaseDecisionInput, role: BackOfficeRole, persona: CompliancePersona): CaseActionResult;
};

let port: FraudCasesService | null = null;

export function setFraudCasesPort(next: FraudCasesService): void {
  port = next;
}

export const fraudCasesService: FraudCasesService = {
  list(filters, role) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.list(filters, role);
  },
  exportRows(filters, role) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.exportRows(filters, role);
  },
  getById(id, role) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.getById(id, role);
  },
  countOpen(role) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.countOpen(role);
  },
  getDetail(id, role) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.getDetail(id, role);
  },
  approve(id, input, role, persona) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.approve(id, input, role, persona);
  },
  reject(id, input, role, persona) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.reject(id, input, role, persona);
  },
  route(id, input, role, persona) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.route(id, input, role, persona);
  },
  addException(id, input, role, persona) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.addException(id, input, role, persona);
  },
  report(id, input, role, persona) {
    if (!port) throw new Error('FraudCasesService port not configured');
    return port.report(id, input, role, persona);
  },
};
