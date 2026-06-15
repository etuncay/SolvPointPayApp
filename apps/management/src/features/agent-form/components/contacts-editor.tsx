import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Button, type CustomComponentProps } from '@epay/ui';

interface ContactRow {
  id: number;
  type: 'email' | 'phone';
  value: string;
  verified: boolean;
  primary: boolean;
  kind?: string;
}

let nextContactId = 7000;

export function ContactsEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as ContactRow[] | undefined) ?? [];

  const updateRow = useCallback(
    (index: number, field: string, val: unknown) => {
      const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r));
      onChange(next);
    },
    [rows, onChange],
  );

  const setPrimary = useCallback(
    (index: number) => {
      const type = rows[index]?.type;
      const next = rows.map((c, i) => ({
        ...c,
        primary: c.type === type ? i === index : c.primary,
      }));
      onChange(next);
    },
    [rows, onChange],
  );

  const verify = useCallback(
    (index: number) => {
      const next = rows.map((c, i) => (i === index ? { ...c, verified: true } : c));
      onChange(next);
    },
    [rows, onChange],
  );

  const removeRow = useCallback(
    (index: number) => onChange(rows.filter((_, i) => i !== index)),
    [rows, onChange],
  );

  const addRow = useCallback(
    (type: 'email' | 'phone') => {
      onChange([
        ...rows,
        {
          id: nextContactId++,
          type,
          value: '',
          verified: false,
          primary: !rows.some((c) => c.type === type && c.primary),
          kind: type === 'phone' ? 'mobile' : undefined,
        },
      ]);
    },
    [rows, onChange],
  );

  return (
    <div>
      {rows.map((c, index) => (
        <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <select className="select" value={c.type} onChange={(e) => updateRow(index, 'type', e.target.value)} disabled={disabled} style={{ width: 100 }}>
            <option value="email">E-posta</option>
            <option value="phone">{tr ? 'Telefon' : 'Phone'}</option>
          </select>
          <input className="input" value={c.value} onChange={(e) => updateRow(index, 'value', e.target.value)} readOnly={disabled} style={{ flex: 1 }} />
          {!c.verified && !disabled && (
            <Button type="button" variant="ghost" onClick={() => verify(index)}>
              {tr ? 'Doğrula' : 'Verify'}
            </Button>
          )}
          {c.verified && <span className="badge ok">✓</span>}
          <label>
            <input type="radio" name={`primary-${c.type}`} checked={c.primary} onChange={() => setPrimary(index)} disabled={disabled} />
            {tr ? 'Asıl' : 'Primary'}
          </label>
          <button type="button" onClick={() => removeRow(index)} disabled={disabled}><X size={13} /></button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="add-row-btn" disabled={disabled} onClick={() => addRow('email')}>
          <Plus size={14} /> E-posta
        </button>
        <button type="button" className="add-row-btn" disabled={disabled} onClick={() => addRow('phone')}>
          <Plus size={14} /> {tr ? 'Telefon' : 'Phone'}
        </button>
      </div>
    </div>
  );
}
