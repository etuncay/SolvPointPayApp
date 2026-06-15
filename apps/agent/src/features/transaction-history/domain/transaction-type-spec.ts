import type { TransactionType } from '@/features/transaction-confirmation/domain/transaction-types';

/** Referans txn-history — menü alt akış numaraları (6.1–6.4, 5). */
export function transactionTypeSpec(type: TransactionType): { no: string; labelKey: string } {
  switch (type) {
    case 'WalletTopUp':
    case 'WalletDeposit':
    case 'InternalTransfer':
      return { no: '6.1', labelKey: 'ag_tx_hist_type_own' };
    case 'WalletToBankAccount':
      return { no: '6.2', labelKey: 'ag_tx_hist_type_bank' };
    case 'WalletToPerson':
      return { no: '6.3', labelKey: 'ag_tx_hist_type_person' };
    case 'InternationalTransfer':
      return { no: '6.4', labelKey: 'ag_tx_hist_type_abroad' };
    case 'WalletWithdrawal':
      return { no: '5', labelKey: 'ag_tx_hist_type_withdraw' };
    default:
      return { no: '—', labelKey: `wa_tx_${type}` };
  }
}

export function isCorporatePartyName(name: string): boolean {
  return /A\.Ş\.|Ltd\.|Şti\.|Koop\.|Üretim|İnşaat|Lojistik/i.test(name);
}
