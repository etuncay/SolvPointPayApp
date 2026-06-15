import { describe, expect, it } from 'vitest';
import type { FormConfig } from '@epay/ui';
import { buildApprovalChanges, computeChangedFields } from './compute-changed-fields';

describe('computeChangedFields', () => {
  it('oldValues yoksa dolu alanların tümü değişmiş sayılır', () => {
    const changed = computeChangedFields({ a: 'x', b: '', c: null, d: 0 }, undefined);
    expect(changed.sort()).toEqual(['a', 'd']);
  });

  it('boş↔boş (null/undefined/"") eşdeğer, fark sayılmaz', () => {
    const changed = computeChangedFields({ a: '', b: null }, { a: undefined, b: '' });
    expect(changed).toEqual([]);
  });

  it('skaler farkları yakalar', () => {
    const changed = computeChangedFields({ a: '1', b: 'same' }, { a: '2', b: 'same' });
    expect(changed).toEqual(['a']);
  });

  it('koleksiyon/obje farkını JSON ile yakalar', () => {
    const changed = computeChangedFields({ list: [1, 2] }, { list: [1, 3] });
    expect(changed).toEqual(['list']);
  });
});

describe('buildApprovalChanges', () => {
  const config: FormConfig = {
    panels: [
      {
        key: 'p',
        title: 'P',
        fields: [
          { name: 'fullName', type: 'Input', label: 'Adı Soyadı' },
          {
            name: 'row',
            type: 'Row',
            fields: [{ name: 'status', type: 'Select', label: 'Durum' }],
          },
        ],
      },
    ],
  };

  it('değişen alanlar için config etiketiyle satır üretir', () => {
    const rows = buildApprovalChanges(
      config,
      { fullName: 'Ali Veli', status: 'active' },
      { fullName: 'Ali', status: 'active' },
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ field: 'fullName', label: 'Adı Soyadı', oldValue: 'Ali', newValue: 'Ali Veli' });
  });

  it('config dışı alanları atlar', () => {
    const rows = buildApprovalChanges(config, { unknownField: 'x' }, undefined);
    expect(rows).toEqual([]);
  });
});
