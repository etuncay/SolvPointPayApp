import { describe, expect, it, beforeEach } from 'vitest';
import { CUSTOMER_NOTES } from '@/mocks/customer-notes';
import {
  mockCustomerNotesAdapter,
  isNoteVisible,
  getCustomerNotesAuditLog,
  resetCustomerNotesStore,
} from './mock-customer-notes-adapter';
import type { CustomerNoteInput, NoteFilters } from '../domain/types';

const ALL: NoteFilters = { query: '', targetEntityType: 'any', priorityLevel: 'any' };

const ACTIVE_SEED_COUNT = CUSTOMER_NOTES.filter((n) => n.recordStatus === 1).length;

const validInput: CustomerNoteInput = {
  customerNo: 'MUS-099901',
  noteText: 'Yeni bilgilendirme notu.',
  targetEntityType: 'IndividualCustomer',
  priorityLevel: 'High',
  displayLimit: 5,
  endDate: null,
};

describe('mockCustomerNotesAdapter', () => {
  beforeEach(() => {
    resetCustomerNotesStore();
  });

  it('seed verilerini listeler (yalnızca aktif kayıtlar)', () => {
    const rows = mockCustomerNotesAdapter.list(ALL);
    expect(rows).toHaveLength(ACTIVE_SEED_COUNT);
    expect(rows.every((n) => n.recordStatus === 1)).toBe(true);
    expect(rows.find((n) => n.id === 16)).toBeUndefined();
  });

  it('hedef ve öncelik filtreleri uygulanır', () => {
    const corp = mockCustomerNotesAdapter.list({ ...ALL, targetEntityType: 'CorporateCustomer' });
    expect(corp.length).toBeGreaterThan(1);
    expect(corp.every((n) => n.targetEntityType === 'CorporateCustomer')).toBe(true);

    const agent = mockCustomerNotesAdapter.list({ ...ALL, targetEntityType: 'Agent' });
    expect(agent.every((n) => n.targetEntityType === 'Agent')).toBe(true);
    expect(agent.length).toBeGreaterThanOrEqual(2);

    const high = mockCustomerNotesAdapter.list({ ...ALL, priorityLevel: 'High' });
    expect(high.every((n) => n.priorityLevel === 'High')).toBe(true);
    expect(high.length).toBeGreaterThanOrEqual(3);
  });

  it('arama metin ve müşteri no üzerinde çalışır', () => {
    const byNo = mockCustomerNotesAdapter.list({ ...ALL, query: 'MUS-099903' });
    expect(byNo.length).toBe(2);
    expect(byNo.every((n) => n.customerNo === 'MUS-099903')).toBe(true);

    const byText = mockCustomerNotesAdapter.list({ ...ALL, query: 'KYB' });
    expect(byText.some((n) => n.id === 2)).toBe(true);
  });

  it('geçerli giriş ile not oluşturur ve audit log kaydeder', () => {
    const result = mockCustomerNotesAdapter.create(validInput);
    expect(result.ok).toBe(true);
    expect(mockCustomerNotesAdapter.list(ALL)).toHaveLength(ACTIVE_SEED_COUNT + 1);

    const audit = getCustomerNotesAuditLog();
    expect(audit[0]).toMatchObject({ action: 'create', noteId: result.id });
  });

  it('bilinmeyen müşteri no için if_not_found döner', () => {
    const result = mockCustomerNotesAdapter.create({ ...validInput, customerNo: 'MUS-000000' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('if_not_found');
  });

  it('TCKN içeren metni reddeder', () => {
    const result = mockCustomerNotesAdapter.create({ ...validInput, noteText: 'Kişi 12345678901 doğrulanmalı.' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('cn_text_pii');
  });

  it('mevcut notu günceller ve audit log kaydeder', () => {
    const result = mockCustomerNotesAdapter.update(2, { ...validInput, customerNo: 'MUS-099903', noteText: 'Güncellendi.' });
    expect(result.ok).toBe(true);
    const updated = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 2);
    expect(updated?.noteText).toBe('Güncellendi.');
    expect(getCustomerNotesAuditLog()[0]).toMatchObject({ action: 'update', noteId: 2 });
  });

  it('softDelete kaydı listeden gizler ve audit log kaydeder', () => {
    const result = mockCustomerNotesAdapter.softDelete(1);
    expect(result.ok).toBe(true);
    expect(mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 1)).toBeUndefined();
    expect(getCustomerNotesAuditLog()[0]).toMatchObject({ action: 'delete', noteId: 1 });
  });

  it('incrementDisplay gösterim adedini bir artırır', () => {
    const before = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 2);
    const result = mockCustomerNotesAdapter.incrementDisplay(2);
    expect(result.ok).toBe(true);
    const after = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 2);
    expect(after?.displayCount).toBe((before?.displayCount ?? 0) + 1);
  });
});

describe('isNoteVisible', () => {
  beforeEach(() => {
    resetCustomerNotesStore();
  });

  it('gösterim limiti dolan not görünmez (seed id=3)', () => {
    const note = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 3)!;
    expect(isNoteVisible(note)).toBe(false);
  });

  it('limit altında kalan not görünür (seed id=1)', () => {
    const note = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 1)!;
    expect(isNoteVisible(note, new Date('2026-01-01'))).toBe(true);
  });

  it('bitiş tarihi geçen not görünmez (seed id=15)', () => {
    const note = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 15)!;
    expect(isNoteVisible(note, new Date('2026-01-01'))).toBe(false);
  });

  it('gösterim limiti dolan ikinci seed (id=12)', () => {
    const note = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 12)!;
    expect(isNoteVisible(note)).toBe(false);
  });

  it('limiti null ve tarihi gelecekte olan not görünür (seed id=2)', () => {
    const note = mockCustomerNotesAdapter.list(ALL).find((n) => n.id === 2)!;
    expect(isNoteVisible(note, new Date('2026-01-01'))).toBe(true);
  });
});
