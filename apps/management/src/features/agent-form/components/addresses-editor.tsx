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
  isContact: boolean;
  latitude?: number;
  longitude?: number;
  [k: string]: unknown;
}

let nextAddrId = 8000;

export function AddressesEditor({ value, onChange, disabled }: CustomComponentProps) {
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
        type: 'registered',
        country: 'TUR',
        city: '',
        district: '',
        neighbourhood: '',
        postcode: '',
        street: '',
        building: '',
        apt: '',
        uavt: '',
        isContact: rows.length === 0,
        status: 'active',
        latitude: undefined,
        longitude: undefined,
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
                <option value="registered">{tr ? 'Kayıtlı (Registered)' : 'Registered'}</option>
                <option value="branch">{tr ? 'Şube' : 'Branch'}</option>
              </select>
            </Field>
            <Field label={tr ? 'İl' : 'City'} required>
              <input className="input" value={addr.city} onChange={(e) => updateRow(index, 'city', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'İlçe' : 'District'} required>
              <input className="input" value={addr.district} onChange={(e) => updateRow(index, 'district', e.target.value)} readOnly={disabled} />
            </Field>
            <Field label={tr ? 'İrtibat' : 'Contact'}>
              <input type="checkbox" checked={addr.isContact} disabled={disabled} onChange={(e) => updateRow(index, 'isContact', e.target.checked)} />
            </Field>
            {addr.country === 'TUR' && (
              <>
                <Field label={tr ? 'Enlem' : 'Latitude'}>
                  <input className="input mono" type="number" step="any" value={addr.latitude ?? ''} onChange={(e) => updateRow(index, 'latitude', e.target.value ? Number(e.target.value) : undefined)} readOnly={disabled} />
                </Field>
                <Field label={tr ? 'Boylam' : 'Longitude'}>
                  <input className="input mono" type="number" step="any" value={addr.longitude ?? ''} onChange={(e) => updateRow(index, 'longitude', e.target.value ? Number(e.target.value) : undefined)} readOnly={disabled} />
                </Field>
              </>
            )}
          </FormGrid>
          <button type="button" onClick={() => removeRow(index)} disabled={disabled} style={{ marginTop: 8 }}>
            <X size={13} /> {tr ? 'Sil' : 'Remove'}
          </button>
        </div>
      ))}
      <button type="button" className="add-row-btn" disabled={disabled} onClick={addRow}>
        <Plus size={14} /> {tr ? 'Adres Ekle' : 'Add address'}
      </button>
    </div>
  );
}
