import type { WalletLimitSet } from './detail-types';

/** WalletLimitSet → onay modalı flat alan haritası (w_/t_/i_ prefix). */
export function walletLimitsToFlat(limits: WalletLimitSet): Record<string, unknown> {
  return {
    w_Single: limits.Withdrawal.Single,
    w_DailyCount: limits.Withdrawal.DailyCount,
    w_DailyAmount: limits.Withdrawal.DailyAmount,
    w_MonthlyCount: limits.Withdrawal.MonthlyCount,
    w_MonthlyAmount: limits.Withdrawal.MonthlyAmount,
    t_Single: limits.Transfer.Single,
    t_DailyCount: limits.Transfer.DailyCount,
    t_DailyAmount: limits.Transfer.DailyAmount,
    t_MonthlyCount: limits.Transfer.MonthlyCount,
    t_MonthlyAmount: limits.Transfer.MonthlyAmount,
    i_Single: limits.International.Single,
    i_DailyCount: limits.International.DailyCount,
    i_DailyAmount: limits.International.DailyAmount,
    i_MonthlyCount: limits.International.MonthlyCount,
    i_MonthlyAmount: limits.International.MonthlyAmount,
  };
}
