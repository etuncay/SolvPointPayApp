import { AGENTS } from '@/mocks/agents';
import { CUSTOMERS } from '@/mocks/data';

export function resolveCustomerDisplay(requesterId: string): {
  customerNo: string;
  displayName: string;
  riskScore: number;
} {
  const trimmed = requesterId.trim();
  const numericId = Number(trimmed);
  const byId =
    Number.isFinite(numericId) && numericId > 0
      ? CUSTOMERS.find((c) => c.id === numericId)
      : undefined;
  if (byId) {
    return {
      customerNo: String(byId.id),
      displayName: byId.name,
      riskScore: byId.riskScore ?? 0,
    };
  }
  return {
    customerNo: trimmed || '—',
    displayName: trimmed ? `Müşteri ${trimmed}` : '—',
    riskScore: 0,
  };
}

export function resolveAgentDisplay(requesterId: string): {
  agentNo: string;
  displayName: string;
  riskScore: number;
} {
  const trimmed = requesterId.trim();
  const agMatch = /^AG-(\d+)$/i.exec(trimmed);
  const numericId = agMatch ? Number(agMatch[1]) : Number(trimmed);
  const agent =
    Number.isFinite(numericId) && numericId > 0
      ? AGENTS.find((a) => a.id === numericId && a.recordStatus === 1)
      : undefined;
  if (agent) {
    return {
      agentNo: `AG-${agent.id}`,
      displayName: agent.name,
      riskScore: 20 + (agent.id % 60),
    };
  }
  return {
    agentNo: trimmed || '—',
    displayName: trimmed ? `Temsilci ${trimmed}` : '—',
    riskScore: 0,
  };
}
