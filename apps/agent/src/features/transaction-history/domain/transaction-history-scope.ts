/** Sayfa tarih kapsamı — DynamicTable ile paylaşılan mock filtre durumu. */
export type TransactionHistoryDateScope = 'today' | 'all';

let dateScope: TransactionHistoryDateScope = 'today';

export function getTransactionHistoryDateScope(): TransactionHistoryDateScope {
  return dateScope;
}

export function setTransactionHistoryDateScope(scope: TransactionHistoryDateScope): void {
  dateScope = scope;
}
