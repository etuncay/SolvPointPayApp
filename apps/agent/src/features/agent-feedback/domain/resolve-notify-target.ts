import { AGENTS } from '@/mocks/agents';
import { CUSTOMERS } from '@/mocks/data';
import { parseCustomerNo } from '@/features/customer-search/domain/format-customer-no';
import { DEMO_AGENT_ID } from '@/features/transaction-confirmation/api/agent-transactions-store';
import type { RequesterOwner } from './types';

export type NotifyTarget = {
  phone: string;
  email: string;
  displayName: string;
};

/** §19 — Kendisi: oturum temsilcisi; Müşteri: CUSTOMERS iletişim kanalları. */
export function resolveNotifyTarget(
  requesterOwner: RequesterOwner,
  customerNo?: string,
): NotifyTarget | null {
  if (requesterOwner === 'Self') {
    const agent = AGENTS.find((a) => a.id === DEMO_AGENT_ID && a.recordStatus === 1);
    if (!agent) return null;
    return { phone: agent.phone, email: agent.email, displayName: agent.name };
  }

  const id = parseCustomerNo(customerNo ?? '');
  if (id == null) return null;
  const customer = CUSTOMERS.find((c) => c.id === id && c.status === 'active');
  if (!customer) return null;
  return { phone: customer.phone, email: customer.email, displayName: customer.name };
}
