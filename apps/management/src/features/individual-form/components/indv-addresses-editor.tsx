import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Field, FormGrid, type CustomComponentProps } from '@epay/ui';

interface AddressRow {
  id: number;
  type: string;
  country: string;
  city: string;
  district: string;
  neighbourhood: string;
  postcode: string;
  street: string;
  building: string;
  apt: string;
  uavt: string;
  isContact: boolean;
}

let nextAddrId = 8000;

export function IndvAddressesEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as AddressRow[] | undefined) ?? [];

  const updateRow = useCallback(
    (index: number, field: string, val: unknown) => {
      const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r));
      onChange(next);
    },
    [rows, onChange],
  );

  const removeRow = useCallback(
    (index: number) => onChange(rows.filter((_, i) => i !== index)),
    [rows, onChange],
  );

  const addRow = useCallback(() => {
    onChange([
      ...rows,
      {
        id: nextAddrId++,
        type: 'home',
        country: 'TUR',
        city: 'İstanbul',
        district: '',
        neighbourhood: '',
        postcode: '',
        street: '',
        building: '',
        apt: '',
        uavt: '',
        isContact: rows.length === 0,
      },
    ]);
  }, [rows, onChange]);

  return (
    <div>
      {rows.map((addr, index) => (
        <div key={addr.id} className="addr-card" style={{ marginBottom: 12 }}>
          <div className="corner">
            {addr.isContact && (
              <span className="badge ok">{tr ? 'İrtibat adresi' : 'Contact address'}</span>
            )}
            <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => removeRow(index)} disabled={disabled}>
              <X size={13} />
            </button>
          </div>
          <FormGrid>
            <Field label={tr ? 'Adres Tipi' : 'Type'} required>
              <select className="select" value={addr.type} onChange={(e) => updateRow(index, 'type', e.target.value)} disabled={disabled}>
                <option value="home">{tr ? 'Ev' : 'Home'}</option>
                <option value="work">{tr ? 'İş' : 'Work'}</option>
              </select>
            </Field>
            <Field label={tr ? 'Ülke' : 'Country'} required>
              <select className="select" value={addr.country} onChange={(e) => updateRow(index, 'country', e.target.value)} disabled={disabled}>
                <option value="TUR">🇹🇷 Türkiye</option>
              </select>
            </Field>
            <Field label="İl" required>
              <input className="input" value={addr.city} onChange={(e) => updateRow(index, 'city', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label="İlçe" required>
              <input className="input" value={addr.district} onChange={(e) => updateRow(index, 'district', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label="Mahalle" required>
              <input className="input" value={addr.neighbourhood} onChange={(e) => updateRow(index, 'neighbourhood', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'Posta Kodu' : 'Postcode'} required>
              <input className="input mono" value={addr.postcode} onChange={(e) => updateRow(index, 'postcode', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'Sokak / Cadde' : 'Street'} required col={2}>
              <input className="input" value={addr.street} onChange={(e) => updateRow(index, 'street', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'Bina No' : 'Building No'} required>
              <input className="input mono" value={addr.building} onChange={(e) => updateRow(index, 'building', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'Daire' : 'Apt'}>
              <input className="input mono" value={addr.apt} onChange={(e) => updateRow(index, 'apt', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label="UAVT No">
              <input className="input mono" value={addr.uavt} readOnly />
            </Field>
          </FormGrid>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="empty-state" style={{ padding: 32 }}>
          <div className="t-mute fs-12">{tr ? 'Henüz adres eklenmedi' : 'No addresses yet'}</div>
        </div>
      )}
      <button type="button" className="add-row-btn" disabled={disabled} onClick={addRow}>
        <Plus size={14} /> {tr ? 'Adres Ekle' : 'Add address'}
      </button>
    </div>
  );
}
