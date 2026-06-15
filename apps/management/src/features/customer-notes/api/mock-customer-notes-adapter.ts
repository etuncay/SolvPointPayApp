import { CUSTOMERS } from '@/mocks/data';
import { CUSTOMER_NOTES, type CustomerNoteRow } from '@/mocks/customer-notes';
import type { CustomerNotesService } from './customer-notes-service';
import type { CustomerNote, CustomerNoteInput, NoteFilters, SaveNoteResult } from '../domain/types';
import { validateCustomerNoteInput } from '../domain/validation';

let store: CustomerNoteRow[] = [...CUSTOMER_NOTES];
let nextId = 100;

/** Spec §14 — not ekleme/güncelleme/silme denetim izi (MVP in-memory stub) */
export type CustomerNoteAuditEntry = {
  at: string;
  action: 'create' | 'update' | 'delete';
  noteId: number;
  customerNo: string;
};

let auditLog: CustomerNoteAuditEntry[] = [];

function logNoteChange(action: CustomerNoteAuditEntry['action'], noteId: number, customerNo: string): void {
  auditLog = [{ at: new Date().toISOString(), action, noteId, customerNo }, ...auditLog];
}

export function getCustomerNotesAuditLog(): CustomerNoteAuditEntry[] {
  return auditLog;
}

export function resetCustomerNotesAuditLog(): void {
  auditLog = [];
}

/** Test izolasyonu — store ve sayaç başlangıç seed'ine döner. */
export function resetCustomerNotesStore(): void {
  store = [...CUSTOMER_NOTES];
  nextId = 100;
  auditLog = [];
}

function parseCustomerNo(customerNo: string): number | null {
  const trimmed = customerNo.trim();
  const musMatch = /^MUS-(\d+)$/i.exec(trimmed);
  if (musMatch) return Number(musMatch[1]);
  const num = Number(trimmed);
  if (Number.isInteger(num) && num > 0) return num;
  return null;
}

function resolveCustomer(customerNo: string): { id: number; customerNo: string } | null {
  const id = parseCustomerNo(customerNo);
  if (!id) return null;
  const c = CUSTOMERS.find((row) => row.id === id);
  if (!c) return null;
  return { id, customerNo: `MUS-${String(id).padStart(6, '0')}` };
}

function applyFilters(rows: CustomerNoteRow[], filters: NoteFilters): CustomerNoteRow[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((n) => {
    if (n.recordStatus !== 1) return false;
    if (filters.targetEntityType !== 'any' && n.targetEntityType !== filters.targetEntityType) return false;
    if (filters.priorityLevel !== 'any' && n.priorityLevel !== filters.priorityLevel) return false;
    if (!q) return true;
    return (
      n.customerNo.toLowerCase().includes(q) ||
      n.noteText.toLowerCase().includes(q) ||
      String(n.customerId).includes(q)
    );
  });
}

function toNote(row: CustomerNoteRow): CustomerNote {
  return { ...row };
}

function saveRow(id: number, input: CustomerNoteInput, existing?: CustomerNoteRow): SaveNoteResult {
  const err = validateCustomerNoteInput(input);
  if (err) return { ok: false, error: err };

  const customer = resolveCustomer(input.customerNo);
  if (!customer) return { ok: false, error: 'if_not_found' };

  const now = new Date().toISOString();
  const row: CustomerNoteRow = {
    id,
    customerId: customer.id,
    customerNo: customer.customerNo,
    noteText: input.noteText.trim(),
    targetEntityType: input.targetEntityType,
    priorityLevel: input.priorityLevel,
    displayLimit: input.displayLimit,
    displayCount: existing?.displayCount ?? 0,
    endDate: input.endDate || null,
    recordStatus: 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const idx = store.findIndex((n) => n.id === id);
  if (idx >= 0) store = store.map((n, i) => (i === idx ? row : n));
  else store = [...store, row];

  return { ok: true, id };
}

export const mockCustomerNotesAdapter: CustomerNotesService = {
  list(filters) {
    return applyFilters(store, filters).map(toNote);
  },

  create(input) {
    const id = nextId++;
    const result = saveRow(id, input);
    if (result.ok) {
      const saved = store.find((n) => n.id === id);
      logNoteChange('create', id, saved?.customerNo ?? input.customerNo);
    }
    return result;
  },

  update(id, input) {
    const existing = store.find((n) => n.id === id && n.recordStatus === 1);
    if (!existing) return { ok: false, error: 'cn_not_found' };
    const result = saveRow(id, input, existing);
    if (result.ok) {
      const saved = store.find((n) => n.id === id);
      logNoteChange('update', id, saved?.customerNo ?? existing.customerNo);
    }
    return result;
  },

  softDelete(id) {
    const existing = store.find((n) => n.id === id && n.recordStatus === 1);
    if (!existing) return { ok: false, error: 'cn_not_found' };
    store = store.map((n) =>
      n.id === id ? { ...n, recordStatus: 0, updatedAt: new Date().toISOString() } : n,
    );
    logNoteChange('delete', id, existing.customerNo);
    return { ok: true, id };
  },

  incrementDisplay(id) {
    const existing = store.find((n) => n.id === id && n.recordStatus === 1);
    if (!existing) return { ok: false, error: 'cn_not_found' };
    store = store.map((n) =>
      n.id === id ? { ...n, displayCount: n.displayCount + 1, updatedAt: new Date().toISOString() } : n,
    );
    return { ok: true, id };
  },
};

/** Not tüketicisi için — limit/tarih kontrolü ile görünür mü */
export function isNoteVisible(note: CustomerNote, now = new Date()): boolean {
  if (note.recordStatus !== 1) return false;
  if (note.endDate && note.endDate < now.toISOString().slice(0, 10)) return false;
  if (note.displayLimit != null && note.displayCount >= note.displayLimit) return false;
  return true;
}
