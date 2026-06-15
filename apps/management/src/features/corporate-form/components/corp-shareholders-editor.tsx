import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

interface ShareholderRow { id: number; refNo: string; partyType: string; name: string; directShare: number; indirectShare: number; isUbo: boolean; description: string; startDate: string; endDate: string; [k: string]: unknown }
let nextShId = 9600;

export function CorpShareholdersEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as ShareholderRow[] | undefined) ?? [];
  const directShareSum = rows.reduce((s, sh) => s + (Number(sh.directShare) || 0), 0);

  const upd = useCallback((i: number, f: string, v: unknown) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [f]: v } : r))), [rows, onChange]);

  const config = useMemo<TableConfig>(() => ({
    rowKey: 'id', hideTitleBar: true, hideColumnFilters: true, pagination: false,
    columns: [
      { key: 'refNo', title: t('cf_col_ref'), dataIndex: 'refNo', render: 'rRef' },
      { key: 'partyType', title: t('cf_col_party_type'), dataIndex: 'partyType', render: 'rParty', width: 130 },
      { key: 'name', title: t('cc_name'), dataIndex: 'name', render: 'rName' },
      { key: 'directShare', title: t('cf_col_direct_share'), dataIndex: 'directShare', render: 'rDirect', width: 110 },
      { key: 'indirectShare', title: t('cf_col_indirect_share'), dataIndex: 'indirectShare', render: 'rIndirect', width: 110 },
      { key: 'isUbo', title: 'UBO', dataIndex: 'isUbo', render: 'rUbo', width: 80 },
      { key: 'description', title: t('cf_col_description'), dataIndex: 'description', render: 'rDesc' },
      { key: 'startDate', title: t('cf_col_start_date'), dataIndex: 'startDate', render: 'rStart' },
      { key: 'endDate', title: t('cf_col_end_date'), dataIndex: 'endDate', render: 'rEnd' },
      { key: 'actions', title: '', dataIndex: 'id', render: 'rAct', width: 40, align: 'right', excludeFromExport: true },
    ],
    api: { method: async () => ({ success: true, data: rows.map((r, index) => ({ ...r, index })) as unknown as Record<string, unknown>[], total: rows.length }) },
  }), [rows, t]);

  return (
    <div>
      <div className="fs-11 t-mute" style={{ marginBottom: 8 }}>Σ {directShareSum}% / 100%</div>
      <div style={{ margin: '-18px -18px 14px' }}>
        <DynamicTable config={config} permissions={{}} customFunctions={{
          rRef: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" value={rows[Number(r.index)]?.refNo ?? ''} onChange={(e) => upd(Number(r.index), 'refNo', e.target.value)} readOnly={disabled} />,
          rParty: (_: unknown, r: Record<string, unknown>) => <select className="select" value={rows[Number(r.index)]?.partyType ?? 'individual'} onChange={(e) => upd(Number(r.index), 'partyType', e.target.value)} disabled={disabled}><option value="individual">{tr ? 'Gerçek' : 'Individual'}</option><option value="corporate">{tr ? 'Tüzel' : 'Corporate'}</option></select>,
          rName: (_: unknown, r: Record<string, unknown>) => <input className="input fs-12" value={rows[Number(r.index)]?.name ?? ''} onChange={(e) => upd(Number(r.index), 'name', e.target.value)} readOnly={disabled} />,
          rDirect: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" type="number" min={0} max={100} value={rows[Number(r.index)]?.directShare ?? 0} onChange={(e) => upd(Number(r.index), 'directShare', Number(e.target.value))} readOnly={disabled} />,
          rIndirect: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" type="number" min={0} max={100} value={rows[Number(r.index)]?.indirectShare ?? 0} onChange={(e) => upd(Number(r.index), 'indirectShare', Number(e.target.value))} readOnly={disabled} />,
          rUbo: (_: unknown, r: Record<string, unknown>) => { const i = Number(r.index); return <input type="checkbox" checked={!!rows[i]?.isUbo} disabled={disabled || rows[i]?.partyType !== 'individual'} onChange={(e) => upd(i, 'isUbo', e.target.checked)} />; },
          rDesc: (_: unknown, r: Record<string, unknown>) => { const i = Number(r.index); const req = !!rows[i]?.isUbo || (Number(rows[i]?.indirectShare) || 0) > 0; return <input className="input fs-12" value={rows[i]?.description ?? ''} onChange={(e) => upd(i, 'description', e.target.value)} readOnly={disabled} placeholder={req ? (tr ? 'Zorunlu' : 'Required') : ''} />; },
          rStart: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" type="date" value={rows[Number(r.index)]?.startDate ?? ''} onChange={(e) => upd(Number(r.index), 'startDate', e.target.value)} readOnly={disabled} />,
          rEnd: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" type="date" value={rows[Number(r.index)]?.endDate ?? ''} onChange={(e) => upd(Number(r.index), 'endDate', e.target.value)} readOnly={disabled} />,
          rAct: (_: unknown, r: Record<string, unknown>) => <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== Number(r.index)))} disabled={disabled}><X size={13} /></button>,
        }} locale={i18n.language} t={(k, fb) => t(k, { defaultValue: fb ?? k })} />
      </div>
      <button type="button" className="add-row-btn" disabled={disabled} onClick={() => onChange([...rows, { id: nextShId++, refNo: '', refType: 'TCKN', partyType: 'individual', name: '', directShare: 0, indirectShare: 0, isUbo: false, description: '', startDate: new Date().toISOString().slice(0, 10), endDate: '', status: 'active' }])}>
        <Plus size={14} /> {t('cf_add_shareholder')}
      </button>
    </div>
  );
}
