import { beforeEach, describe, expect, it } from 'vitest';
import { buildCustomersTableConfig } from './customers-table-config';
import { resetCustomersStore } from './api/mock-customers-adapter';
import type { CustomerListItem } from './domain/types';

function rowsOf(data: Record<string, unknown>[]): CustomerListItem[] {
  return data as unknown as CustomerListItem[];
}

describe('buildCustomersTableConfig binder', () => {
  beforeEach(() => {
    resetCustomersStore();
  });

  it('aktif tab filtresi yalnızca aktif kayıt döndürür + sayaç meta üretir', async () => {
    const config = buildCustomersTableConfig();
    const resp = await config.api.method({
      page: 1,
      pageSize: 100,
      tabFilters: { status: 'active' },
    });
    expect(resp.success).toBe(true);
    expect(rowsOf(resp.data).every((c) => c.status === 'active')).toBe(true);
    expect(resp.meta?.activeCount).toBe(resp.total);
    expect(resp.meta?.allCount).toBeGreaterThanOrEqual(resp.total);
  });

  it('sayfalama page/pageSize ile dilimler', async () => {
    const config = buildCustomersTableConfig();
    const page1 = await config.api.method({ page: 1, pageSize: 5, tabFilters: {} });
    expect(page1.data.length).toBeLessThanOrEqual(5);
    if (page1.total > 5) {
      const page2 = await config.api.method({ page: 2, pageSize: 5, tabFilters: {} });
      expect(page2.data[0]).not.toEqual(page1.data[0]);
    }
  });

  it('id alanına göre azalan sıralama uygular', async () => {
    const config = buildCustomersTableConfig();
    const resp = await config.api.method({
      page: 1,
      pageSize: 100,
      sortField: 'id',
      sortOrder: 'desc',
      tabFilters: {},
    });
    const ids = rowsOf(resp.data).map((c) => c.id);
    const sorted = [...ids].sort((a, b) => b - a);
    expect(ids).toEqual(sorted);
  });

  it('arama headerFilters.search ile filtreler', async () => {
    const config = buildCustomersTableConfig();
    const all = await config.api.method({ page: 1, pageSize: 100, tabFilters: {} });
    const sample = rowsOf(all.data)[0];
    const resp = await config.api.method({
      page: 1,
      pageSize: 100,
      tabFilters: {},
      headerFilters: { search: String(sample.id) },
    });
    expect(rowsOf(resp.data).some((c) => c.id === sample.id)).toBe(true);
  });

  it('müşteri tipi gelişmiş filtresi uygulanır', async () => {
    const config = buildCustomersTableConfig();
    const resp = await config.api.method({
      page: 1,
      pageSize: 100,
      tabFilters: {},
      headerFilters: { type: 'corporate' },
    });
    expect(rowsOf(resp.data).every((c) => c.type === 'corporate')).toBe(true);
  });
});
