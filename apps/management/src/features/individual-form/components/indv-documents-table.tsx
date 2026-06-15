import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Upload, Plus } from 'lucide-react';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

export function IndvDocumentsTable({ value, disabled, onUpload }: CustomComponentProps & { onUpload?: () => void }) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const documents = (value as Record<string, unknown>[] | undefined) ?? [];

  const config = useMemo<TableConfig>(
    () => ({
      rowKey: 'id',
      hideTitleBar: true,
      hideColumnFilters: true,
      pagination: false,
      columns: [
        { key: 'category', title: tr ? 'Kategori' : 'Category', dataIndex: 'category', render: 'renderCategory' },
        { key: 'type', title: tr ? 'Tür' : 'Type', dataIndex: 'type' },
        { key: 'validity', title: tr ? 'Geçerlilik' : 'Validity', dataIndex: 'validFrom', render: 'renderValidity' },
        { key: 'status', title: 'Status', dataIndex: 'status', render: 'renderStatus' },
        { key: 'actions', title: '', dataIndex: 'id', render: 'renderActions', width: 80 },
      ],
      api: {
        method: async () => ({
          success: true,
          data: documents,
          total: documents.length,
        }),
      },
    }),
    [documents, tr],
  );

  return (
    <div>
      <DynamicTable
        config={config}
        permissions={{}}
        customFunctions={{
          renderCategory: (val: unknown) => <span className="badge muted">{String(val ?? '')}</span>,
          renderValidity: (_val: unknown, row: Record<string, unknown>) => (
            <span className="mono fs-12">{String(row.validFrom ?? '')} → {String(row.validTo ?? '')}</span>
          ),
          renderStatus: (val: unknown) => {
            const s = String(val ?? '');
            return <span className={`kyc-pill ${s === 'approved' ? 'ok' : 'pending'}`}>{s}</span>;
          },
          renderActions: () => (
            <div className="row-actions">
              <button type="button" title="View"><Eye size={13} /></button>
              <button type="button" title="Download"><Upload size={13} /></button>
            </div>
          ),
        }}
        locale={i18n.language}
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
      {documents.length === 0 && (
        <div className="empty-state" style={{ padding: 24 }}>
          <div className="t-mute fs-12">
            {tr ? 'Asgari bir Identity belgesi yüklenmelidir' : 'At least one Identity document is required'}
          </div>
        </div>
      )}
      <button type="button" className="add-row-btn" disabled={disabled} onClick={() => onUpload?.()}>
        <Plus size={14} /> {tr ? 'Belge Yükle' : 'Upload document'}
      </button>
    </div>
  );
}
