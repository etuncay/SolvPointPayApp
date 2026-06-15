import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

interface AuthRow { id: number; personId: string; name: string; hasOperationAuth: boolean; hasSignatureAuth: boolean; singleTxLimit: number; dailyLimit: number; monthlyLimit: number; kycLevel: string; [k: string]: unknown }
let nextAuthId = 9700;

export function CorpAuthorizedEditor({ value, onChange, disabled, onTcknBlur }: CustomComponentProps & { onTcknBlur?: (i: number) => void }) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const rows = (value as AuthRow[] | undefined) ?? [];

  const upd = useCallback((i: number, f: string, v: unknown) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [f]: v } : r))), [rows, onChange]);

  const config = useMemo<TableConfig>(() => ({
    rowKey: 'id', hideTitleBar: true, hideColumnFilters: true, pagination: false,
    columns: [
      { key: 'personId', title: 'TCKN', dataIndex: 'personId', render: 'rPid' },
      { key: 'name', title: t('cc_name'), dataIndex: 'name', render: 'rName' },
      { key: 'opAuth', title: t('cf_col_operation_auth'), dataIndex: 'hasOperationAuth', render: 'rOp', width: 90 },
      { key: 'sigAuth', title: t('cf_col_signature_auth'), dataIndex: 'hasSignatureAuth', render: 'rSig', width: 90 },
      { key: 'single', title: t('cf_col_single_tx_limit'), dataIndex: 'singleTxLimit', render: 'rSingle', width: 110 },
      { key: 'daily', title: t('cf_col_daily_limit'), dataIndex: 'dailyLimit', render: 'rDaily', width: 110 },
      { key: 'monthly', title: t('cf_col_monthly_limit'), dataIndex: 'monthlyLimit', render: 'rMonthly', width: 110 },
      { key: 'kyc', title: t('rpt_col_kyc'), dataIndex: 'kycLevel', render: 'rKyc', width: 100 },
      { key: 'actions', title: '', dataIndex: 'id', render: 'rAct', width: 40, align: 'right', excludeFromExport: true },
    ],
    api: { method: async () => ({ success: true, data: rows.map((r, index) => ({ ...r, index })) as unknown as Record<string, unknown>[], total: rows.length }) },
  }), [rows, t]);

  return (
    <div>
      <div style={{ margin: '-18px -18px 14px' }}>
        <DynamicTable config={config} permissions={{}} customFunctions={{
          rPid: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" value={rows[Number(r.index)]?.personId ?? ''} onChange={(e) => upd(Number(r.index), 'personId', e.target.value)} readOnly={disabled} onBlur={() => onTcknBlur?.(Number(r.index))} />,
          rName: (_: unknown, r: Record<string, unknown>) => <input className="input fs-12" value={rows[Number(r.index)]?.name ?? ''} onChange={(e) => upd(Number(r.index), 'name', e.target.value)} readOnly={disabled} />,
          rOp: (_: unknown, r: Record<string, unknown>) => <input type="checkbox" checked={!!rows[Number(r.index)]?.hasOperationAuth} disabled={disabled} onChange={(e) => upd(Number(r.index), 'hasOperationAuth', e.target.checked)} />,
          rSig: (_: unknown, r: Record<string, unknown>) => <input type="checkbox" checked={!!rows[Number(r.index)]?.hasSignatureAuth} disabled={disabled} onChange={(e) => upd(Number(r.index), 'hasSignatureAuth', e.target.checked)} />,
          rSingle: (_: unknown, r: Record<string, unknown>) => { const i = Number(r.index); if (!rows[i]?.hasOperationAuth) return <span className="t-mute fs-12">\u2014</span>; return <input className="input mono fs-12" type="number" min={-1} value={rows[i]?.singleTxLimit ?? 0} onChange={(e) => upd(i, 'singleTxLimit', Number(e.target.value))} readOnly={disabled} />; },
          rDaily: (_: unknown, r: Record<string, unknown>) => { const i = Number(r.index); if (!rows[i]?.hasOperationAuth) return <span className="t-mute fs-12">\u2014</span>; return <input className="input mono fs-12" type="number" min={-1} value={rows[i]?.dailyLimit ?? 0} onChange={(e) => upd(i, 'dailyLimit', Number(e.target.value))} readOnly={disabled} />; },
          rMonthly: (_: unknown, r: Record<string, unknown>) => { const i = Number(r.index); if (!rows[i]?.hasOperationAuth) return <span className="t-mute fs-12">\u2014</span>; return <input className="input mono fs-12" type="number" min={-1} value={rows[i]?.monthlyLimit ?? 0} onChange={(e) => upd(i, 'monthlyLimit', Number(e.target.value))} readOnly={disabled} />; },
          rKyc: (_: unknown, r: Record<string, unknown>) => { const i = Number(r.index); const low = !!rows[i]?.hasOperationAuth && (rows[i]?.kycLevel === 'L0' || rows[i]?.kycLevel === 'L1'); return <input className={`input mono fs-12${low ? ' invalid' : ''}`} value={rows[i]?.kycLevel ?? ''} readOnly title={low ? t('cf_auth_kyc_hint') : undefined} />; },
          rAct: (_: unknown, r: Record<string, unknown>) => <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== Number(r.index)))} disabled={disabled}><X size={13} /></button>,
        }} locale={i18n.language} t={(k, fb) => t(k, { defaultValue: fb ?? k })} />
      </div>
      <button type="button" className="add-row-btn" disabled={disabled} onClick={() => onChange([...rows, { id: nextAuthId++, personId: '', name: '', hasOperationAuth: false, hasSignatureAuth: false, singleTxLimit: 0, dailyLimit: 0, monthlyLimit: 0, startDate: new Date().toISOString().slice(0, 10), endDate: '', status: 'active', kycLevel: 'L1' }])}>
        <Plus size={14} /> {t('cf_add_authorized')}
      </button>
    </div>
  );
}
