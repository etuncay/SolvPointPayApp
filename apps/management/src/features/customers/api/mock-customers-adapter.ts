import { CUSTOMERS, type Customer } from '@/mocks/data';
import type {
  CustomerFilters,
  CustomerListItem,
  EntityStatus,
  EntityStatusFilter,
  PrimaryContact,
} from '../domain/types';
import type { CustomersService } from './customers-service';

function normalizeStatus(status: Customer['status']): EntityStatus {
  return status === 'prospect' ? 'active' : (status as EntityStatus);
}

function enrich(raw: (typeof CUSTOMERS)[number], index: number): CustomerListItem {
  const softDeleted = index === 2 || index === 7;
  return {
    ...raw,
    status: normalizeStatus(raw.status),
    recordStatus: softDeleted ? 0 : 1,
    primaryContact: (index % 2 === 0 ? 'email' : 'phone') as PrimaryContact,
  };
}

let store: CustomerListItem[] = CUSTOMERS.map(enrich);

/** Test izolasyonu — store'u başlangıç seed'ine döndürür. */
export function resetCustomersStore(): void {
  store = CUSTOMERS.map(enrich);
}

function applyFilters(filters: CustomerFilters): CustomerListItem[] {
  const q = filters.query.trim().toLocaleLowerCase('tr');
  const col = filters.columns;

  return store.filter((c) => {
    if (c.recordStatus === 0) return false;
    if (filters.status !== 'all' && c.status !== filters.status) return false;

    const adv = filters.advanced;
    if (adv.type !== 'any' && c.type !== adv.type) return false;
    if (adv.kyc !== 'any' && c.kyc !== adv.kyc) return false;
    if (adv.risk !== 'any' && c.riskSeg !== adv.risk) return false;
    if (adv.campaign === '__none__' && c.campaign) return false;
    if (adv.campaign !== 'any' && adv.campaign !== '__none__' && c.campaign !== adv.campaign)
      return false;
    if (adv.from && c.createdAt < adv.from) return false;
    if (adv.to && c.createdAt > adv.to) return false;

    if (col.id && !String(c.id).includes(col.id)) return false;
    if (col.name && !c.name.toLocaleLowerCase('tr').includes(col.name.toLocaleLowerCase('tr')))
      return false;
    if (col.contact) {
      const contact = c.primaryContact === 'email' ? c.email : c.phone;
      if (!contact.toLocaleLowerCase('tr').includes(col.contact.toLocaleLowerCase('tr')))
        return false;
    }
    if (
      col.idNo &&
      !c.idNo.includes(col.idNo) &&
      !c.idKind.toLocaleLowerCase('tr').includes(col.idNo.toLocaleLowerCase('tr'))
    )
      return false;
    if (col.type && c.type !== col.type) return false;
    if (
      col.campaign &&
      !(c.campaign ?? '').toLocaleLowerCase('tr').includes(col.campaign.toLocaleLowerCase('tr'))
    )
      return false;
    if (col.kyc && !c.kyc.toLocaleLowerCase('tr').includes(col.kyc.toLocaleLowerCase('tr')))
      return false;
    if (col.riskScore && !String(c.riskScore).includes(col.riskScore)) return false;
    if (col.riskSeg && c.riskSeg !== col.riskSeg) return false;
    if (col.created && !c.createdAt.includes(col.created)) return false;
    if (col.status && c.status !== col.status) return false;

    if (q) {
      const hay = [c.id, c.name, c.email, c.phone, c.idNo, c.campaign ?? '']
        .join(' ')
        .toLocaleLowerCase('tr');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function computeCounts(): Record<EntityStatusFilter, number> {
  const active = store.filter((c) => c.recordStatus === 1);
  const counts: Record<EntityStatusFilter, number> = {
    active: 0,
    inactive: 0,
    blocked: 0,
    closed: 0,
    all: active.length,
  };
  for (const c of active) {
    counts[c.status] += 1;
  }
  return counts;
}

/** Spec §13/§14 — PII erişim (liste/dışa aktarma) denetim izi (MVP in-memory stub). */
export type CustomerAccessEntry = {
  at: string;
  action: 'list' | 'export';
  status: CustomerFilters['status'];
  query: string;
};

let accessLog: CustomerAccessEntry[] = [];

export function logCustomerAccess(action: CustomerAccessEntry['action'], filters: CustomerFilters): void {
  accessLog = [
    { at: new Date().toISOString(), action, status: filters.status, query: filters.query.trim() },
    ...accessLog,
  ];
}

export function getCustomerAccessLog(): CustomerAccessEntry[] {
  return accessLog;
}

export function resetCustomerAccessLog(): void {
  accessLog = [];
}

export const mockCustomersAdapter: CustomersService = {
  list(filters) {
    const rows = applyFilters(filters);
    logCustomerAccess('list', filters);
    return { rows, total: rows.length, counts: computeCounts() };
  },

  exportRows(filters) {
    return applyFilters(filters);
  },

  softDelete(id) {
    store = store.map((c) => (c.id === id ? { ...c, recordStatus: 0 } : c));
  },

  restoreInactive(id) {
    store = store.map((c) =>
      c.id === id && c.status === 'inactive' ? { ...c, status: 'active' as EntityStatus } : c,
    );
  },
};

/** Bireysel form kaydından müşteri listesine senkron */
export function upsertCustomerFromIndividual(row: Customer) {
  const idx = store.findIndex((c) => c.id === row.id);
  const enriched: CustomerListItem = {
    ...row,
    status: normalizeStatus(row.status),
    recordStatus: 1,
    primaryContact: 'email' as PrimaryContact,
  };
  if (idx >= 0) {
    store = store.map((c, i) => (i === idx ? enriched : c));
  } else {
    store = [...store, enriched];
  }
}

/** Tüzel form kaydından müşteri listesine senkron */
export function upsertCustomerFromCorporate(row: Customer) {
  upsertCustomerFromIndividual(row);
}
