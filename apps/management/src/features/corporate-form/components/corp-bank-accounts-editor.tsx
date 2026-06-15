import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

interface BankRow { id: number; bank: string; iban: string; currency: string; branch: string; accountNo: string; suffix: string; isDefault: boolean; status: string }
let nextId = 9500;

export function CorpBankAccountsEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const banks = (value as BankRow[] | undefined) ?? [];

  const update = useCallback((i: number, f: keyof BankRow, v: unknown) => {
    onChange(banks.map((b, idx) => (idx === i ? { ...b, [f]: v } : b)));
  }, [banks, onChange]);

  const setDefault = useCallback((i: number) => {
    const ccy = banks[i]?.currency;
    if (!ccy) return;
    onChange(banks.map((b, idx) => ({ ...b, isDefault: b.currency === ccy ? idx === i : b.isDefault })));
  }, [banks, onChange]);

  const config = useMemo<TableConfig>(() => ({
    rowKey: 'id', hideTitleBar: true, hideColumnFilters: true, pagination: false,
    columns: [
      { key: 'bank', title: tr ? 'Banka' : 'Bank', dataIndex: 'bank', render: 'rBank' },
      { key: 'iban', title: 'IBAN', dataIndex: 'iban', render: 'rIban' },
      { key: 'currency', title: tr ? 'PB' : 'CCY', dataIndex: 'currency', render: 'rCcy' },
      { key: 'branch', title: tr ? 'Şube' : 'Branch', dataIndex: 'branch', render: 'rBranch' },
      { key: 'accountNo', title: tr ? 'Hesap' : 'Acct', dataIndex: 'accountNo', render: 'rAcct' },
      { key: 'suffix', title: 'Ek', dataIndex: 'suffix', render: 'rSuffix' },
      { key: 'isDefault', title: tr ? 'Varsayılan' : 'Default', dataIndex: 'isDefault', render: 'rDef', width: 120 },
      { key: 'actions', title: '', dataIndex: 'id', render: 'rAct', width: 40, align: 'right', excludeFromExport: true },
    ],
    api: { method: async () => ({ success: true, data: banks.map((b, index) => ({ ...b, index })) as unknown as Record<string, unknown>[], total: banks.length }) },
  }), [banks, tr]);

  return (
    <div>
      <div style={{ margin: '-18px -18px 14px' }}>
        <DynamicTable config={config} permissions={{}} customFunctions={{
          rBank: (_: unknown, r: Record<string, unknown>) => <input className="input fs-12" value={banks[Number(r.index)]?.bank ?? ''} onChange={(e) => update(Number(r.index), 'bank', e.target.value)} readOnly={disabled} />,
          rIban: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" value={banks[Number(r.index)]?.iban ?? ''} onChange={(e) => update(Number(r.index), 'iban', e.target.value)} readOnly={disabled} />,
          rCcy: (_: unknown, r: Record<string, unknown>) => <select className="select" value={banks[Number(r.index)]?.currency ?? 'TRY'} onChange={(e) => update(Number(r.index), 'currency', e.target.value)} disabled={disabled}><option value="TRY">TRY</option><option value="USD">USD</option><option value="EUR">EUR</option></select>,
          rBranch: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" value={banks[Number(r.index)]?.branch ?? ''} onChange={(e) => update(Number(r.index), 'branch', e.target.value)} readOnly={disabled} />,
          rAcct: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" value={banks[Number(r.index)]?.accountNo ?? ''} onChange={(e) => update(Number(r.index), 'accountNo', e.target.value)} readOnly={disabled} />,
          rSuffix: (_: unknown, r: Record<string, unknown>) => <input className="input mono fs-12" value={banks[Number(r.index)]?.suffix ?? ''} onChange={(e) => update(Number(r.index), 'suffix', e.target.value)} readOnly={disabled} />,
          rDef: (_: unknown, r: Record<string, unknown>) => <input type="checkbox" checked={!!banks[Number(r.index)]?.isDefault} disabled={disabled} onChange={() => setDefault(Number(r.index))} />,
          rAct: (_: unknown, r: Record<string, unknown>) => <button type="button" onClick={() => onChange(banks.filter((_, i) => i !== Number(r.index)))} disabled={disabled}><X size={13} /></button>,
        }} locale={i18n.language} t={(k, fb) => t(k, { defaultValue: fb ?? k })} />
      </div>
      <button type="button" className="add-row-btn" disabled={disabled} onClick={() => onChange([...banks, { id: nextId++, bank: '', iban: '', currency: 'TRY', branch: '', accountNo: '', suffix: '', isDefault: banks.length === 0, status: 'active' }])}>
        <Plus size={14} /> {tr ? 'Banka Hesabı Ekle' : 'Add bank'}
      </button>
    </div>
  );
}
