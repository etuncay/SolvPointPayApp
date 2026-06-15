/** Günlük hesaplanmış grup metrikleri — salt okunur UI */
export type AgentGroupMetricSeed = {
  groupCode: string;
  calcDate: string;
  agentCount: number;
  avgFeePerTx: number | null;
  avgTxCountPerAgent: number | null;
};

export const AGENT_GROUP_METRICS_SEED: AgentGroupMetricSeed[] = [
  {
    groupCode: 'PLATINUM',
    calcDate: '2026-05-23',
    agentCount: 8,
    avgFeePerTx: 12.5,
    avgTxCountPerAgent: 45,
  },
  {
    groupCode: 'GOLD',
    calcDate: '2026-05-23',
    agentCount: 11,
    avgFeePerTx: 9.8,
    avgTxCountPerAgent: 38,
  },
  {
    groupCode: 'SILVER',
    calcDate: '2026-05-23',
    agentCount: 9,
    avgFeePerTx: null,
    avgTxCountPerAgent: 22,
  },
  {
    groupCode: 'BRONZE',
    calcDate: '2026-05-23',
    agentCount: 7,
    avgFeePerTx: 6.2,
    avgTxCountPerAgent: null,
  },
  {
    groupCode: 'STANDARD',
    calcDate: '2026-05-23',
    agentCount: 14,
    avgFeePerTx: 4.5,
    avgTxCountPerAgent: 18,
  },
  {
    groupCode: 'LEGACY_TIER',
    calcDate: '2026-05-23',
    agentCount: 0,
    avgFeePerTx: null,
    avgTxCountPerAgent: null,
  },
];
