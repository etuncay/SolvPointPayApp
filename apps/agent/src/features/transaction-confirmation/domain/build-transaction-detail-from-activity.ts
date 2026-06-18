import type { AgentActivityRecord } from '@epay/data';
import { AGENTS } from '@/mocks/agents';
import { parseCustomerNo } from '@/features/customer-search/domain/format-customer-no';
import { DEMO_AGENT_ID } from '../api/agent-transactions-store';
import type { TransactionDetail, TransactionParty } from './transaction-detail';
import { isTerminalStatus, type TransactionStatus, type TransactionType } from './transaction-types';

function formatActivityTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 19).replace('T', ' ');
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function walletParty(activity: AgentActivityRecord): TransactionParty {
  const agent = AGENTS.find((a) => a.id === DEMO_AGENT_ID);
  return {
    customerNo: null,
    walletNo: activity.walletNo,
    walletId: activity.walletId,
    name: agent?.name ?? activity.walletNo,
    phone: null,
    idNo: null,
    idKind: null,
    city: null,
    iban: null,
    isCorporate: false,
  };
}

function counterpartyParty(activity: AgentActivityRecord): TransactionParty {
  const cpNo = activity.counterpartyNo ? parseCustomerNo(activity.counterpartyNo) : null;
  const acct = activity.counterpartyAccount ?? '';
  return {
    customerNo: cpNo,
    walletNo: acct.startsWith('CZ-') ? acct : null,
    walletId: null,
    name: activity.counterpartyName ?? '—',
    phone: null,
    idNo: null,
    idKind: null,
    city: null,
    iban: acct.startsWith('TR') ? acct : null,
    isCorporate: false,
  };
}

/** Hesap hareketi kaydı → işlem detay projection (onay ekranı fallback). */
export function buildTransactionDetailFromActivity(activity: AgentActivityRecord): TransactionDetail {
  const isInflow = activity.direction === 'Inflow';
  const agent = AGENTS.find((a) => a.id === DEMO_AGENT_ID);
  const status = activity.status as TransactionStatus;
  const feeFixed = Math.max(5, Math.round(activity.amount * 0.01));
  const feeVariable = Math.max(0, Math.round(activity.amount * 0.005));

  return {
    id: activity.transactionId,
    transactionNo: activity.transactionNo,
    referenceNo: activity.referenceNo,
    foreignReferenceNo:
      activity.transactionType === 'InternationalTransfer' ? `FX-${activity.referenceNo}` : null,
    status,
    createdAt: formatActivityTimestamp(activity.createdAt),
    withdrawalDate: formatActivityTimestamp(activity.createdAt).slice(0, 10),
    transactionType: activity.transactionType as TransactionType,
    paymentPurpose: 'Bireysel Transfer',
    description: activity.description ?? `${activity.transactionType} işlemi`,
    sender: isInflow ? counterpartyParty(activity) : walletParty(activity),
    receiver: isInflow ? walletParty(activity) : counterpartyParty(activity),
    senderAuthorized: null,
    receiverAuthorized: null,
    senderAgent: !isInflow && agent ? { id: agent.id, name: agent.name } : null,
    receiverAgent: isInflow && agent ? { id: agent.id, name: agent.name } : null,
    sourceCurrency: activity.currency,
    targetCurrency: activity.currency,
    principalAmount: activity.amount,
    targetAmount: null,
    fxRate: null,
    feeFixed,
    feeVariable,
    notes: [],
    notesDisplay: '',
    documents: [],
    activeBlock: null,
    isTerminal: isTerminalStatus(status),
  };
}
