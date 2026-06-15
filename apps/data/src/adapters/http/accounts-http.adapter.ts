import type { AccountsApi } from '../../contracts/accounts-api';
import type { PaginatedListResponse } from '../../contracts/api-response';
import type { ListQueryInput } from '../../contracts/list-query';
import type { AgentBalanceRow } from '../../types/account';

function buildQuery(params: ListQueryInput): string {
  const q = new URLSearchParams();
  q.set('page', String(params.page));
  q.set('pageSize', String(params.pageSize));
  if (params.sortField) q.set('sortField', params.sortField);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  for (const [k, v] of Object.entries(params.headerFilters ?? {})) {
    if (v != null && v !== '') q.set(`headerFilter_${k}`, String(v));
  }
  return q.toString();
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Gerçek backend adapter iskeleti.
 * Uçlar (.NET API) proje sözleşmesine göre güncellenir.
 */
export function createHttpAccountsAdapter(baseUrl: string): AccountsApi {
  const root = baseUrl.replace(/\/$/, '');

  return {
    async listBalances(): Promise<AgentBalanceRow[]> {
      const res = await fetch(`${root}/agent/accounts`, { credentials: 'include' });
      const body = await parseJson<{ data?: AgentBalanceRow[] } | AgentBalanceRow[]>(res);
      return Array.isArray(body) ? body : (body.data ?? []);
    },

    async listActivities(params: ListQueryInput): Promise<PaginatedListResponse> {
      const res = await fetch(`${root}/agent/accounts/activities?${buildQuery(params)}`, {
        credentials: 'include',
      });
      return parseJson(res);
    },
  };
}
