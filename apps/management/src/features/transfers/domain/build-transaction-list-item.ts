import { CUSTOMERS, TOP_AGENTS } from '@/mocks/data';
import { maskIban, type Transaction } from '@/mocks/transactions';
import { getWallets } from '@/lib/wallets-store';
import type { TransactionListItem } from './types';

const IBAN_TYPES = new Set(['WalletToBankAccount', 'InternationalTransfer']);

function customerName(id: number | null): string | null {
  if (id == null) return null;
  return CUSTOMERS.find((c) => c.id === id)?.name ?? null;
}

function agentName(id: number | string | null): string | null {
  if (id == null) return null;
  return TOP_AGENTS.find((a) => a.id === id)?.name ?? null;
}

/** Transaction header → liste satırı denormalize */
export function buildTransactionListItem(tx: Transaction): TransactionListItem {
  const wallets = getWallets();
  const senderWallet = tx.senderWalletId != null ? wallets.find((w) => w.id === tx.senderWalletId) : null;
  const receiverWallet =
    tx.receiverWalletId != null ? wallets.find((w) => w.id === tx.receiverWalletId) : null;

  const senderName =
    customerName(tx.senderCustomerId) ??
    agentName(tx.senderAgentId) ??
    senderWallet?.ownerName ??
    '—';
  const receiverName =
    customerName(tx.receiverCustomerId) ??
    agentName(tx.receiverAgentId) ??
    receiverWallet?.ownerName ??
    (tx.receiverIban ? 'Banka Hesabı' : '—');

  const rawIban = tx.receiverIban ?? tx.senderIban;
  const iban = IBAN_TYPES.has(tx.type) && rawIban ? maskIban(rawIban) : null;

  return {
    id: tx.id,
    transactionNo: tx.txNo,
    createdAt: tx.createdAt,
    senderCustomerNo: tx.senderCustomerId,
    senderWalletNo: senderWallet?.walletNo ?? null,
    senderName,
    receiverCustomerNo: tx.receiverCustomerId,
    receiverWalletNo: receiverWallet?.walletNo ?? null,
    receiverName,
    senderAgentNo: tx.senderAgentId,
    receiverAgentNo: tx.receiverAgentId,
    iban,
    transactionType: tx.type,
    sourceCurrency: tx.currency,
    principalAmount: tx.amount,
    status: tx.status,
  };
}
