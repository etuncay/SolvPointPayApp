import type { AgentActivityRecord } from '../types/account';
import type { ListQueryInput } from '../contracts/list-query';

/** headerFilters anahtarları — DynamicTable arama + gelişmiş filtreler. */
const SEARCH_KEYS: Array<keyof AgentActivityRecord> = [
  'transactionNo',
  'referenceNo',
  'counterpartyName',
  'counterpartyNo',
];

function includesCI(value: unknown, needle: string): boolean {
  return String(value ?? '')
    .toLowerCase()
    .includes(needle);
}

/** Mock sunucu — hesap hareketi filtre/sıralama (gerçek API'de sunucu tarafında). */
export function applyAccountActivityQuery(
  rows: AgentActivityRecord[],
  params: ListQueryInput,
): AgentActivityRecord[] {
  let filtered = [...rows];
  const hf = (params.headerFilters ?? {}) as Record<string, unknown>;

  const search = String(hf.search ?? '').trim().toLowerCase();
  if (search) {
    filtered = filtered.filter((r) => SEARCH_KEYS.some((k) => includesCI(r[k], search)));
  }

  const direction = hf.direction;
  if (direction && direction !== 'any') {
    filtered = filtered.filter((r) => r.direction === direction);
  }

  const txType = hf.transactionType;
  if (txType && txType !== 'any') {
    filtered = filtered.filter((r) => r.transactionType === txType);
  }

  const walletId = hf.walletId;
  if (walletId && walletId !== 'any') {
    filtered = filtered.filter((r) => String(r.walletId) === String(walletId));
  }

  const counterparty = String(hf.counterparty ?? '').trim().toLowerCase();
  if (counterparty) {
    filtered = filtered.filter(
      (r) => includesCI(r.counterpartyName, counterparty) || includesCI(r.counterpartyNo, counterparty),
    );
  }

  const from = String(hf.dateFrom ?? '');
  if (from) {
    const t0 = new Date(from).getTime();
    filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= t0);
  }
  const to = String(hf.dateTo ?? '');
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((r) => new Date(r.createdAt).getTime() <= end.getTime());
  }

  const amountMin = hf.amountMin;
  if (amountMin != null && amountMin !== '') {
    const min = Number(amountMin);
    if (!Number.isNaN(min)) filtered = filtered.filter((r) => r.amount >= min);
  }
  const amountMax = hf.amountMax;
  if (amountMax != null && amountMax !== '') {
    const max = Number(amountMax);
    if (!Number.isNaN(max)) filtered = filtered.filter((r) => r.amount <= max);
  }

  const sortField = params.sortField ?? 'createdAt';
  const dir = params.sortOrder === 'asc' ? 1 : params.sortField ? (params.sortOrder === 'desc' ? -1 : 1) : -1;
  filtered.sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sortField];
    const bv = (b as unknown as Record<string, unknown>)[sortField];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    if (sortField === 'createdAt') {
      return (new Date(String(av)).getTime() - new Date(String(bv)).getTime()) * dir;
    }
    return String(av ?? '').localeCompare(String(bv ?? ''), 'tr') * dir;
  });

  return filtered;
}
