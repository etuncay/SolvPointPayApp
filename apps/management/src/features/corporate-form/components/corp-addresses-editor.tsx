import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Field, FormGrid, type CustomComponentProps } from '@epay/ui';

interface AddressRow { id: number; type: string; city: string; district: string; isContact: boolean; [k: string]: unknown }
let nextId = 9800;

export function CorpAddressesEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as AddressRow[] | undefined) ?? [];

  const upd = useCallback((i: number, f: string, v: unknown) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [f]: v } : r))), [rows, onChange]);

  return (
    <div>
      {rows.map((addr, index) => (
        <div key={addr.id} className="addr-card" style={{ marginBottom: 12 }}>
          <FormGrid>
            <Field label={tr ? 'Tip' : 'Type'} required>
              <select className="select" value={addr.type} onChange={(e) => upd(index, 'type', e.target.value)} disabled={disabled}>
                <option value="registered">{tr ? 'Kayıtlı (Registered)' : 'Registered'}</option>
                <option value="branch">{tr ? 'Şube' : 'Branch'}</option>
              </select>
            </Field>
            <Field label={tr ? 'İl' : 'City'} required>
              <input className="input" value={addr.city} onChange={(e) => upd(index, 'city', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'İlçe' : 'District'} required>
              <input className="input" value={addr.district} onChange={(e) => upd(index, 'district', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'İrtibat' : 'Contact'}>
              <input type="checkbox" checked={addr.isContact} disabled={disabled} onChange={(e) => upd(index, 'isContact', e.target.checked)} />
            </Field>
          </FormGrid>
          <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))} disabled={disabled} style={{ marginTop: 8 }}>
            <X size={13} /> {tr ? 'Sil' : 'Remove'}
          </button>
        </div>
      ))}
      <button type="button" className="add-row-btn" disabled={disabled} onClick={() => onChange([...rows, { id: nextId++, type: 'registered', country: 'TUR', city: '', district: '', neighbourhood: '', postcode: '', street: '', building: '', apt: '', uavt: '', isContact: rows.length === 0, status: 'active' }])}>
        <Plus size={14} /> {tr ? 'Adres Ekle' : 'Add address'}
      </button>
    </div>
  );
}
