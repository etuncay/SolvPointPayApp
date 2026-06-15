export const TRANSFER_KINDS = ['domestic', 'intl', 'receive'] as const;
export type TransferKind = (typeof TRANSFER_KINDS)[number];
