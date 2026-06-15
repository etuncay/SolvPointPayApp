import type { AccountsApi } from '../../contracts/accounts-api';
import type { PaginatedListResponse } from '../../contracts/api-response';
import type { ListQueryInput } from '../../contracts/list-query';
import type { AgentBalanceRow } from '../../types/account';
import { getDb } from '../../db/dexie';
import { ensureAgentAccountsSeeded } from '../../db/seed-accounts';
import { applyAccountActivityQuery } from '../../domain/account-activity-query';
import { simulateNetworkLatency } from './latency';

/** IndexedDB (Dexie) — temsilci hesap mock backend implementasyonu. */
export function createDexieAccountsAdapter(): AccountsApi {
  return {
    async listBalances(): Promise<AgentBalanceRow[]> {
      await ensureAgentAccountsSeeded();
      await simulateNetworkLatency();
      return getDb().agentBalances.toArray();
    },

    async listActivities(params: ListQueryInput): Promise<PaginatedListResponse> {
      await ensureAgentAccountsSeeded();
      await simulateNetworkLatency();

      const all = await getDb().agentActivities.toArray();
      const filtered = applyAccountActivityQuery(all, params);
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
        meta: { page, pageSize, count: total, totalPages },
      };
    },
  };
}
