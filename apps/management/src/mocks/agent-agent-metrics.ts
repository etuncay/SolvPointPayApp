import { AGENTS } from './agents';
import { mulberry32 } from '@/lib/format';

const rand = mulberry32(303);

export type AgentAgentMetricSeed = {
  agentId: number;
  avgFeePerTx: number | null;
  avgTxCount: number | null;
};

/** Temsilci bazlı performans metrikleri — null → UI "—" */
export const AGENT_AGENT_METRICS_SEED: AgentAgentMetricSeed[] = AGENTS.filter(
  (a) => a.recordStatus === 1,
).map((a, i) => ({
  agentId: a.id,
  avgFeePerTx: i % 5 === 2 ? null : Math.round((4 + rand() * 14) * 10) / 10,
  avgTxCount: i % 7 === 4 ? null : Math.floor(10 + rand() * 90),
}));
