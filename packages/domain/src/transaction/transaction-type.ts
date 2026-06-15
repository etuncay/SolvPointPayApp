/** Platform geneli işlem türleri — agent, backoffice, ücret tabloları ile hizalı */

export const TRANSACTION_TYPES = [
  'WalletToPerson',
  'InternationalTransfer',
  'WalletToBankAccount',
  'WalletTopUp',
  // Sözlük §5.3 "Tanımlı" kodları (fraud kuralı T-006-2.20 bunlara atıf yapar)
  'AgentWithdrawal',
  'BankWithdrawal',
  'AgentDeposit',
  'WalletToOwnWallet',
  'WalletWithdrawal',
  'WalletDeposit',
  'InternalTransfer',
  'ManualCorrection',
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** Müşteri ücreti (customer_fee) satırlarında kullanılan alt küme */
export const FEE_TRANSACTION_TYPES = [
  'WalletToPerson',
  'InternationalTransfer',
  'WalletToBankAccount',
  'WalletTopUp',
] as const;

export type FeeTransactionType = (typeof FEE_TRANSACTION_TYPES)[number];

export function isFeeTransactionType(type: TransactionType): type is FeeTransactionType {
  return (FEE_TRANSACTION_TYPES as readonly string[]).includes(type);
}
