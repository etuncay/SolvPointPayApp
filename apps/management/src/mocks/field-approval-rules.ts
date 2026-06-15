import type { ApprovalScope } from '@/features/system/approval-rules/domain/types';
import type { ApprovalCount } from '@/features/system/approval-rules/domain/types';

export interface FieldApprovalRuleRecord {
  id: string;
  operationName: string;
  screenId: string;
  fieldName: string;
  specialCondition: string | null;
  scope: ApprovalScope;
  approvalCount: ApprovalCount;
  noApprovalLimit: number | null;
  oneApprovalLimit: number | null;
}

const SEED: FieldApprovalRuleRecord[] = [
  {
    id: 'far-001',
    operationName: 'customer.fee.update',
    screenId: 'customers.fees',
    fieldName: 'variableFeePct',
    specialCondition: null,
    scope: 'HighAmounts',
    approvalCount: 2,
    noApprovalLimit: 1000,
    oneApprovalLimit: 5000,
  },
  {
    id: 'far-002',
    operationName: 'agent.commission.update',
    screenId: 'agents.fees',
    fieldName: 'commissionRate',
    specialCondition: "currencyCode == 'TRY'",
    scope: 'IncreasesOnly',
    approvalCount: 1,
    noApprovalLimit: null,
    oneApprovalLimit: null,
  },
  {
    id: 'far-003',
    operationName: 'wallet.limit.update',
    screenId: 'wallets.detail',
    fieldName: 'w_DailyAmount',
    specialCondition: null,
    scope: 'HighAmounts',
    approvalCount: 2,
    noApprovalLimit: 100_000,
    oneApprovalLimit: 500_000,
  },
];

let store: FieldApprovalRuleRecord[] = SEED.map((r) => ({ ...r }));
let seq = 4;

export function resetFieldApprovalRulesStore(): void {
  store = SEED.map((r) => ({ ...r }));
  seq = 4;
}

export function getFieldApprovalRulesStore(): FieldApprovalRuleRecord[] {
  return store;
}

export function getFieldRuleById(id: string): FieldApprovalRuleRecord | undefined {
  return store.find((r) => r.id === id);
}

export function getFieldRuleByOperation(operationName: string): FieldApprovalRuleRecord | undefined {
  return store.find((r) => r.operationName === operationName);
}

export function appendFieldRule(
  input: Omit<FieldApprovalRuleRecord, 'id'>,
): FieldApprovalRuleRecord {
  const row: FieldApprovalRuleRecord = { id: `far-${String(seq++).padStart(3, '0')}`, ...input };
  store = [...store, row];
  return row;
}

export function updateFieldRule(
  id: string,
  patch: Partial<Omit<FieldApprovalRuleRecord, 'id' | 'operationName'>>,
): FieldApprovalRuleRecord | undefined {
  const idx = store.findIndex((r) => r.id === id);
  if (idx < 0) return undefined;
  const next = { ...store[idx]!, ...patch };
  store = [...store.slice(0, idx), next, ...store.slice(idx + 1)];
  return next;
}

export function deleteFieldRule(id: string): boolean {
  const before = store.length;
  store = store.filter((r) => r.id !== id);
  return store.length < before;
}
