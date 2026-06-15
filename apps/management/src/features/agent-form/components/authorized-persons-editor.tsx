import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { Button, DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';
import { createAuthorizedRow } from '../api/mock-agent-detail-adapter';

interface AuthRow {
  id: number;
  personId: string;
  name: string;
  hasOperationAuth: boolean;
  hasSignatureAuth: boolean;
  kycLevel: string;
  [k: string]: unknown;
}

export function AuthorizedPersonsEditor({ value, onChange, disabled, agentId }: CustomComponentProps & { agentId?: string | null }) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const navigate = useNavigate();
  const rows = (value as AuthRow[] | undefined) ?? [];

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
    onChange([...rows, createAuthorizedRow(rows.length)]);
  }, [rows, onChange]);

  const config = useMemo<TableConfig>(
    () => ({
      rowKey: 'id',
      hideTitleBar: true,
      hideColumnFilters: true,
      pagination: false,
      columns: [
        { key: 'personId', title: 'TCKN', dataIndex: 'personId', render: 'renderPersonId' },
        { key: 'name', title: tr ? 'Ad' : 'Name', dataIndex: 'name', render: 'renderName' },
        { key: 'hasOperationAuth', title: tr ? 'İşlem' : 'Ops', dataIndex: 'hasOperationAuth', render: 'renderOp', width: 90 },
        { key: 'hasSignatureAuth', title: tr ? 'İmza' : 'Sign', dataIndex: 'hasSignatureAuth', render: 'renderSign', width: 90 },
        { key: 'kycLevel', title: 'KYC', dataIndex: 'kycLevel', render: 'renderKyc', width: 100 },
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
      <div style={{ marginBottom: 12 }}>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={() =>
            navigate(
              agentId
                ? `/agents/authorized-persons/new?agentId=${agentId}`
                : '/agents/authorized-persons/new',
            )
          }
        >
          <Plus size={13} />
          {tr ? 'Yeni Yetkili Kişi' : 'New authorized person'}
        </Button>
      </div>
      <div style={{ margin: '-18px -18px 14px' }}>
        <DynamicTable
          config={config}
          permissions={{}}
          onRowClick={(row) => {
            const personIdVal = rows[Number(row.index)]?.personId;
            if (personIdVal)
              navigate(`/agents/authorized-persons/${personIdVal}${agentId ? `?agentId=${agentId}` : ''}`);
          }}
          customFunctions={{
            renderPersonId: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" value={rows[Number(row.index)]?.personId ?? ''} onChange={(e) => updateRow(Number(row.index), 'personId', e.target.value)} readOnly={disabled} onClick={(e) => e.stopPropagation()} />
            ),
            renderName: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input fs-12" value={rows[Number(row.index)]?.name ?? ''} onChange={(e) => updateRow(Number(row.index), 'name', e.target.value)} readOnly={disabled} onClick={(e) => e.stopPropagation()} />
            ),
            renderOp: (_v: unknown, row: Record<string, unknown>) => (
              <input type="checkbox" checked={!!rows[Number(row.index)]?.hasOperationAuth} disabled={disabled} onChange={(e) => updateRow(Number(row.index), 'hasOperationAuth', e.target.checked)} onClick={(e) => e.stopPropagation()} />
            ),
            renderSign: (_v: unknown, row: Record<string, unknown>) => (
              <input type="checkbox" checked={!!rows[Number(row.index)]?.hasSignatureAuth} disabled={disabled} onChange={(e) => updateRow(Number(row.index), 'hasSignatureAuth', e.target.checked)} onClick={(e) => e.stopPropagation()} />
            ),
            renderKyc: (_v: unknown, row: Record<string, unknown>) => (
              <input className="input mono fs-12" value={rows[Number(row.index)]?.kycLevel ?? ''} readOnly onClick={(e) => e.stopPropagation()} />
            ),
            renderActions: (_v: unknown, row: Record<string, unknown>) => (
              <button type="button" onClick={(e) => { e.stopPropagation(); removeRow(Number(row.index)); }} disabled={disabled}><X size={13} /></button>
            ),
          }}
          locale={i18n.language}
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
      <button type="button" className="add-row-btn" disabled={disabled} onClick={addRow}>
        <Plus size={14} /> {tr ? 'Satır Ekle' : 'Add row'}
      </button>
    </div>
  );
}
