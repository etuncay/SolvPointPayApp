import { describe, expect, it } from 'vitest';
import { renderTemplate } from './render-template';

describe('renderTemplate', () => {
  it('fills placeholders', () => {
    const out = renderTemplate('Merhaba {kullanici_adi}, talep {talep_no}', {
      kullanici_adi: 'Ali',
      talep_no: 'SC-001',
    });
    expect(out).toBe('Merhaba Ali, talep SC-001');
  });
});
