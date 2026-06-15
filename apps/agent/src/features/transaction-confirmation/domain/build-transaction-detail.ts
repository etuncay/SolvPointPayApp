import { CUSTOMERS } from '@/mocks/data';
import { AGENTS } from '@/mocks/agents';
import { maskIban, type Transaction } from '@/mocks/transactions';
import { getWallets } from '@/lib/wallets-store';
import type {
  TransactionAgentInfo,
  TransactionAuthorizedPerson,
  TransactionDetail,
  TransactionDocument,
  TransactionNote,
  TransactionParty,
} from './transaction-detail';
import { isTerminalStatus } from './transaction-types';

const IBAN_TYPES = new Set(['WalletToBankAccount', 'InternationalTransfer']);

function customer(id: number | null) {
  if (id == null) return null;
  return CUSTOMERS.find((c) => c.id === id) ?? null;
}

function agent(id: number | string | null): TransactionAgentInfo | null {
  if (id == null) return null;
  const a = AGENTS.find((x) => x.id === id);
  return a ? { id: a.id, name: a.name } : null;
}

function buildParty(
  customerId: number | null,
  agentId: number | string | null,
  walletId: number | null,
  iban: string | null,
  txType: Transaction['type'],
): TransactionParty {
  const c = customer(customerId);
  const w = walletId != null ? getWallets().find((x) => x.id === walletId) : null;
  const a = agent(agentId);
  const showIban = IBAN_TYPES.has(txType) && iban;

  return {
    customerNo: customerId,
    walletNo: w?.walletNo ?? null,
    walletId,
    name: c?.name ?? a?.name ?? w?.ownerName ?? '—',
    phone: c?.phone ?? w?.phone ?? null,
    idNo: c?.idNo ?? w?.idNo ?? null,
    idKind: c?.idKind ?? w?.idKind ?? null,
    city: c?.city ?? w?.city ?? null,
    iban: showIban ? maskIban(iban!) : null,
    isCorporate: c?.type === 'corporate',
  };
}

function authorizedPerson(customerId: number | null): TransactionAuthorizedPerson | null {
  const c = customer(customerId);
  if (!c || c.type !== 'corporate') return null;
  return {
    name: 'Yetkili Kişi — ' + c.name.split(' ')[0],
    title: 'Genel Müdür',
    phone: c.phone,
  };
}

function enrichTx(tx: Transaction): Transaction {
  const feeFixed = tx.feeFixed ?? Math.max(5, Math.round(tx.amount * 0.01));
  const feeVariable = tx.feeVariable ?? Math.max(0, Math.round(tx.amount * 0.005));
  const targetCurrency = tx.targetCurrency ?? tx.currency;
  const fxRate = tx.fxRate ?? (targetCurrency !== tx.currency ? 34.5 : null);
  const targetAmount =
    tx.targetAmount ?? (fxRate ? Math.round(tx.amount / fxRate) : tx.amount);

  return {
    ...tx,
    foreignReferenceNo:
      tx.foreignReferenceNo ??
      (tx.type === 'InternationalTransfer' ? `FX-${tx.referenceNo}` : null),
    feeFixed,
    feeVariable,
    fxRate,
    targetAmount,
    targetCurrency,
    paymentPurpose: tx.paymentPurpose ?? 'Bireysel Transfer',
    description: tx.description ?? `${tx.type} işlemi`,
    withdrawalDate: tx.withdrawalDate ?? tx.createdAt.slice(0, 10),
  };
}

/** Transaction + ilişkili mock → detay projection */
export function buildTransactionDetail(
  tx: Transaction,
  notes: TransactionNote[],
  documents: TransactionDocument[],
  activeBlock: TransactionDetail['activeBlock'],
): TransactionDetail {
  const enriched = enrichTx(tx);
  const sortedNotes = [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    id: enriched.id,
    transactionNo: enriched.txNo,
    referenceNo: enriched.referenceNo,
    foreignReferenceNo: enriched.foreignReferenceNo ?? null,
    status: enriched.status,
    createdAt: enriched.createdAt,
    withdrawalDate: enriched.withdrawalDate ?? null,
    transactionType: enriched.type,
    paymentPurpose: enriched.paymentPurpose ?? null,
    description: enriched.description ?? null,
    sender: buildParty(
      enriched.senderCustomerId,
      enriched.senderAgentId,
      enriched.senderWalletId,
      enriched.senderIban,
      enriched.type,
    ),
    receiver: buildParty(
      enriched.receiverCustomerId,
      enriched.receiverAgentId,
      enriched.receiverWalletId,
      enriched.receiverIban,
      enriched.type,
    ),
    senderAuthorized: authorizedPerson(enriched.senderCustomerId),
    receiverAuthorized: authorizedPerson(enriched.receiverCustomerId),
    senderAgent: agent(enriched.senderAgentId),
    receiverAgent: agent(enriched.receiverAgentId),
    sourceCurrency: enriched.currency,
    targetCurrency: enriched.targetCurrency ?? enriched.currency,
    principalAmount: enriched.amount,
    targetAmount: enriched.targetAmount ?? null,
    fxRate: enriched.fxRate ?? null,
    feeFixed: enriched.feeFixed ?? 0,
    feeVariable: enriched.feeVariable ?? 0,
    notes: sortedNotes,
    notesDisplay: sortedNotes.map((n) => n.formatted).join('\n'),
    documents,
    activeBlock,
    isTerminal: isTerminalStatus(enriched.status),
  };
}
