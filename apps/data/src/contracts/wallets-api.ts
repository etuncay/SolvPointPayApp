import type { BackOfficeWallet } from '../types/mock-wallet';
import type {
  BackOfficeWalletLimit,
  BackOfficeWalletLimitHistory,
  BackOfficeWalletMovement,
  BackOfficeWalletNote,
} from '../types/wallet-detail';

export interface WalletsApi {
  /** Yalnızca recordStatus === 1 */
  list(): Promise<BackOfficeWallet[]>;
  /** Tüm kayıtlar (soft-delete dahil) */
  listAll(): Promise<BackOfficeWallet[]>;
  getById(id: number): Promise<BackOfficeWallet | undefined>;
  upsert(row: BackOfficeWallet): Promise<BackOfficeWallet>;
  /** Mock seed / test reset — tabloyu tamamen değiştirir */
  replaceAll(rows: BackOfficeWallet[]): Promise<void>;

  listNotes(walletId?: number): Promise<BackOfficeWalletNote[]>;
  listLimits(walletId?: number): Promise<BackOfficeWalletLimit[]>;
  listLimitHistory(walletId?: number): Promise<BackOfficeWalletLimitHistory[]>;
  listMovements(walletId?: number): Promise<BackOfficeWalletMovement[]>;
  upsertNote(note: BackOfficeWalletNote): Promise<BackOfficeWalletNote>;
  upsertLimit(limit: BackOfficeWalletLimit): Promise<BackOfficeWalletLimit>;
  appendLimitHistory(entry: BackOfficeWalletLimitHistory): Promise<BackOfficeWalletLimitHistory>;
}
