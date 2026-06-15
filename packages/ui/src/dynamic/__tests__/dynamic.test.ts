import { describe, it, expect } from 'vitest';
import { evaluateExpression, evalBool } from '../expression';
import { validateField, validateAllFields } from '../validation';
import { applyMask } from '../mask';
import {
  canTableNew,
  canTableEdit,
  canTableDelete,
  canTableExport,
  canToolbarButton,
} from '../table-permissions';
import type { FieldConfig } from '../types';

describe('expression', () => {
  it('values bağlamında değerlendirir', () => {
    expect(evaluateExpression('values.x === 1', { x: 1 })).toBe(true);
    expect(evalBool('values.x === 2', { x: 1 })).toBe(false);
  });

  it('ifade boşsa true', () => {
    expect(evalBool(undefined, {})).toBe(true);
  });

  it('runtime hatasında fail-closed (fallback=false → gizle)', () => {
    expect(evalBool('values.a.b === 1', {}, undefined, false)).toBe(false);
    expect(evalBool('values.a.b === 1', {}, undefined, true)).toBe(true);
  });

  it('parse hatasında fallback döner', () => {
    expect(evalBool('=== bozuk', {}, undefined, false)).toBe(false);
  });
});

describe('validation', () => {
  const req: FieldConfig = {
    name: 'n',
    type: 'Input',
    rules: [{ required: true, message: 'zorunlu' }],
  };

  it('required', () => {
    expect(validateField(req, '', {})).toBe('zorunlu');
    expect(validateField(req, 'x', {})).toBeUndefined();
  });

  it('pattern ve minLength', () => {
    const p: FieldConfig = {
      name: 'p',
      type: 'Input',
      rules: [{ pattern: '^[0-9]{2}$', patternMessage: 'iki hane' }],
    };
    expect(validateField(p, '1', {})).toBe('iki hane');
    expect(validateField(p, '12', {})).toBeUndefined();

    const m: FieldConfig = { name: 'm', type: 'Input', rules: [{ minLength: 3, message: 'kısa' }] };
    expect(validateField(m, 'ab', {})).toBe('kısa');
    expect(validateField(m, 'abc', {})).toBeUndefined();
  });

  it('koşullu requiredRules', () => {
    const f: FieldConfig = { name: 'tax', type: 'Input', requiredRules: 'values.type === "corp"' };
    expect(validateField(f, '', { type: 'corp' })).toBeTruthy();
    expect(validateField(f, '', { type: 'ind' })).toBeUndefined();
  });

  it('validateAllFields Row içini gezer, Divider atlar', () => {
    const fields: FieldConfig[] = [
      { name: 'a', type: 'Input', rules: [{ required: true, message: 'a!' }] },
      { name: 'd', type: 'Divider' },
      {
        name: 'row',
        type: 'Row',
        fields: [{ name: 'b', type: 'Input', rules: [{ required: true, message: 'b!' }] }],
      },
    ];
    const errs = validateAllFields(fields, {});
    expect(errs.a).toBe('a!');
    expect(errs.b).toBe('b!');
    expect(errs.d).toBeUndefined();
  });
});

describe('mask', () => {
  it('rakam + literal maske', () => {
    expect(applyMask('5551234567', '(###) ### ## ##')).toBe('(555) 123 45 67');
    expect(applyMask('ab12', '##')).toBe('12');
  });

  it('A=harf, *=alfanümerik', () => {
    expect(applyMask('12ab', 'AA')).toBe('ab');
    expect(applyMask('a1', '**')).toBe('a1');
  });
});

describe('table-permissions (opt-out)', () => {
  it('izin yoksa açık, false ise kapalı', () => {
    expect(canTableNew(undefined)).toBe(true);
    expect(canTableNew({ new: false })).toBe(false);
    expect(canTableNew({ insert: false })).toBe(false);
    expect(canTableEdit({ update: false })).toBe(false);
    expect(canTableDelete({ delete: false })).toBe(false);
    expect(canTableExport({ export: false })).toBe(false);
    expect(canToolbarButton({ export: false }, 'export')).toBe(false);
    expect(canToolbarButton(undefined, 'export')).toBe(true);
  });
});
