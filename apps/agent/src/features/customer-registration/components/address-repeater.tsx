import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';

interface AddressRow {
  id: string;
  type: string;
  country: string;
  city: string;
  district: string;
  street: string;
}

interface CustomFieldProps {
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
}

/** Çoklu adres — CustomComponent (değer: AddressRow[]). */
export function AddressRepeater({ value, onChange, disabled }: CustomFieldProps) {
  const { t } = useTranslation();
  const rows: AddressRow[] = Array.isArray(value) ? (value as AddressRow[]) : [];

  const add = () =>
    onChange?.([...rows, { id: `addr-${Date.now()}`, type: 'home', country: 'TUR', city: '', district: '', street: '' }]);
  const update = (i: number, key: keyof AddressRow, val: string) =>
    onChange?.(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const remove = (i: number) => onChange?.(rows.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.length === 0 ? (
        <p className="t-mute fs-12">{t('ag_cust_addr_empty')}</p>
      ) : (
        rows.map((row, i) => (
          <div key={row.id} className="fcard" style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <label className="fs-12">{t('ag_cust_addr_type')}
              <select className="input" value={row.type} disabled={disabled} onChange={(e) => update(i, 'type', e.target.value)}>
                <option value="home">{t('ag_cust_addr_type_home')}</option>
                <option value="work">{t('ag_cust_addr_type_work')}</option>
              </select>
            </label>
            <label className="fs-12">{t('ag_cust_addr_country')}
              <input className="input" value={row.country} disabled={disabled} onChange={(e) => update(i, 'country', e.target.value)} />
            </label>
            <label className="fs-12">{t('ag_cust_addr_city')}
              <input className="input" value={row.city} disabled={disabled} onChange={(e) => update(i, 'city', e.target.value)} />
            </label>
            <label className="fs-12">{t('ag_cust_addr_district')}
              <input className="input" value={row.district} disabled={disabled} onChange={(e) => update(i, 'district', e.target.value)} />
            </label>
            <label className="fs-12" style={{ gridColumn: '1 / -1' }}>{t('ag_cust_addr_street')}
              <input className="input" value={row.street} disabled={disabled} onChange={(e) => update(i, 'street', e.target.value)} />
            </label>
            {!disabled ? (
              <button type="button" className="link-btn" onClick={() => remove(i)}>
                <Trash2 size={14} /> {t('ag_cust_remove')}
              </button>
            ) : null}
          </div>
        ))
      )}
      {!disabled ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
          <Plus size={14} /> {t('ag_cust_addr_add')}
        </button>
      ) : null}
    </div>
  );
}
