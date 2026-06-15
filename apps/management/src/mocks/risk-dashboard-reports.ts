import { CUSTOMERS } from '@/mocks/data';
import { AGENTS } from '@/mocks/agents';
import type {
  HighRiskApprovedRow,
  PartyReportRow,
  RulePerformanceRow,
  StaffPerformanceRow,
} from '@/features/risk-compliance/domain/types';

/** Müşteri raporu — itiraz sayısı ↓ varsayılan sıra */
export const CUSTOMER_REPORT_ROWS: PartyReportRow[] = CUSTOMERS.slice(0, 24)
  .map((c, i) => ({
    partyNo: String(c.id),
    name: c.name,
    caseCount: 1 + (i % 7),
    blockedTxCount: i % 4,
    riskScore: c.riskScore,
    disputeCount: 12 - (i % 13),
  }))
  .sort((a, b) => b.disputeCount - a.disputeCount);

/** Temsilci raporu */
export const AGENT_REPORT_ROWS: PartyReportRow[] = AGENTS.slice(0, 20)
  .map((a, i) => ({
    partyNo: `AG-${a.id}`,
    name: a.name,
    caseCount: 1 + (i % 5),
    blockedTxCount: i % 3,
    riskScore: 20 + (i % 60),
    disputeCount: 10 - (i % 11),
  }))
  .sort((a, b) => b.disputeCount - a.disputeCount);

/** §19 MVP: Resolved_Confirmed = true positive — sabit oranlar */
export const RULE_PERFORMANCE_ROWS: RulePerformanceRow[] = [
  { ruleName: 'Yüksek tutar', alarmCount: 142, casesOpened: 38, truePositive: 22, tpRate: 0.58, avgCloseDays: 3.2 },
  { ruleName: 'Gece işlemi', alarmCount: 98, casesOpened: 24, truePositive: 9, tpRate: 0.38, avgCloseDays: 2.1 },
  { ruleName: 'Hızlı transfer', alarmCount: 76, casesOpened: 31, truePositive: 18, tpRate: 0.58, avgCloseDays: 4.5 },
  { ruleName: 'PEP eşleşme', alarmCount: 41, casesOpened: 12, truePositive: 11, tpRate: 0.92, avgCloseDays: 6.8 },
  { ruleName: 'Çoklu cihaz', alarmCount: 55, casesOpened: 19, truePositive: 7, tpRate: 0.37, avgCloseDays: 2.9 },
  { ruleName: 'Kara liste', alarmCount: 33, casesOpened: 15, truePositive: 14, tpRate: 0.93, avgCloseDays: 1.5 },
  { ruleName: 'Limit aşımı', alarmCount: 64, casesOpened: 28, truePositive: 12, tpRate: 0.43, avgCloseDays: 3.8 },
  { ruleName: 'Şüpheli IP', alarmCount: 47, casesOpened: 16, truePositive: 5, tpRate: 0.31, avgCloseDays: 5.1 },
].sort((a, b) => b.alarmCount - a.alarmCount);

export const STAFF_PERFORMANCE_ROWS: StaffPerformanceRow[] = [
  { staffName: 'Ayşe K.', casesHandled: 42, escalations: 5, rejections: 8, approvals: 24, closedWorkloadTry: 1_850_000 },
  { staffName: 'Mehmet D.', casesHandled: 38, escalations: 7, rejections: 6, approvals: 21, closedWorkloadTry: 1_420_000 },
  { staffName: 'Zeynep A.', casesHandled: 35, escalations: 4, rejections: 9, approvals: 19, closedWorkloadTry: 980_000 },
  { staffName: 'Can T.', casesHandled: 29, escalations: 3, rejections: 11, approvals: 14, closedWorkloadTry: 720_000 },
  { staffName: 'Deniz Y.', casesHandled: 26, escalations: 2, rejections: 5, approvals: 17, closedWorkloadTry: 640_000 },
].sort((a, b) => b.casesHandled - a.casesHandled);

export const HIGH_RISK_APPROVED_ROWS: HighRiskApprovedRow[] = [
  {
    txNo: 'TX-884201',
    date: '2026-05-23',
    customerName: 'Anadolu Gıda Üretim A.Ş.',
    amount: 250_000,
    currency: 'TRY' as const,
    riskScore: 78,
    approvedBy: 'Emre K.',
    description: 'Ticari ödeme — ek belge onaylandı',
  },
  {
    txNo: 'TX-883992',
    date: '2026-05-22',
    customerName: 'Caner Avcı',
    amount: 95_000,
    currency: 'TRY' as const,
    riskScore: 72,
    approvedBy: 'Ayşe K.',
    description: 'Yüksek risk skoru — manuel onay',
  },
  {
    txNo: 'TX-883501',
    date: '2026-05-21',
    customerName: 'Hatice Acar',
    amount: 48_500,
    currency: 'TRY' as const,
    riskScore: 68,
    approvedBy: 'Mehmet D.',
    description: 'Günlük limit üstü istisna',
  },
  {
    txNo: 'TX-882910',
    date: '2026-05-20',
    customerName: 'Mustafa Karaca',
    amount: 120_000,
    currency: 'TRY' as const,
    riskScore: 81,
    approvedBy: 'Emre K.',
    description: 'AML inceleme sonrası onay',
  },
  {
    txNo: 'TX-882104',
    date: '2026-05-19',
    customerName: 'Yıldız Döviz Merkez A.Ş.',
    amount: 310_000,
    currency: 'TRY' as const,
    riskScore: 85,
    approvedBy: 'Zeynep A.',
    description: 'Kurumsal transfer — uyum onayı',
  },
  {
    txNo: 'TX-881550',
    date: '2026-05-18',
    customerName: 'Selin Yılmaz',
    amount: 62_000,
    currency: 'TRY' as const,
    riskScore: 74,
    approvedBy: 'Can T.',
    description: 'Tek seferlik yüksek tutar',
  },
].sort((a, b) => b.date.localeCompare(a.date));
