import { mockTransactionHistoryAdapter, type TransactionHistoryService } from './mock-transaction-history-adapter';

/** Gerçek API bağlandığında burada adapter değiştirilir. */
export const transactionHistoryService: TransactionHistoryService = mockTransactionHistoryAdapter;

export type { TransactionHistoryService };
