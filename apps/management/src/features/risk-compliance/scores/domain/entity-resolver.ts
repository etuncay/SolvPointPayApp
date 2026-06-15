import { CUSTOMERS } from '@/mocks/data';
import { AGENTS } from '@/mocks/agents';
import { TRANSACTIONS } from '@/mocks/transactions';
import { SAMPLE_AGENT } from '@/mocks/sample-agent';
import type { FraudRiskSource } from './types';

export type ResolvedEntity = {
  displayName: string;
  /** Müşteri/temsilci mock skoru — kayıt yoksa bootstrap */
  bootstrapScore?: number;
};

function norm(id: string): string {
  return id.trim();
}

function resolveCustomer(id: string): ResolvedEntity | null {
  const n = Number(id);
  if (!Number.isNaN(n)) {
    const c = CUSTOMERS.find((x) => x.id === n);
    if (c) return { displayName: c.name, bootstrapScore: c.riskScore };
  }
  return null;
}

function resolveAgent(id: string): ResolvedEntity | null {
  const key = norm(id).toUpperCase();
  if (key === 'AG-001' || key === SAMPLE_AGENT.agentNo.toUpperCase()) {
    return { displayName: SAMPLE_AGENT.name, bootstrapScore: SAMPLE_AGENT.riskScore };
  }
  const n = Number(id);
  if (!Number.isNaN(n)) {
    const a = AGENTS.find((x) => x.id === n);
    if (a) return { displayName: a.name, bootstrapScore: 35 + (n % 40) };
  }
  const byCode = AGENTS.find((_, i) => `AG-${String(i + 1).padStart(3, '0')}` === key);
  if (byCode) return { displayName: byCode.name, bootstrapScore: 40 };
  return null;
}

function resolveTransaction(id: string): ResolvedEntity | null {
  const key = norm(id).toUpperCase();
  const tx = TRANSACTIONS.find(
    (t) => t.txNo.toUpperCase() === key || String(t.id) === key,
  );
  if (tx) {
    const score = 30 + (tx.id % 55);
    return { displayName: tx.txNo, bootstrapScore: score };
  }
  return null;
}

export function resolveEntity(source: FraudRiskSource, entityId: string): ResolvedEntity | null {
  const id = norm(entityId);
  if (!id) return null;
  switch (source) {
    case 'Customer':
      return resolveCustomer(id);
    case 'Agent':
      return resolveAgent(id);
    case 'Transaction':
      return resolveTransaction(id);
    default:
      return null;
  }
}
