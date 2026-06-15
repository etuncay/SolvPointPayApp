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
  neighbourhood?: string;
  postcode?: string;
  street?: string;
  building?: string;
  isContact: boolean;
  [k: string]: unknown;
}

let nextAddrId = 9000;

export function APAddressesEditor({ value, onChange, disabled, allValues }: CustomComponentProps) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as AddressRow[] | undefined) ?? [];
  const isForeign = allValues?._isForeign === true;

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
        city: '',
        district: '',
        neighbourhood: '',
        postcode: '',
        street: '',
        building: '',
        isContact: rows.length === 0,
      },
    ]);
  }, [rows, onChange]);

  return (
    <div>
      {rows.map((addr, index) => (
        <div key={addr.id} className="addr-card" style={{ marginBottom: 12 }}>
          <FormGrid>
            <Field label={tr ? 'Tip' : 'Type'} required>
              <select className="select" value={addr.type} onChange={(e) => updateRow(index, 'type', e.target.value)} disabled={disabled}>
                <option value="home">{tr ? 'Ev' : 'Home'}</option>
                <option value="work">{tr ? 'İş' : 'Work'}</option>
              </select>
            </Field>
            <Field label={tr ? 'Ülke' : 'Country'} required>
              <input className="input" value={addr.country} onChange={(e) => updateRow(index, 'country', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'İl' : 'City'} required>
              <input className="input" value={addr.city} onChange={(e) => updateRow(index, 'city', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'İlçe' : 'District'} required>
              <input className="input" value={addr.district} onChange={(e) => updateRow(index, 'district', e.target.value)} readOnly={disabled} />
            </Field>
            {isForeign ? (
              <Field label={tr ? 'Adres' : 'Address'} required col={4}>
                <textarea
                  className="textarea"
                  value={addr.street ?? ''}
                  onChange={(e) => updateRow(index, 'street', e.target.value)}
                  readOnly={disabled}
                />
              </Field>
            ) : (
              <>
                <Field label={tr ? 'Mahalle' : 'Neighbourhood'} required>
                  <input className="input" value={addr.neighbourhood ?? ''} onChange={(e) => updateRow(index, 'neighbourhood', e.target.value)} readOnly={disabled} />
                </Field>
                <Field label={tr ? 'Posta Kodu' : 'Postcode'} required>
                  <input className="input mono" value={addr.postcode ?? ''} onChange={(e) => updateRow(index, 'postcode', e.target.value)} readOnly={disabled} />
                </Field>
                <Field label={tr ? 'Sokak' : 'Street'} required col={2}>
                  <input className="input" value={addr.street ?? ''} onChange={(e) => updateRow(index, 'street', e.target.value)} readOnly={disabled} />
                </Field>
                <Field label={tr ? 'Bina' : 'Building'} required>
                  <input className="input mono" value={addr.building ?? ''} onChange={(e) => updateRow(index, 'building', e.target.value)} readOnly={disabled} />
                </Field>
              </>
            )}
            <Field label={tr ? 'İrtibat' : 'Contact'}>
              <input
                type="checkbox"
                checked={addr.isContact}
                disabled={disabled}
                onChange={(e) => updateRow(index, 'isContact', e.target.checked)}
              />
            </Field>
          </FormGrid>
          {!disabled && (
            <button type="button" className="btn ghost" onClick={() => removeRow(index)} style={{ marginTop: 8 }}>
              <X size={13} /> {tr ? 'Kaldır' : 'Remove'}
            </button>
          )}
        </div>
      ))}
      <button type="button" className="add-row-btn" disabled={disabled} onClick={addRow}>
        <Plus size={14} /> {tr ? 'Adres Ekle' : 'Add address'}
      </button>
    </div>
  );
}
