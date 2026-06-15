import type { TransactionStatus, TransactionType } from '@/features/transaction-confirmation/domain/transaction-types';

/** Temsilcinin işlemdeki paydaşlık rolü (spec §5–6). */
export type AgentRole = 'SenderAgent' | 'ReceiverAgent';

/** İşlem hareketleri listesi satırı — 7.islem-hareketleri.md §5–6 kolonları. */
export interface AgentTransactionRow {
  id: number;
  transactionNo: string;
  createdAt: string;
  senderName: string;
  receiverName: string;
  iban: string | null;
  transactionType: TransactionType;
  currency: string;
  amount: number;
  description: string | null;
  referenceNo: string;
  status: TransactionStatus;
  agentRole: AgentRole;
  /** Temsilcinin elde ettiği gelir (TRY); iade/iptal/hata işlemlerde null → "—". */
  totalRevenueTry: number | null;
}

/** Spec §5 filtreleri (DynamicTable advancedFilters + search ile eşlenir). */
export interface AgentTransactionFilters {
  transactionNo?: string;
  transactionType?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
  sender?: string;
  receiver?: string;
  agentRole?: string;
  search?: string;
  /** DynamicTable sekme filtresi — `Rejected` birden fazla statüyü kapsar. */
  status?: string;
  /** Bugün / tüm tarihler — varsayılan bugün davranışı. */
  dateScope?: 'today' | 'all';
}
