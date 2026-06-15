import { buildTransactionListItem } from '@/features/transfers/domain/build-transaction-list-item';
import { getTransactionsStoreSnapshot } from '@/features/transfers/api/mock-transactions-adapter';
import { CUSTOMERS } from '@/mocks/data';
import { TRANSACTION_BLOCKS } from '@/mocks/transaction-blocks';
import type { Transaction, TransactionStatus } from '@/mocks/transactions';
import { toTry } from '../domain/try-convert';
import type { TransferRow } from '../domain/types';

const CCY_CORRIDOR: Record<string, string> = {
  TRY: 'TR',
  USD: 'US',
  EUR: 'DE',
  GBP: 'GB',
};

function txAgeHours(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
}

function customerName(tx: Transaction): string {
  if (tx.senderCustomerId != null) {
    return CUSTOMERS.find((c) => c.id === tx.senderCustomerId)?.name ?? '—';
  }
  return '—';
}

function corridor(tx: Transaction): { from: string; to: string } {
  const from = CCY_CORRIDOR[tx.currency] ?? 'TR';
  const to = CCY_CORRIDOR[tx.targetCurrency ?? tx.currency] ?? from;
  return { from, to };
}

function toTransferRow(tx: Transaction, extra?: Partial<TransferRow>): TransferRow {
  const item = buildTransactionListItem(tx);
  const { from, to } = corridor(tx);
  return {
    id: item.transactionNo,
    customer: item.senderName !== '—' ? item.senderName : customerName(tx),
    from,
    to,
    amount: toTry(tx.amount, tx.currency),
    state: tx.status === 'Pending' ? 'pending' : tx.status === 'OnHold' ? 'held' : 'rejected',
    age: txAgeHours(tx.createdAt),
    risk: tx.amount > 50_000 ? 'high' : tx.amount > 15_000 ? 'med' : 'low',
    ...extra,
  };
}

function activeBlockReason(txId: number): string | undefined {
  const block = TRANSACTION_BLOCKS.find((b) => b.transactionId === txId && b.active);
  return block?.reason;
}

function rowsForStatus(statuses: TransactionStatus[], map?: (tx: Transaction) => Partial<TransferRow>): TransferRow[] {
  return getTransactionsStoreSnapshot()
    .filter((t) => t.recordStatus === 1 && statuses.includes(t.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20)
    .map((tx) => toTransferRow(tx, map?.(tx)));
}

export function projectPendingTransfers(): TransferRow[] {
  return rowsForStatus(['Pending'], () => ({ state: 'pending', rule: undefined }));
}

export function projectAmlHeldTransfers(): TransferRow[] {
  return rowsForStatus(['OnHold'], (tx) => ({
    state: 'held',
    rule: activeBlockReason(tx.id) ?? 'AML inceleme',
  }));
}

export function projectRejectedTransfers(): TransferRow[] {
  return rowsForStatus(['Canceled', 'ErrorComplete', 'ErrorSend', 'ErrorReceive'], (tx) => ({
    state: 'rejected',
    reason: tx.status === 'Canceled' ? 'İptal' : 'AML reddi',
  }));
}
