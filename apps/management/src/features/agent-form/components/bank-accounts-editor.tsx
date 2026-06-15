import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

interface BankRow {
  id: number;
  bank: string;
  iban: string;
  currency: string;
  branch: string;
  accountNo: string;
  suffix: string;
  isDefault: boolean;
  status: string;
}

let nextBankId = 9000;

export function BankAccountsEditor({ value, onChange, disabled }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const banks = (value as BankRow[] | undefined) ?? [];

  const updateRow = useCallback(
    (index: number, field: keyof BankRow, val: unknown) => {
      const next = banks.map((b, i) => (i === index ? { ...b, [field]: val } : b));
      onChange(next);
    },
    [banks, onChange],
  );

  const setDefault = useCallback(
    (index: number) => {
      const currency = banks[index]?.currency;
      if (!currency) return;
      const next = banks.map((b, i) => ({
        ...b,
        isDefault: b.currency === currency ? i === index : b.isDefault,
      }));
      onChange(next);
    },
    [banks, onChange],
  );

  const removeRow = useCallback(
    (index: number) => onChange(banks.filter((_, i) => i !== index)),
    [banks, onChange],
  );

  const addRow = useCallback(() => {
    onChange([
      ...banks,
      {
        id: nextBankId++,
        bank: '',
        iban: '',
        currency: 'TRY',
        branch: '',
        accountNo: '',
        suffix: '',
        isDefault: banks.length === 0,
        status: 'active',
      },
    ]);
  }, [banks, onChange]);

  const config = useMemo<TableConfig>(
    () => ({
      rowKey: 'id',
      hideTitleBar: true,
      hideColumnFilters: true,
      pagination: false,
      columns: [
        { key: 'bank', title: tr ? 'Banka' : 'Bank', dataIndex: 'bank', render: 'renderBank' },
        { key: 'iban', title: 'IBAN', dataIndex: 'iban', render: 'renderIban' },
        { key: 'currency', title: tr ? 'PB' : 'CCY', dataIndex: 'currency', render: 'renderCurrency', width: 100 },
        { key: 'branch', title: tr ? 'Şube' : 'Branch', dataIndex: 'branch', render: 'renderBranch' },
        { key: 'accountNo', title: tr ? 'Hesap' : 'Acct', dataIndex: 'accountNo', render: 'renderAccountNo' },
        { key: 'suffix', title: 'Ek', dataIndex: 'suffix', render: 'renderSuffix', width: 90 },
        { key: 'isDefault', title: tr ? 'Varsayılan' : 'Default', dataIndex: 'isDefault', render: 'renderDefault', width: 120 },
        { key: 'actions', title: '', dataIndex: 'id', render: 'renderActions', width: 50, align: 'right', excludeFromExport: true },
      ],
      api: {
        method: async () => ({
          success: true,
          data: banks.map((b, index) => ({ ...b, index })) as unknown as Record<string, unknown>[],
          total: banks.length,
        }),
      },
    }),
    [banks, tr],
  );

  return (
    <div>
      <div style={{ margin: '-18px -18px 14px' }}>
        <DynamicTable
          config={config}
          permissions={{}}
          customFunctions={{
            renderBank: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input fs-12" value={banks[Number(row.index)]?.bank ?? ''} onChange={(e) => updateRow(Number(row.index), 'bank', e.target.value)} readOnly={disabled} />
            ),
            renderIban: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" value={banks[Number(row.index)]?.iban ?? ''} onChange={(e) => updateRow(Number(row.index), 'iban', e.target.value)} readOnly={disabled} />
            ),
            renderCurrency: (_v: unknown, row: Record<string, unknown>) => (
              <select className="select" value={banks[Number(row.index)]?.currency ?? 'TRY'} onChange={(e) => updateRow(Number(row.index), 'currency', e.target.value)} disabled={disabled}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            ),
            renderBranch: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" value={banks[Number(row.index)]?.branch ?? ''} onChange={(e) => updateRow(Number(row.index), 'branch', e.target.value)} readOnly={disabled} />
            ),
            renderAccountNo: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" value={banks[Number(row.index)]?.accountNo ?? ''} onChange={(e) => updateRow(Number(row.index), 'accountNo', e.target.value)} readOnly={disabled} />
            ),
            renderSuffix: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" value={banks[Number(row.index)]?.suffix ?? ''} onChange={(e) => updateRow(Number(row.index), 'suffix', e.target.value)} readOnly={disabled} />
            ),
            renderDefault: (_v: unknown, row: Record<string, unknown>) => (
              <input type="checkbox" checked={!!banks[Number(row.index)]?.isDefault} disabled={disabled} onChange={() => setDefault(Number(row.index))} />
            ),
            renderActions: (_v: unknown, row: Record<string, unknown>) => (
              <button type="button" onClick={() => removeRow(Number(row.index))} disabled={disabled}><X size={13} /></button>
            ),
          }}
          locale={i18n.language}
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
      <button type="button" className="add-row-btn" disabled={disabled} onClick={addRow}>
        <Plus size={14} /> {tr ? 'Banka Hesabı Ekle' : 'Add bank'}
      </button>
    </div>
  );
}
