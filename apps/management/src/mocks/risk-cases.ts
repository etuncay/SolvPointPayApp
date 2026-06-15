/** Risk vakaları — dashboard yaş bucket ve badge için paylaşımlı seed */

export type RiskCaseStatus = 'open' | 'closed';
export type RiskCaseResolution = 'Resolved_Confirmed' | 'Resolved_False_Positive' | 'Rejected' | null;

export type RiskCase = {
  id: string;
  customerId?: number;
  agentId?: number;
  ruleName?: string;
  openedAt: string;
  closedAt?: string;
  status: RiskCaseStatus;
  resolution: RiskCaseResolution;
  assignedStaff?: string;
};

const base = new Date('2026-05-24T12:00:00Z');

function daysAgo(n: number, hours = 0): string {
  const d = new Date(base);
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Açık vakalar — bucket test vektörleri dahil */
export const OPEN_RISK_CASES: RiskCase[] = [
  { id: 'RC-001', customerId: 99901, openedAt: daysAgo(0, 6), status: 'open', resolution: null, ruleName: 'Hızlı transfer', assignedStaff: 'Ayşe K.' },
  { id: 'RC-002', customerId: 99904, openedAt: daysAgo(0, 2), status: 'open', resolution: null, ruleName: 'Yüksek tutar', assignedStaff: 'Mehmet D.' },
  { id: 'RC-003', agentId: 12, openedAt: daysAgo(2), status: 'open', resolution: null, ruleName: 'Çoklu cihaz', assignedStaff: 'Ayşe K.' },
  { id: 'RC-004', customerId: 99907, openedAt: daysAgo(3), status: 'open', resolution: null, ruleName: 'PEP eşleşme', assignedStaff: 'Zeynep A.' },
  { id: 'RC-005', customerId: 99912, openedAt: daysAgo(6), status: 'open', resolution: null, ruleName: 'Gece işlemi', assignedStaff: 'Mehmet D.' },
  { id: 'RC-006', agentId: 5, openedAt: daysAgo(7), status: 'open', resolution: null, ruleName: 'Limit aşımı', assignedStaff: 'Can T.' },
  { id: 'RC-007', customerId: 99918, openedAt: daysAgo(8), status: 'open', resolution: null, ruleName: 'Kara liste', assignedStaff: 'Ayşe K.' },
  { id: 'RC-008', customerId: 99922, openedAt: daysAgo(12), status: 'open', resolution: null, ruleName: 'Şüpheli IP', assignedStaff: 'Zeynep A.' },
  { id: 'RC-009', agentId: 28, openedAt: daysAgo(15), status: 'open', resolution: null, ruleName: 'Mutabakat sapması', assignedStaff: 'Mehmet D.' },
];

export const CLOSED_RISK_CASES: RiskCase[] = [
  {
    id: 'RC-101',
    customerId: 99903,
    openedAt: daysAgo(20),
    closedAt: daysAgo(18),
    status: 'closed',
    resolution: 'Resolved_Confirmed',
    ruleName: 'Yüksek tutar',
    assignedStaff: 'Ayşe K.',
  },
  {
    id: 'RC-102',
    customerId: 99905,
    openedAt: daysAgo(14),
    closedAt: daysAgo(10),
    status: 'closed',
    resolution: 'Resolved_False_Positive',
    ruleName: 'Gece işlemi',
    assignedStaff: 'Can T.',
  },
];

export const ALL_RISK_CASES: RiskCase[] = [...OPEN_RISK_CASES, ...CLOSED_RISK_CASES];

export function countOpenRiskCases(): number {
  return OPEN_RISK_CASES.length;
}
