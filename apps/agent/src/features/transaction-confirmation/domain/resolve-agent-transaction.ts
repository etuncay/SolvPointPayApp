import { generateAgentActivities } from '@epay/data';
import type { Transaction } from '@/mocks/transactions';
import { parseCustomerNo } from '@/features/customer-search/domain/format-customer-no';
import { agentTransactionsStore, DEMO_AGENT_ID } from '../api/agent-transactions-store';
import { buildTransactionDetail } from './build-transaction-detail';
import { buildTransactionDetailFromActivity } from './build-transaction-detail-from-activity';
import type { TransactionDetail } from './transaction-detail';
import type { AgentRole } from './types';

/** @epay/data hesap hareketleri seed'i — Dexie `generateAgentActivities()` ile aynı kaynak. */
const ACTIVITY_BY_TX_ID = new Map(generateAgentActivities().map((a) => [a.transactionId, a]));

export type TransactionDetailSource = 'store' | 'activity';

export type ResolvedAgentTransaction = {
  source: TransactionDetailSource;
  detail: TransactionDetail;
  agentRole: AgentRole;
  /** Store kaydı — onay/iptal/dekont yükleme yapılabilir. */
  storeBacked: boolean;
  hasReceipt: boolean;
};

export function getAgentActivityByTransactionId(id: number) {
  return ACTIVITY_BY_TX_ID.get(id);
}

export function resolveAgentRoleFromTransaction(tx: Transaction): AgentRole {
  if (tx.senderAgentId === DEMO_AGENT_ID) return 'Sender';
  if (tx.receiverAgentId === DEMO_AGENT_ID) return 'Receiver';
  return null;
}

function resolveAgentRoleFromActivity(activity: { direction: string }): AgentRole {
  return activity.direction === 'Inflow' ? 'Receiver' : 'Sender';
}

/**
 * İşlem detayı — önce `agentTransactionsStore`, yoksa hesap hareketleri fallback.
 * Hesaplarım satır tıklama → onay/detay ekranı ile aynı projection.
 */
export function resolveAgentTransaction(id: number): ResolvedAgentTransaction | null {
  const tx = agentTransactionsStore.get(id);
  if (tx) {
    const detail = buildTransactionDetail(tx, [], [], null);
    return {
      source: 'store',
      detail,
      agentRole: resolveAgentRoleFromTransaction(tx),
      storeBacked: true,
      hasReceipt: agentTransactionsStore.hasReceipt(id),
    };
  }

  const activity = ACTIVITY_BY_TX_ID.get(id);
  if (!activity) return null;

  const detail = buildTransactionDetailFromActivity(activity);
  return {
    source: 'activity',
    detail,
    agentRole: resolveAgentRoleFromActivity(activity),
    storeBacked: false,
    hasReceipt: false,
  };
}

/** Drawer / liste — yalnızca detay projection. */
export function resolveAgentTransactionDetail(id: number): TransactionDetail | null {
  return resolveAgentTransaction(id)?.detail ?? null;
}

export function parseActivityCounterpartyCustomerNo(counterpartyNo?: string | null): number | null {
  if (!counterpartyNo?.trim()) return null;
  return parseCustomerNo(counterpartyNo.trim());
}
