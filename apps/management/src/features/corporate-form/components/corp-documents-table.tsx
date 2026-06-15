import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

export function CorpDocumentsTable({ value }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const docs = (value as Record<string, unknown>[] | undefined) ?? [];

  const config = useMemo<TableConfig>(() => ({
    rowKey: 'id', hideTitleBar: true, hideColumnFilters: true, pagination: false,
    columns: [
      { key: 'category', title: tr ? 'Kategori' : 'Category', dataIndex: 'category' },
      { key: 'type', title: tr ? 'Tür' : 'Type', dataIndex: 'type', mono: true },
      { key: 'status', title: 'Status', dataIndex: 'status', render: 'renderDocStatus' },
    ],
    api: { method: async () => ({ success: true, data: docs, total: docs.length }) },
  }), [docs, tr]);

  return (
    <div>
      <DynamicTable config={config} permissions={{}} customFunctions={{
        renderDocStatus: (val: unknown) => { const s = String(val ?? ''); return <span className={`st ${s === 'approved' ? 'active' : 'inactive'}`}>{s || '\u2014'}</span>; },
      }} locale={i18n.language} t={(k, fb) => t(k, { defaultValue: fb ?? k })} />
      {docs.length === 0 && <p className="t-mute fs-12">{tr ? 'Belge yok' : 'No documents'}</p>}
    </div>
  );
}
