import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';
import { useMemo } from 'react';

interface ContactRow {
  id: number;
  type: 'email' | 'phone';
  value: string;
  verified: boolean;
  primary: boolean;
  kind?: string;
}

let nextContactId = 7000;

export function IndvContactsEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
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

  const config = useMemo<TableConfig>(
    () => ({
      rowKey: 'id',
      hideTitleBar: true,
      hideColumnFilters: true,
      pagination: false,
      columns: [
        { key: 'type', title: tr ? 'Tip' : 'Type', dataIndex: 'type', render: 'renderType', width: 110 },
        { key: 'value', title: tr ? 'Adres / Numara' : 'Address / Number', dataIndex: 'value', render: 'renderValue' },
        { key: 'verified', title: tr ? 'Doğrulama' : 'Verification', dataIndex: 'verified', render: 'renderVerify', width: 150 },
        { key: 'primary', title: tr ? 'Asıl Kanal' : 'Primary', dataIndex: 'primary', render: 'renderPrimary', width: 140 },
        { key: 'actions', title: '', dataIndex: 'id', render: 'renderActions', width: 60, align: 'right', excludeFromExport: true },
      ],
      api: {
        method: async () => ({
          success: true,
          data: rows.map((r, index) => ({ ...r, index })) as unknown as Record<string, unknown>[],
          total: rows.length,
        }),
      },
    }),
    [rows, tr],
  );

  return (
    <div>
      <div style={{ margin: '-18px -18px 14px' }}>
        <DynamicTable
          config={config}
          permissions={{}}
          customFunctions={{
            renderType: (_v: unknown, row: Record<string, unknown>) => {
              const c = rows[Number(row.index)];
              return (
                <span className="badge muted" style={{ fontSize: 10.5 }}>
                  {c?.type === 'email' ? 'E-posta' : c?.kind === 'landline' ? 'Sabit' : 'Mobil'}
                </span>
              );
            },
            renderValue: (_v: unknown, row: Record<string, unknown>) => {
              const i = Number(row.index);
              const c = rows[i];
              return (
                <input
                  className={`input fs-12 ${c?.type === 'phone' ? 'mono' : ''}`}
                  value={c?.value ?? ''}
                  onChange={(e) => updateRow(i, 'value', e.target.value)}
                  readOnly={disabled}
                />
              );
            },
            renderVerify: (_v: unknown, row: Record<string, unknown>) => {
              const i = Number(row.index);
              const c = rows[i];
              return c?.verified ? (
                <span className="verif ok"><span className="d" />{tr ? 'Doğrulandı' : 'Verified'}</span>
              ) : (
                <button
                  type="button"
                  className="btn ghost"
                  style={{ padding: '2px 8px', fontSize: 11 }}
                  onClick={() => verify(i)}
                  disabled={disabled}
                >
                  {tr ? 'Doğrula' : 'Verify'}
                </button>
              );
            },
            renderPrimary: (_v: unknown, row: Record<string, unknown>) => {
              const i = Number(row.index);
              const c = rows[i];
              return c?.primary ? (
                <span className="badge accent" style={{ background: 'var(--accent-soft)', color: 'var(--accent-fg)' }}>
                  ★ {tr ? 'Asıl' : 'Primary'}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn ghost"
                  style={{ padding: '2px 8px', fontSize: 11 }}
                  onClick={() => setPrimary(i)}
                  disabled={disabled}
                >
                  {tr ? 'Asıl yap' : 'Make primary'}
                </button>
              );
            },
            renderActions: (_v: unknown, row: Record<string, unknown>) => (
              <div className="row-actions">
                <button type="button" onClick={() => removeRow(Number(row.index))} disabled={disabled}>
                  <X size={13} />
                </button>
              </div>
            ),
          }}
          locale={i18n.language}
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="add-row-btn" disabled={disabled} onClick={() => addRow('email')}>
          <Plus size={14} /> {tr ? 'E-posta Ekle' : 'Add email'}
        </button>
        <button type="button" className="add-row-btn" disabled={disabled} onClick={() => addRow('phone')}>
          <Plus size={14} /> {tr ? 'Telefon Ekle' : 'Add phone'}
        </button>
      </div>
    </div>
  );
}
