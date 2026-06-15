import type { CustomersApi } from '../../contracts/customers-api';
import type { PaginatedListResponse } from '../../contracts/api-response';
import type { ListQueryInput } from '../../contracts/list-query';
import type { CustomerRecord } from '../../types/customer';
import { getDb } from '../../db/dexie';
import { ensurePlaygroundCustomersSeeded } from '../../db/seed';
import { applyListQuery, buildTabCounts } from '../../domain/list-query';
import { formValuesToRecord } from '../../domain/customer-mapper';
import { simulateNetworkLatency } from './latency';

async function nextCustomerId(): Promise<string> {
  const db = getDb();
  const meta = await db.meta.get('nextCustomerId');
  const next = meta?.value ?? 10001;
  await db.meta.put({ key: 'nextCustomerId', value: next + 1 });
  return String(next);
}

/** IndexedDB (Dexie) — mock backend implementasyonu */
export function createDexieCustomersAdapter(): CustomersApi {
  return {
    async list(params: ListQueryInput): Promise<PaginatedListResponse> {
      await ensurePlaygroundCustomersSeeded();
      await simulateNetworkLatency();

      const db = getDb();
      const all = await db.customers.toArray();
      const filtered = applyListQuery(all, params);
      const total = filtered.length;
      const pageSize = params.pageSize ?? 15;
      const page = Math.max(1, params.page ?? 1);
      const start = (page - 1) * pageSize;
      const pageRows = filtered.slice(start, start + pageSize);
      const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

      return {
        data: pageRows as unknown as Record<string, unknown>[],
        total,
        success: true,
        meta: {
          page,
          pageSize,
          count: total,
          totalPages,
          ...buildTabCounts(all),
        },
      };
    },

    async getById(id: string): Promise<CustomerRecord | undefined> {
      await ensurePlaygroundCustomersSeeded();
      await simulateNetworkLatency();
      return getDb().customers.get(id);
    },

    async create(values: Record<string, unknown>): Promise<CustomerRecord> {
      await ensurePlaygroundCustomersSeeded();
      const id = await nextCustomerId();
      const row = formValuesToRecord(id, values, { isNew: true });
      await getDb().customers.put(row);
      return row;
    },

    async update(id: string, values: Record<string, unknown>): Promise<CustomerRecord | undefined> {
      await ensurePlaygroundCustomersSeeded();
      const existing = await getDb().customers.get(id);
      if (!existing) return undefined;
      const row = formValuesToRecord(id, values, { existing });
      await getDb().customers.put(row);
      return row;
    },

    async delete(id: string): Promise<boolean> {
      await ensurePlaygroundCustomersSeeded();
      const existing = await getDb().customers.get(id);
      if (!existing) return false;
      await getDb().customers.delete(id);
      return true;
    },
  };
}
