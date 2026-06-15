import { describe, expect, it } from 'vitest';
import { formatWalletNote, joinWalletNotes } from './format-wallet-note';

describe('formatWalletNote', () => {
  it('spec §8 formatını üretir', () => {
    const line = formatWalletNote({
      authorName: 'Ayşe Yılmaz',
      createdAt: '2026-05-20T10:30:00.000Z',
      action: 'Not Ekle',
      text: 'Müşteri arandı',
    });
    expect(line).toBe('Ayşe Yılmaz – 2026-05-20 – Not Ekle: Müşteri arandı');
  });

  it('notları birleştirir', () => {
    expect(
      joinWalletNotes([
        { formatted: 'A – 2026-05-01 – Not: x' },
        { formatted: 'B – 2026-05-02 – Not: y' },
      ]),
    ).toBe('A – 2026-05-01 – Not: x\nB – 2026-05-02 – Not: y');
  });
});
