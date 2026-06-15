export type BackOfficeWalletCategory = 'customer' | 'agent' | 'system';

/** Agent para çekme ekranı — L1 transactional cüzdan testi */
export type WalletKind = 'CustomerPersistent' | 'CustomerTransactional';

/** Backoffice cüzdan mock satırı — management/agent wallets.ts ile uyumlu */
export type BackOfficeWallet = {
  id: number;
  ownerNo: number | string | null;
  ownerType: string;
  customerId: number | null;
  agentId: number | string | null;
  walletNo: string;
  type: string;
  cat: BackOfficeWalletCategory;
  walletKind?: WalletKind;
  ownerName: string;
  phone: string | null;
  idNo: string | null;
  idKind?: string | null;
  city: string | null;
  balance: number;
  blocked: number;
  ccy: string;
  txToday: number;
  txAmtToday: number;
  createdAt: string;
  available: number;
  recordStatus: 0 | 1;
  blockEndDate?: string | null;
  lastTxAt?: string | null;
  lastTxAmount?: number | null;
};

export type { BackOfficeWalletCategory as WalletCategory };
