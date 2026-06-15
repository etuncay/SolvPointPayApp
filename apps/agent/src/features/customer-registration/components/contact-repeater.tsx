import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';

interface ContactRow {
  id: string;
  type: 'email' | 'phone';
  value: string;
  primary: boolean;
}

interface CustomFieldProps {
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
}

/** Çoklu iletişim kanalı — CustomComponent (değer: ContactRow[]). */
export function ContactRepeater({ value, onChange, disabled }: CustomFieldProps) {
  const { t } = useTranslation();
  const rows: ContactRow[] = Array.isArray(value) ? (value as ContactRow[]) : [];

  const add = () =>
    onChange?.([...rows, { id: `contact-${Date.now()}`, type: 'email', value: '', primary: rows.length === 0 }]);
  const update = (i: number, patch: Partial<ContactRow>) =>
    onChange?.(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onChange?.(rows.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.length === 0 ? (
        <p className="t-mute fs-12">{t('ag_cust_contact_empty')}</p>
      ) : (
        rows.map((row, i) => (
          <div key={row.id} className="fcard" style={{ padding: 12, display: 'grid', gridTemplateColumns: '160px 1fr auto auto', gap: 8, alignItems: 'end' }}>
            <label className="fs-12">{t('ag_cust_contact_type')}
              <select className="input" value={row.type} disabled={disabled} onChange={(e) => update(i, { type: e.target.value as ContactRow['type'] })}>
                <option value="email">{t('ag_cust_contact_email')}</option>
                <option value="phone">{t('ag_cust_contact_phone')}</option>
              </select>
            </label>
            <label className="fs-12">{t('ag_cust_contact_value')}
              <input className="input" value={row.value} disabled={disabled} onChange={(e) => update(i, { value: e.target.value })} />
            </label>
            <label className="flex items-center gap-6 fs-12">
              <input type="checkbox" checked={row.primary} disabled={disabled} onChange={(e) => update(i, { primary: e.target.checked })} />
              {t('ag_cust_contact_primary')}
            </label>
            {!disabled ? (
              <button type="button" className="link-btn" onClick={() => remove(i)}>
                <Trash2 size={14} />
              </button>
            ) : null}
          </div>
        ))
      )}
      {!disabled ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
          <Plus size={14} /> {t('ag_cust_contact_add')}
        </button>
      ) : null}
    </div>
  );
}
