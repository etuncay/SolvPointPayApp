export interface TopUpWalletOption {
  walletId: number;
  walletNo: string;
  currency: string;
  available: number;
}

export interface OwnWalletFormState {
  fullName?: string;
  authorizedPersonIdNo?: string;
  currency: string;
  amount: number;
  walletNo: string;
  walletId?: number;
  clientReference: string;
  isSuspicious: boolean;
}

export interface OwnWalletSubmitPayload {
  variant: 'ownWallet';
  senderCustomerId: number;
  currency: string;
  amount: number;
  targetWalletId: number;
  suspiciousFlag: boolean;
  clientReference: string;
  authorizedPersonIdNo?: string;
  screenIdNo: string;
  screenName: string;
}

export type OwnWalletSubmitResult =
  | { ok: true; transactionId: number; status: 'Pending' | 'OnHold'; sanctionHit: boolean }
  | {
      ok: false;
      code: 'DUPLICATE' | 'KYC_BLOCKED' | 'INVALID_WALLET';
      message: string;
    };
