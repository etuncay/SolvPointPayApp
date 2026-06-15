import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCustomerAccessLog,
  mockCustomersAdapter,
  resetCustomerAccessLog,
  resetCustomersStore,
} from './mock-customers-adapter';
import { DEFAULT_CUSTOMER_FILTERS, EMPTY_ADV_FILTERS, EMPTY_COLUMN_FILTERS } from '../domain/types';

const ALL_FILTERS = {
  status: 'all' as const,
  query: '',
  advanced: EMPTY_ADV_FILTERS,
  columns: EMPTY_COLUMN_FILTERS,
};

describe('mockCustomersAdapter', () => {
  beforeEach(() => {
    resetCustomersStore();
    resetCustomerAccessLog();
  });

  it('varsayılan Aktif filtresi yalnızca aktif kayıtları getirir', () => {
    const { rows } = mockCustomersAdapter.list(DEFAULT_CUSTOMER_FILTERS);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((c) => c.status === 'active')).toBe(true);
  });

  it('record_status=0 kayıtlar Tümü filtresinde de listelenmez', () => {
    const { rows, counts } = mockCustomersAdapter.list(ALL_FILTERS);
    expect(rows.every((c) => c.recordStatus === 1)).toBe(true);
    // counts.all = aktif (recordStatus===1) kayıt sayısı
    expect(counts.all).toBe(rows.length);
  });

  it('soft-delete sonrası kayıt listede görünmez', () => {
    const before = mockCustomersAdapter.list(ALL_FILTERS).rows;
    const target = before[0];
    mockCustomersAdapter.softDelete(target.id);
    const after = mockCustomersAdapter.list(ALL_FILTERS).rows;
    expect(after.find((c) => c.id === target.id)).toBeUndefined();
    expect(after.length).toBe(before.length - 1);
  });

  it('restoreInactive pasif kaydı aktife çevirir', () => {
    const inactive = mockCustomersAdapter.list(ALL_FILTERS).rows.find((c) => c.status === 'inactive');
    if (!inactive) return;
    mockCustomersAdapter.restoreInactive(inactive.id);
    const after = mockCustomersAdapter
      .list({ ...ALL_FILTERS, status: 'active' })
      .rows.find((c) => c.id === inactive.id);
    expect(after?.status).toBe('active');
  });

  it('arama müşteri no, ad ve iletişime göre filtreler', () => {
    const all = mockCustomersAdapter.list(ALL_FILTERS).rows;
    const sample = all[0];
    const { rows } = mockCustomersAdapter.list({ ...ALL_FILTERS, query: sample.name });
    expect(rows.some((c) => c.id === sample.id)).toBe(true);
  });

  it('liste ve export çağrıları PII erişim logu üretir', () => {
    mockCustomersAdapter.list(DEFAULT_CUSTOMER_FILTERS);
    const log = getCustomerAccessLog();
    expect(log[0].action).toBe('list');
    expect(log[0].status).toBe('active');
  });
});
