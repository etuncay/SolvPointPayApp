import type { BackOfficeTransaction } from '../types/transaction';
import type {
  BackOfficeTransactionBlock,
  BackOfficeTransactionDocument,
  BackOfficeTransactionNote,
} from '../types/transaction-detail';

export interface TransactionsApi {
  /** Yalnızca recordStatus === 1 */
  list(): Promise<BackOfficeTransaction[]>;
  /** Tüm kayıtlar (soft-delete dahil) */
  listAll(): Promise<BackOfficeTransaction[]>;
  getById(id: number): Promise<BackOfficeTransaction | undefined>;
  update(
    id: number,
    patch: Partial<Pick<BackOfficeTransaction, 'status'>>,
  ): Promise<BackOfficeTransaction | undefined>;
  upsert(row: BackOfficeTransaction): Promise<BackOfficeTransaction>;
  /** Mock seed / test reset — tabloyu tamamen değiştirir */
  replaceAll(rows: BackOfficeTransaction[]): Promise<void>;

  listNotes(transactionId?: number): Promise<BackOfficeTransactionNote[]>;
  listDocuments(transactionId?: number): Promise<BackOfficeTransactionDocument[]>;
  listBlocks(transactionId?: number): Promise<BackOfficeTransactionBlock[]>;
  getActiveBlock(transactionId: number): Promise<BackOfficeTransactionBlock | undefined>;
  upsertNote(note: BackOfficeTransactionNote): Promise<BackOfficeTransactionNote>;
  upsertBlock(block: BackOfficeTransactionBlock): Promise<BackOfficeTransactionBlock>;
}
