import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';
import { createShareholderRow } from '../api/mock-agent-detail-adapter';

interface ShareholderRow {
  id: number;
  refNo: string;
  partyType: 'individual' | 'corporate';
  name: string;
  directShare: number;
  indirectShare: number;
  isUbo: boolean;
  [k: string]: unknown;
}

export function ShareholdersEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as ShareholderRow[] | undefined) ?? [];

  const directShareSum = rows.reduce((s, sh) => s + (Number(sh.directShare) || 0), 0);

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
    onChange([...rows, createShareholderRow(rows.length)]);
  }, [rows, onChange]);

  const config = useMemo<TableConfig>(
    () => ({
      rowKey: 'id',
      hideTitleBar: true,
      hideColumnFilters: true,
      pagination: false,
      columns: [
        { key: 'refNo', title: 'Ref', dataIndex: 'refNo', render: 'renderRef' },
        { key: 'partyType', title: tr ? 'Tür' : 'Type', dataIndex: 'partyType', render: 'renderPartyType', width: 130 },
        { key: 'name', title: tr ? 'Ad' : 'Name', dataIndex: 'name', render: 'renderName' },
        { key: 'directShare', title: tr ? 'Doğrudan %' : 'Direct %', dataIndex: 'directShare', render: 'renderDirect', width: 120 },
        { key: 'indirectShare', title: tr ? 'Dolaylı %' : 'Indirect %', dataIndex: 'indirectShare', render: 'renderIndirect', width: 120 },
        { key: 'isUbo', title: 'UBO', dataIndex: 'isUbo', render: 'renderUbo', width: 90 },
        { key: 'actions', title: '', dataIndex: 'id', render: 'renderActions', width: 50, align: 'right', excludeFromExport: true },
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
      <div className="fs-11 t-mute" style={{ marginBottom: 8 }}>Σ {directShareSum}% / 100%</div>
      <div style={{ margin: '-18px -18px 14px' }}>
        <DynamicTable
          config={config}
          permissions={{}}
          customFunctions={{
            renderRef: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" value={rows[Number(row.index)]?.refNo ?? ''} onChange={(e) => updateRow(Number(row.index), 'refNo', e.target.value)} readOnly={disabled} />
            ),
            renderPartyType: (_v: unknown, row: Record<string, unknown>) => (
              <select className="select" value={rows[Number(row.index)]?.partyType ?? 'individual'} onChange={(e) => updateRow(Number(row.index), 'partyType', e.target.value)} disabled={disabled}>
                <option value="individual">{tr ? 'Gerçek' : 'Individual'}</option>
                <option value="corporate">{tr ? 'Tüzel' : 'Corporate'}</option>
              </select>
            ),
            renderName: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input fs-12" value={rows[Number(row.index)]?.name ?? ''} onChange={(e) => updateRow(Number(row.index), 'name', e.target.value)} readOnly={disabled} />
            ),
            renderDirect: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" type="number" min={0} max={100} value={rows[Number(row.index)]?.directShare ?? 0} onChange={(e) => updateRow(Number(row.index), 'directShare', Number(e.target.value))} readOnly={disabled} />
            ),
            renderIndirect: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" type="number" min={0} max={100} value={rows[Number(row.index)]?.indirectShare ?? 0} onChange={(e) => updateRow(Number(row.index), 'indirectShare', Number(e.target.value))} readOnly={disabled} />
            ),
            renderUbo: (_v: unknown, row: Record<string, unknown>) => {
              const idx = Number(row.index);
              return <input type="checkbox" checked={!!rows[idx]?.isUbo} disabled={disabled || rows[idx]?.partyType !== 'individual'} onChange={(e) => updateRow(idx, 'isUbo', e.target.checked)} />;
            },
            renderActions: (_v: unknown, row: Record<string, unknown>) => (
              <button type="button" onClick={() => removeRow(Number(row.index))} disabled={disabled}><X size={13} /></button>
            ),
          }}
          locale={i18n.language}
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
      <button type="button" className="add-row-btn" disabled={disabled} onClick={addRow}>
        <Plus size={14} /> {tr ? 'Ortak Ekle' : 'Add shareholder'}
      </button>
    </div>
  );
}
