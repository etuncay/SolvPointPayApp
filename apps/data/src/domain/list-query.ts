import type { CustomerRecord } from '../types/customer';
import type { ListQueryInput } from '../contracts/list-query';

const SEARCH_KEYS = ['id', 'name', 'email', 'phone'] as const;

/** Mock sunucu — filtre/sıralama (gerçek API'de sunucu tarafında yapılır) */
export function applyListQuery(rows: CustomerRecord[], params: ListQueryInput): CustomerRecord[] {
  let filtered = [...rows];

  if (params.tabFilters) {
    for (const [key, val] of Object.entries(params.tabFilters)) {
      if (val != null && val !== '') {
        filtered = filtered.filter((r) => (r as unknown as Record<string, unknown>)[key] === val);
      }
    }
  }

  if (params.headerFilters) {
    for (const [key, val] of Object.entries(params.headerFilters)) {
      if (key === 'search' || val == null || val === '' || val === 'any') continue;
      filtered = filtered.filter((r) => {
        const cell = String((r as unknown as Record<string, unknown>)[key] ?? '').toLowerCase();
        return cell.includes(String(val).toLowerCase());
      });
    }
    const q = String(params.headerFilters.search ?? '').trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((r) =>
        SEARCH_KEYS.some((k) =>
          String((r as unknown as Record<string, unknown>)[k] ?? '')
            .toLowerCase()
            .includes(q),
        ),
      );
    }
    const from = String(params.headerFilters.createdFrom ?? '');
    const to = String(params.headerFilters.createdTo ?? '');
    if (from) {
      const t0 = new Date(from).getTime();
      filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= t0);
    }
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt).getTime() <= end.getTime());
    }
  }

  if (params.filters) {
    for (const [key, val] of Object.entries(params.filters)) {
      if (val != null && val !== '') {
        filtered = filtered.filter((r) => {
          const cell = String((r as unknown as Record<string, unknown>)[key] ?? '').toLowerCase();
          return cell.includes(String(val).toLowerCase());
        });
      }
    }
  }

  if (params.sortField) {
    const dir = params.sortOrder === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[params.sortField!];
      const bv = (b as unknown as Record<string, unknown>)[params.sortField!];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? ''), 'tr') * dir;
    });
  }

  return filtered;
}

export function buildTabCounts(rows: CustomerRecord[]): Record<string, number> {
  return {
    allCount: rows.length,
    activeCount: rows.filter((r) => r.status === 'Active').length,
    passiveCount: rows.filter((r) => r.status === 'Passive').length,
    blockedCount: rows.filter((r) => r.status === 'Blocked').length,
    pendingCount: rows.filter((r) => r.status === 'Pending').length,
  };
}
