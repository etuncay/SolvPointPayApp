import { CUSTOMERS, TOP_AGENTS } from '@/mocks/data';
import { TRANSACTIONS, maskIban, type Transaction } from '@/mocks/transactions';
import { getWallets } from '@/lib/wallets-store';
import type { Wallet } from './types';
import type { WalletAccountMovement } from '@/mocks/wallet-account-movements';
import type { WalletActivity } from './activity-types';
import { deriveDirection } from './derive-direction';

function lookupCustomerName(id: number | null): string {
  if (id == null) return '—';
  return CUSTOMERS.find((c) => c.id === id)?.name ?? `#${id}`;
}

function lookupAgentName(id: number | string | null): string {
  if (id == null) return '—';
  return TOP_AGENTS.find((a) => a.id === id)?.name ?? `#${id}`;
}

function walletLabel(walletId: number | null): { no: number | string | null; name: string; account: string } {
  if (walletId == null) return { no: null, name: '—', account: '—' };
  const w = getWallets().find((x) => x.id === walletId);
  if (!w) return { no: null, name: '—', account: '—' };
  return { no: w.ownerNo, name: w.ownerName, account: w.walletNo };
}

function syntheticTransaction(movement: WalletAccountMovement, wallet: Wallet): Transaction {
  return {
    id: movement.transactionId,
    txNo: `TX-SYN-${Math.abs(movement.transactionId)}`,
    referenceNo: `REF-SYN-${Math.abs(movement.transactionId)}`,
    senderCustomerId: null,
    senderAgentId: null,
    receiverCustomerId: null,
    receiverAgentId: null,
    senderWalletId: movement.direction === 'Outflow' ? movement.walletId : null,
    receiverWalletId: movement.direction === 'Inflow' ? movement.walletId : null,
    senderIban: null,
    receiverIban: null,
    type: movement.direction === 'Inflow' ? 'WalletDeposit' : 'WalletWithdrawal',
    currency: wallet.ccy,
    amount: movement.amount,
    status: 'Completed',
    recordStatus: 1,
    createdAt: movement.createdAt,
  };
}

function resolveCounterparty(
  wallet: Wallet,
  tx: Transaction,
  direction: 'Inflow' | 'Outflow',
): { no: number | string | null; name: string; account: string } {
  if (direction === 'Outflow') {
    if (tx.receiverIban) {
      return { no: null, name: 'Banka Hesabı', account: maskIban(tx.receiverIban) };
    }
    if (tx.receiverWalletId != null) return walletLabel(tx.receiverWalletId);
    if (tx.receiverCustomerId != null) {
      return { no: tx.receiverCustomerId, name: lookupCustomerName(tx.receiverCustomerId), account: '—' };
    }
    if (tx.receiverAgentId != null) {
      return { no: tx.receiverAgentId, name: lookupAgentName(tx.receiverAgentId), account: '—' };
    }
  } else {
    if (tx.senderWalletId != null && tx.senderWalletId !== wallet.id) {
      return walletLabel(tx.senderWalletId);
    }
    if (tx.senderCustomerId != null) {
      const w = getWallets().find((x) => x.customerId === tx.senderCustomerId);
      return {
        no: tx.senderCustomerId,
        name: lookupCustomerName(tx.senderCustomerId),
        account: w?.walletNo ?? '—',
      };
    }
    if (tx.senderAgentId != null) {
      const w = getWallets().find((x) => x.agentId === tx.senderAgentId);
      return {
        no: tx.senderAgentId,
        name: lookupAgentName(tx.senderAgentId),
        account: w?.walletNo ?? '—',
      };
    }
  }
  return { no: null, name: '—', account: '—' };
}

/** Movement + transaction join → liste satırı */
export function buildWalletActivity(
  wallet: Wallet,
  movement: WalletAccountMovement,
  prevBalance: number | null,
): WalletActivity {
  const tx =
    TRANSACTIONS.find((t) => t.id === movement.transactionId && t.recordStatus === 1) ??
    syntheticTransaction(movement, wallet);

  const direction = deriveDirection(movement.direction, prevBalance, movement.postBalance);
  const counterparty = resolveCounterparty(wallet, tx, direction);

  return {
    id: movement.id,
    transactionId: Math.abs(tx.id),
    transactionNo: tx.txNo,
    referenceNo: tx.referenceNo,
    createdAt: movement.createdAt,
    direction,
    counterpartyNo: counterparty.no,
    counterpartyName: counterparty.name,
    counterpartyAccount: counterparty.account,
    senderAgentNo:
      tx.senderAgentId == null
        ? null
        : Number.isFinite(Number(tx.senderAgentId))
          ? Number(tx.senderAgentId)
          : null,
    receiverAgentNo:
      tx.receiverAgentId == null
        ? null
        : Number.isFinite(Number(tx.receiverAgentId))
          ? Number(tx.receiverAgentId)
          : null,
    transactionType: tx.type,
    currency: tx.currency,
    amount: movement.amount,
    postBalance: movement.postBalance,
    status: tx.status,
  };
}
