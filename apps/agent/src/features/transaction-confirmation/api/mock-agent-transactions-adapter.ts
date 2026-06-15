import { generateAgentActivities } from '@epay/data';
import { buildTransactionDetail } from '../domain/build-transaction-detail';
import { buildTransactionDetailFromActivity } from '../domain/build-transaction-detail-from-activity';
import type { Transaction } from '@/mocks/transactions';
import { isCriticalRisk } from '../domain/confirmation-mode';
import { isTerminalStatus } from '../domain/transaction-types';
import type {
  AgentReceiptRow,
  AgentTransactionSeed,
  ApproveInput,
  ApproveResult,
  ConfirmationView,
  PendingCustomerRow,
  PendingTransactionRow,
} from '../domain/types';
import { agentTransactionsStore, DEMO_AGENT_ID } from './agent-transactions-store';



const OTP_PATTERN = /^\d{6}$/;

/** @epay/data hesap hareketleri seed'i ile hizalı — store'da yoksa detay fallback. */
const ACTIVITY_BY_TX_ID = new Map(generateAgentActivities().map((a) => [a.transactionId, a]));

function buildDetail(tx: Transaction) {
  return buildTransactionDetail(tx, [], [], null);
}

function resolveAgentRole(tx: Transaction): ConfirmationView['agentRole'] {
  if (tx.senderAgentId === DEMO_AGENT_ID) return 'Sender';
  if (tx.receiverAgentId === DEMO_AGENT_ID) return 'Receiver';
  return null;
}

export const mockAgentTransactionsAdapter = {
  getConfirmation(id: number): ConfirmationView | null {
    const tx = agentTransactionsStore.get(id);
    if (tx) {
      const detail = buildDetail(tx);
      return {
        id: tx.id,
        detail,
        requiresAuthority: Boolean(detail.senderAuthorized || detail.receiverAuthorized),
        isCritical: isCriticalRisk(detail),
        hasReceipt: agentTransactionsStore.hasReceipt(id),
        agentRole: resolveAgentRole(tx),
      };
    }

    const activity = ACTIVITY_BY_TX_ID.get(id);
    if (!activity) return null;
    const detail = buildTransactionDetailFromActivity(activity);
    const isInflow = activity.direction === 'Inflow';
    return {
      id,
      detail,
      requiresAuthority: false,
      isCritical: isCriticalRisk(detail),
      hasReceipt: isTerminalStatus(detail.status),
      agentRole: isInflow ? 'Receiver' : 'Sender',
    };
  },

  approve(id: number, input: ApproveInput): ApproveResult {
    const tx = agentTransactionsStore.get(id);
    if (!tx) return { ok: false, error: 'ag_cf_err_not_found' };
    if (tx.status !== 'Pending') return { ok: false, error: 'ag_cf_err_state' };

    if (!OTP_PATTERN.test(input.otp)) return { ok: false, error: 'ag_cf_err_otp' };

    const detail = buildDetail(tx);
    const needsAuthority = Boolean(detail.senderAuthorized || detail.receiverAuthorized);
    const { identityChecked, photoMatched, authorityChecked, noSuspicion } = input.checks;
    if (!identityChecked || !photoMatched || !noSuspicion || (needsAuthority && !authorityChecked)) {
      return { ok: false, error: 'ag_cf_err_checks' };
    }

    if (isCriticalRisk(detail)) {
      const d = input.declaration;
      if (!d || !d.relation.trim()) return { ok: false, error: 'ag_cf_err_declaration' };
      if ((d.reason === 'Other' || d.reason === 'Unknown') && !d.note.trim()) {
        return { ok: false, error: 'ag_cf_err_declaration_note' };
      }
    }

    agentTransactionsStore.recordApproval(id, input.checks, input.declaration);
    return { ok: true };
  },

  cancel(id: number): ApproveResult {
    const tx = agentTransactionsStore.get(id);
    if (!tx) return { ok: false, error: 'ag_cf_err_not_found' };
    if (tx.status !== 'Pending' && tx.status !== 'OnHold') {
      return { ok: false, error: 'ag_cf_err_state' };
    }
    agentTransactionsStore.recordCancel(id);
    return { ok: true };
  },

  markReceiptPrinted(id: number): void {
    agentTransactionsStore.markReceiptGenerated(id);
  },

  uploadSignedReceipt(id: number, fileName: string): ApproveResult {
    const tx = agentTransactionsStore.get(id);
    if (!tx) return { ok: false, error: 'ag_cf_err_not_found' };
    if (agentTransactionsStore.signedReceiptName(id)) {
      return { ok: false, error: 'ag_sr_err_duplicate' };
    }
    agentTransactionsStore.attachSignedReceipt(id, fileName);
    return { ok: true };
  },

  listPendingTransactions(): PendingTransactionRow[] {
    return agentTransactionsStore
      .list()
      .filter((tx) => tx.status === 'Pending' && agentTransactionsStore.isAgentScoped(tx))
      .map((tx) => {
        const detail = buildDetail(tx);
        return {
          id: tx.id,
          transactionNo: detail.transactionNo,
          createdAt: detail.createdAt,
          senderName: detail.sender.name,
          receiverName: detail.receiver.name,
          iban: detail.receiver.iban ?? detail.sender.iban,
          transactionType: detail.transactionType,
          amount: detail.principalAmount,
          currency: detail.sourceCurrency,
          description: detail.description,
          referenceNo: detail.referenceNo,
          status: detail.status,
        };
      });
  },

  listPendingCustomers(): PendingCustomerRow[] {
    return agentTransactionsStore.listPendingCustomers();
  },

  listAgentReceipts(): AgentReceiptRow[] {
    return agentTransactionsStore
      .list()
      .filter((tx) => agentTransactionsStore.hasReceipt(tx.id))
      .map((tx) => ({
        transactionId: tx.id,
        transactionNo: tx.txNo,
        date: tx.createdAt,
        amount: tx.amount,
        currency: tx.currency,
      }));
  },

  /** Günlük grafik agregasyonu için ham kayıtlar (başarılı=terminal Completed/Sent). */
  listDailyActivity(): AgentTransactionSeed[] {
    return agentTransactionsStore
      .list()
      .filter((tx) => agentTransactionsStore.isAgentScoped(tx))
      .map((tx) => ({
        createdAt: tx.createdAt,
        amount: tx.amount,
        success: tx.status === 'Completed' || tx.status === 'Sent',
      }));
  },
};

export type AgentTransactionsService = typeof mockAgentTransactionsAdapter;
