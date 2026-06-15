import type { BalanceSources, FinReconStatus, FinancialReconciliation } from './types';

export function buildFinancialReconciliationSnapshot(
  asOf: Date,
  sources: BalanceSources,
  toleranceTry = 0.01,
): Omit<FinancialReconciliation, 'id' | 'description' | 'createdAt'> {
  const inventoryBalance = sources.inventoryBalance;
  const accountingBalance = sources.accountingBalance;
  const bankTotalBalance = sources.bankTotalBalance;
  const diffInventoryAccounting = round2(inventoryBalance - accountingBalance);
  const diffInventoryBank = round2(inventoryBalance - bankTotalBalance);
  const status = resolveStatus(diffInventoryAccounting, diffInventoryBank, toleranceTry);

  return {
    asOfTimestamp: formatAsOf(asOf),
    inventoryBalance,
    accountingBalance,
    bankTotalBalance,
    diffInventoryAccounting,
    diffInventoryBank,
    status,
  };
}

export function resolveStatus(
  diffInventoryAccounting: number,
  diffInventoryBank: number,
  toleranceTry: number,
): FinReconStatus {
  if (
    Math.abs(diffInventoryAccounting) <= toleranceTry &&
    Math.abs(diffInventoryBank) <= toleranceTry
  ) {
    return 'Matched';
  }
  return 'PendingReview';
}

function formatAsOf(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
