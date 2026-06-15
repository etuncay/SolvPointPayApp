import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Button, type CustomComponentProps } from '@epay/ui';

interface ContactRow { id: number; type: 'email' | 'phone'; value: string; verified: boolean; primary: boolean; kind?: string }
let nextId = 9900;

export function CorpContactsEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as ContactRow[] | undefined) ?? [];

  const upd = useCallback((i: number, f: string, v: unknown) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [f]: v } : r))), [rows, onChange]);
  const setPrimary = useCallback((i: number) => { const type = rows[i]?.type; onChange(rows.map((c, idx) => ({ ...c, primary: c.type === type ? idx === i : c.primary }))); }, [rows, onChange]);
  const verify = useCallback((i: number) => onChange(rows.map((c, idx) => (idx === i ? { ...c, verified: true } : c))), [rows, onChange]);
  const add = useCallback((type: 'email' | 'phone') => onChange([...rows, { id: nextId++, type, value: '', verified: false, primary: !rows.some((c) => c.type === type && c.primary), kind: type === 'phone' ? 'mobile' : undefined }]), [rows, onChange]);

  return (
    <div>
      {rows.map((c, index) => (
        <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <select className="select" value={c.type} onChange={(e) => upd(index, 'type', e.target.value)} disabled={disabled} style={{ width: 100 }}>
            <option value="email">E-posta</option>
            <option value="phone">{tr ? 'Telefon' : 'Phone'}</option>
          </select>
          <input className="input" value={c.value} onChange={(e) => upd(index, 'value', e.target.value)} readOnly={disabled} style={{ flex: 1 }} />
          {!c.verified && !disabled && <Button type="button" variant="ghost" onClick={() => verify(index)}>{tr ? 'Doğrula' : 'Verify'}</Button>}
          {c.verified && <span className="badge ok">✓</span>}
          <label><input type="radio" name={`primary-${c.type}`} checked={c.primary} onChange={() => setPrimary(index)} disabled={disabled} />{tr ? 'Asıl' : 'Primary'}</label>
          <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))} disabled={disabled}><X size={13} /></button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="add-row-btn" disabled={disabled} onClick={() => add('email')}><Plus size={14} /> E-posta</button>
        <button type="button" className="add-row-btn" disabled={disabled} onClick={() => add('phone')}><Plus size={14} /> {tr ? 'Telefon' : 'Phone'}</button>
      </div>
    </div>
  );
}
