import { MOCK_USER_IDS } from '@/features/approval-pool/domain/types';
import type {
  CaseChannel,
  CaseStatus,
  FraudCaseRecord,
} from '@/features/risk-compliance/cases/domain/types';
import type { RiskLevel } from '@/features/risk-compliance/shared/risk-classification';
import { isOpenCase } from '@/features/risk-compliance/cases/domain/case-status-groups';
import { FRAUD_RULES } from './fraud-rules';
import { TRANSACTIONS } from './transactions';

const BASE = new Date('2026-05-24T12:00:00Z');

function hoursFromBase(h: number): string {
  const d = new Date(BASE);
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

function daysFromBase(days: number, hours = 0): string {
  const d = new Date(BASE);
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

const OPEN_STATUSES: CaseStatus[] = [
  'Unassigned',
  'Assigned',
  'InProgress',
  'WaitingForCustomer',
  'WaitingForAgent',
  'Escalated',
  'ReOpened',
];

const CLOSED_STATUSES: CaseStatus[] = [
  'Resolved_ConfirmedFraud',
  'Resolved_NoIssue',
  'Resolved_PreventedFraud',
  'Resolved_InsufficientEvidence',
  'Rejected',
];

const PRIORITIES: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const CHANNELS: CaseChannel[] = ['Mobile', 'Web', 'Branch', 'API'];

const RULE_IDS = FRAUD_RULES.filter((r) => r.recordStatus === 1).map((r) => r.id);

function buildCases(): FraudCaseRecord[] {
  const txs = TRANSACTIONS.filter((t) => t.recordStatus === 1);
  const cases: FraudCaseRecord[] = [];
  let caseNum = 1001;

  const patterns: Array<{
    status: CaseStatus;
    priority: RiskLevel;
    assignedUserId: string | null;
    slaHours: number;
    createdHoursAgo: number;
    ruleIdx: number;
    channel: CaseChannel;
  }> = [];

  for (let i = 0; i < 28; i++) {
    patterns.push({
      status: OPEN_STATUSES[i % OPEN_STATUSES.length]!,
      priority: PRIORITIES[i % PRIORITIES.length]!,
      assignedUserId: i % 5 === 0 ? null : i % 3 === 0 ? MOCK_USER_IDS.compliance : 'u.ops',
      slaHours: i < 3 ? 6 : i < 6 ? 30 : 72,
      createdHoursAgo: i < 2 ? 4 : i < 5 ? 20 : 48 + i * 3,
      ruleIdx: i % RULE_IDS.length,
      channel: CHANNELS[i % CHANNELS.length]!,
    });
  }

  for (let i = 0; i < 7; i++) {
    patterns.push({
      status: CLOSED_STATUSES[i % CLOSED_STATUSES.length]!,
      priority: PRIORITIES[(i + 1) % PRIORITIES.length]!,
      assignedUserId: MOCK_USER_IDS.compliance,
      slaHours: 0,
      createdHoursAgo: 240 + i * 24,
      ruleIdx: (i + 2) % RULE_IDS.length,
      channel: CHANNELS[(i + 1) % CHANNELS.length]!,
    });
  }

  patterns.forEach((p, idx) => {
    const tx = txs[idx % txs.length]!;
    const createdAt = hoursFromBase(-p.createdHoursAgo);
    cases.push({
      id: `C-${caseNum++}`,
      transactionId: tx.id,
      ruleId: RULE_IDS[p.ruleIdx] ?? RULE_IDS[0]!,
      priority: p.priority,
      riskScore: 35 + (idx % 55),
      caseStatus: p.status,
      assignedUserId: p.assignedUserId,
      slaDueAt: hoursFromBase(p.slaHours),
      createdAt,
      channel: p.channel,
    });
  });

  // Demo — plan §4
  const demoTx = txs.find((t) => t.type === 'InternationalTransfer' && t.amount > 10_000) ?? txs[0]!;
  const demo = cases[0]!;
  demo.id = 'C-1001';
  demo.transactionId = demoTx.id;
  demo.ruleId = 'FR-001';
  demo.priority = 'Critical';
  demo.caseStatus = 'Assigned';
  demo.assignedUserId = MOCK_USER_IDS.compliance;
  demo.slaDueAt = hoursFromBase(8);
  demo.createdAt = hoursFromBase(-12);

  // Bana atanmış — 3 kayıt
  for (const id of ['C-1003', 'C-1008', 'C-1012']) {
    const c = cases.find((x) => x.id === id);
    if (c) {
      c.assignedUserId = MOCK_USER_IDS.compliance;
      c.caseStatus = c.caseStatus.startsWith('Resolved') ? c.caseStatus : 'InProgress';
    }
  }

  // Yüksek öncelik kümesi
  cases.filter((c) => ['C-1002', 'C-1005', 'C-1010'].includes(c.id)).forEach((c) => {
    c.priority = 'Critical';
  });

  // SLA yaklaşan
  cases.filter((c) => ['C-1004', 'C-1006', 'C-1015'].includes(c.id)).forEach((c) => {
    c.slaDueAt = hoursFromBase(12);
    c.priority = 'High';
  });

  // Yeni — Unassigned + son 24s
  const fresh = cases.find((c) => c.id === 'C-1020');
  if (fresh) {
    fresh.caseStatus = 'Unassigned';
    fresh.assignedUserId = null;
    fresh.createdAt = hoursFromBase(-2);
  }

  return cases;
}

export const FRAUD_CASES: FraudCaseRecord[] = buildCases();

export function countOpenFraudCases(): number {
  return FRAUD_CASES.filter((c) => isOpenCase(c.caseStatus)).length;
}
