import type { Transaction } from '@/mocks/transactions';
import { buildTransactionDetail } from '@/features/transaction-confirmation/domain/build-transaction-detail';
import { DEMO_AGENT_ID } from './demo-agent';
import { computeAgentRevenueTry } from './compute-agent-revenue-try';
import type { AgentRole, AgentTransactionRow } from './types';

/**
 * Transaction → liste satırı projection. Ad/IBAN çözümü Detay Modu ile aynı
 * `buildTransactionDetail` üzerinden yapılır; böylece liste ve detay tutarlı kalır.
 */
export function buildAgentTransactionRow(tx: Transaction): AgentTransactionRow {
  const detail = buildTransactionDetail(tx, [], [], null);
  const agentRole: AgentRole = tx.senderAgentId === DEMO_AGENT_ID ? 'SenderAgent' : 'ReceiverAgent';

  return {
    id: detail.id,
    transactionNo: detail.transactionNo,
    createdAt: detail.createdAt,
    senderName: detail.sender.name,
    receiverName: detail.receiver.name,
    iban: detail.receiver.iban ?? detail.sender.iban,
    transactionType: detail.transactionType,
    currency: detail.sourceCurrency,
    amount: detail.principalAmount,
    description: detail.description,
    referenceNo: detail.referenceNo,
    status: detail.status,
    agentRole,
    totalRevenueTry: computeAgentRevenueTry(tx),
  };
}
