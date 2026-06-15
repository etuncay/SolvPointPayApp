/** Cüzdan limit grupları — backoffice detay ekranı */
export const WALLET_LIMIT_GROUPS = ['Withdrawal', 'Transfer', 'International'] as const;
export type WalletLimitGroup = (typeof WALLET_LIMIT_GROUPS)[number];

export const WALLET_LIMIT_TYPES = [
  'Single',
  'DailyCount',
  'DailyAmount',
  'MonthlyCount',
  'MonthlyAmount',
] as const;
export type WalletLimitType = (typeof WALLET_LIMIT_TYPES)[number];
