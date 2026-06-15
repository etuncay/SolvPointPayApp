export const WALLET_TYPES = ['CustomerPersistent', 'CustomerTransactional'] as const;
export type WalletType = (typeof WALLET_TYPES)[number];
