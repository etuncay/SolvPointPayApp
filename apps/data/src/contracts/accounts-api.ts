import type { AgentBalanceRow } from '../types/account';
import type { PaginatedListResponse } from './api-response';
import type { ListQueryInput } from './list-query';

/**
 * Temsilci hesap API yüzeyi — mock (Dexie) ve gerçek HTTP aynı imzayı kullanır.
 * Geçişte yalnızca adapter değişir; UI ve config.api.method aynı kalır.
 */
export interface AccountsApi {
  /** Bakiye paneli — temsilci avans + komisyon cüzdanları. */
  listBalances(): Promise<AgentBalanceRow[]>;
  /** Hesap hareketleri — server-side filtre/sıralama/sayfalama. */
  listActivities(params: ListQueryInput): Promise<PaginatedListResponse>;
}
