import { isCriticalRisk } from '../domain/confirmation-mode';
import type { AgentTransactionsPort } from '../contracts/agent-transactions-port';
import type {
  AgentReceiptRow,
  AgentTransactionSeed,
  ApproveInput,
  ApproveResult,
  ConfirmationView,
  PendingCustomerRow,
  PendingTransactionRow,
} from '../domain/types';
import { mapTransactionApprovalOtpError } from '../domain/map-otp-error';
import { resolveAgentTransaction } from '../domain/resolve-agent-transaction';
import { buildTransactionDetail } from '../domain/build-transaction-detail';
import { agentTransactionsStore } from './agent-transactions-store';
import { transactionApprovalOtpApi } from './transaction-approval-otp.service';

function toConfirmationView(resolved: NonNullable<ReturnType<typeof resolveAgentTransaction>>): ConfirmationView {
  const { detail, agentRole, hasReceipt, storeBacked } = resolved;
  return {
    id: detail.id,
    detail,
    requiresAuthority: storeBacked && Boolean(detail.senderAuthorized || detail.receiverAuthorized),
    isCritical: isCriticalRisk(detail),
    hasReceipt,
    agentRole,
    storeBacked,
  };
}

export const mockAgentTransactionsAdapter: AgentTransactionsPort = {
  getConfirmation(id: number): ConfirmationView | null {
    const resolved = resolveAgentTransaction(id);
    if (!resolved) return null;
    return toConfirmationView(resolved);
  },

  async approve(id: number, input: ApproveInput): Promise<ApproveResult> {
    const tx = agentTransactionsStore.get(id);
    if (!tx) return { ok: false, error: 'ag_cf_err_not_found' };
    if (tx.status !== 'Pending') return { ok: false, error: 'ag_cf_err_state' };

    const otpResult = await transactionApprovalOtpApi.verifyOtp({
      transactionId: id,
      otp: input.otp,
    });
    if (!otpResult.ok) {
      return { ok: false, error: mapTransactionApprovalOtpError(otpResult.error) };
    }

    const detail = buildTransactionDetail(tx, [], [], null);
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
    if (!agentTransactionsStore.get(id)) return;
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
        const detail = buildTransactionDetail(tx, [], [], null);
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

export type AgentTransactionsService = AgentTransactionsPort;
