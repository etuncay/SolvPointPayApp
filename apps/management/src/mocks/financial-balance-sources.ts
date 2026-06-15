import { ACCOUNTING_INTEGRATIONS_SEED } from '@/mocks/accounting-integrations';
import { COMPANY_BANK_ACCOUNTS_SEED } from '@/mocks/company-bank-accounts';
import { getWallets } from '@/lib/wallets-store';
import type { BalanceSources } from '@/features/operational-processes/financial-reconciliation/domain/types';

/** Müşteri cüzdanları TRY kullanılabilir toplamı (plan §8 — envanter) */
export function sumWalletInventoryTry(): number {
  return getWallets().filter((w) => w.cat === 'customer' && w.ccy === 'TRY' && w.recordStatus === 1).reduce(
    (sum, w) => sum + w.available,
    0,
  );
}

/** 8.3 tamamlanmış muhasebe fişleri TRY toplamı (ledger stub) */
export function sumAccountingLedgerTry(): number {
  return ACCOUNTING_INTEGRATIONS_SEED.filter((r) => r.status === 'Completed' && r.currency === 'TRY').reduce(
    (sum, r) => sum + r.amount,
    0,
  );
}

/** 6.2 aktif firma banka hesapları TRY bakiye toplamı */
export function sumBankCustomerBalancesTry(): number {
  return COMPANY_BANK_ACCOUNTS_SEED.filter(
    (a) => a.recordStatus === 1 && a.status === 'Active' && a.currency === 'TRY',
  ).reduce((sum, a) => sum + a.balance, 0);
}

export type BalanceSourceOptions = {
  /** run() demo: kontrollü fark üretir */
  injectMismatch?: boolean;
  /** run() hata senaryosu */
  failSnapshot?: boolean;
};

/** Canlı mock kaynakları — aynı cut-off için tek çağrı */
export function getLiveBalanceSources(options?: BalanceSourceOptions): BalanceSources | null {
  if (options?.failSnapshot) return null;

  const inventoryBalance = round2(sumWalletInventoryTry());
  let accountingBalance = round2(sumAccountingLedgerTry());
  let bankTotalBalance = round2(sumBankCustomerBalancesTry());

  if (options?.injectMismatch) {
    accountingBalance = round2(inventoryBalance + 1_250.5);
    bankTotalBalance = round2(inventoryBalance - 500);
  }

  return { inventoryBalance, accountingBalance, bankTotalBalance };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
