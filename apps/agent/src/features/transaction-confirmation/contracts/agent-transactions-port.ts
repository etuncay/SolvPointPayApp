import type {
  AgentReceiptRow,
  AgentTransactionSeed,
  ApproveInput,
  ApproveResult,
  ConfirmationView,
  PendingCustomerRow,
  PendingTransactionRow,
} from '../domain/types';

/** Temsilci işlem onayı / detay / dekont — OTP doğrulama ayrı port üzerinden. */
export interface AgentTransactionsPort {
  getConfirmation(id: number): ConfirmationView | null;
  approve(id: number, input: ApproveInput): Promise<ApproveResult>;
  cancel(id: number): ApproveResult;
  markReceiptPrinted(id: number): void;
  uploadSignedReceipt(id: number, fileName: string): ApproveResult;
  listPendingTransactions(): PendingTransactionRow[];
  listPendingCustomers(): PendingCustomerRow[];
  listAgentReceipts(): AgentReceiptRow[];
  listDailyActivity(): AgentTransactionSeed[];
}
