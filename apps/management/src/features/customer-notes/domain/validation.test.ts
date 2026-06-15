import { describe, expect, it } from 'vitest';
import { validateCustomerNoteInput, MAX_NOTE_LENGTH } from './validation';
import type { CustomerNoteInput } from './types';

const base: CustomerNoteInput = {
  customerNo: 'MUS-099901',
  noteText: 'Geçerli bilgilendirme metni.',
  targetEntityType: 'IndividualCustomer',
  priorityLevel: 'Medium',
  displayLimit: null,
  endDate: null,
};

describe('validateCustomerNoteInput', () => {
  it('geçerli girişte hata döndürmez', () => {
    expect(validateCustomerNoteInput(base)).toBeNull();
  });

  it('boş müşteri no reddedilir', () => {
    expect(validateCustomerNoteInput({ ...base, customerNo: '' })).toBe('cn_customer_required');
  });

  it('boş metin reddedilir', () => {
    expect(validateCustomerNoteInput({ ...base, noteText: '' })).toBe('cn_text_required');
  });

  it('500 karakteri aşan metin reddedilir', () => {
    const tooLong = 'a'.repeat(MAX_NOTE_LENGTH + 1);
    expect(validateCustomerNoteInput({ ...base, noteText: tooLong })).toBe('cn_text_max');
  });

  it('11 haneli TCKN içeren metin reddedilir', () => {
    expect(validateCustomerNoteInput({ ...base, noteText: 'Müşteri 12345678901 numaralı kişi.' })).toBe(
      'cn_text_pii',
    );
  });

  it('kart numarası içeren metin reddedilir', () => {
    expect(validateCustomerNoteInput({ ...base, noteText: 'Kart 4111 1111 1111 1111 ile ödeme.' })).toBe(
      'cn_text_pii',
    );
  });

  it('pozitif olmayan gösterim limiti reddedilir', () => {
    expect(validateCustomerNoteInput({ ...base, displayLimit: 0 })).toBe('cn_limit_positive');
    expect(validateCustomerNoteInput({ ...base, displayLimit: -5 })).toBe('cn_limit_positive');
  });

  it('geçersiz formatlı bitiş tarihi reddedilir', () => {
    expect(validateCustomerNoteInput({ ...base, endDate: '30-06-2026' })).toBe('cn_end_date_invalid');
  });

  it('geçerli formatlı bitiş tarihi kabul edilir', () => {
    expect(validateCustomerNoteInput({ ...base, endDate: '2026-06-30' })).toBeNull();
  });
});
