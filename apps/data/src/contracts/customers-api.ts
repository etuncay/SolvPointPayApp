import type { CustomerRecord } from '../types/customer';
import type { PaginatedListResponse } from './api-response';
import type { ListQueryInput } from './list-query';

/**
 * Müşteri REST API yüzeyi — mock (Dexie) ve gerçek HTTP aynı imzayı kullanır.
 * Geçişte yalnızca adapter değişir; UI ve config.api.method aynı kalır.
 */
export interface CustomersApi {
  list(params: ListQueryInput): Promise<PaginatedListResponse>;
  getById(id: string): Promise<CustomerRecord | undefined>;
  create(values: Record<string, unknown>): Promise<CustomerRecord>;
  update(id: string, values: Record<string, unknown>): Promise<CustomerRecord | undefined>;
  delete(id: string): Promise<boolean>;
}
