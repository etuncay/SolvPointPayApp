import type { CustomersApi } from '../../contracts/customers-api';
import type { PaginatedListResponse } from '../../contracts/api-response';
import type { ListQueryInput } from '../../contracts/list-query';
import type { CustomerRecord } from '../../types/customer';

function buildQuery(params: ListQueryInput): string {
  const q = new URLSearchParams();
  q.set('page', String(params.page));
  q.set('pageSize', String(params.pageSize));
  if (params.sortField) q.set('sortField', params.sortField);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  for (const [k, v] of Object.entries(params.filters ?? {})) {
    if (v != null && v !== '') q.set(`filter_${k}`, String(v));
  }
  for (const [k, v] of Object.entries(params.headerFilters ?? {})) {
    if (v != null && v !== '') q.set(`headerFilter_${k}`, String(v));
  }
  for (const [k, v] of Object.entries(params.tabFilters ?? {})) {
    if (v != null && v !== '') q.set(`tabFilter_${k}`, String(v));
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
 * baseUrl örn. https://api.example.com — uçlar proje API sözleşmesine göre güncellenir.
 */
export function createHttpCustomersAdapter(baseUrl: string): CustomersApi {
  const root = baseUrl.replace(/\/$/, '');

  return {
    async list(params: ListQueryInput): Promise<PaginatedListResponse> {
      const res = await fetch(`${root}/customers?${buildQuery(params)}`, {
        credentials: 'include',
      });
      return parseJson(res);
    },

    async getById(id: string): Promise<CustomerRecord | undefined> {
      const res = await fetch(`${root}/customers/${encodeURIComponent(id)}`, {
        credentials: 'include',
      });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data?: CustomerRecord } | CustomerRecord>(res);
      return 'data' in body && body.data ? body.data : (body as CustomerRecord);
    },

    async create(values: Record<string, unknown>): Promise<CustomerRecord> {
      const res = await fetch(`${root}/customers`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const body = await parseJson<{ data: CustomerRecord }>(res);
      return body.data;
    },

    async update(id: string, values: Record<string, unknown>): Promise<CustomerRecord | undefined> {
      const res = await fetch(`${root}/customers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.status === 404) return undefined;
      const body = await parseJson<{ data: CustomerRecord }>(res);
      return body.data;
    },

    async delete(id: string): Promise<boolean> {
      const res = await fetch(`${root}/customers/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 404) return false;
      if (!res.ok) {
        await parseJson(res);
        return false;
      }
      return true;
    },
  };
}
