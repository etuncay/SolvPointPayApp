import { useTranslation } from 'react-i18next';
import { DynamicTable, FormCard, type CustomFunctions, type TableConfig } from '@epay/ui';
import { documentsService } from '@/features/dms/api/mock-documents-adapter';
import { useRole } from '@/domain/role-context';
import type { CaseDocumentLink } from '../../domain/types';

type Props = { documents: CaseDocumentLink[] };

export function DocumentsPanel({ documents }: Props) {
  const { t } = useTranslation();
  const { role } = useRole();

  const download = (documentId: string) => {
    const result = documentsService.download(role, documentId);
    if (!result.ok) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FormCard title={t('scf_panel_documents')}>
      {documents.length === 0 ? (
        <p className="t-mute fs-12">{t('scf_docs_empty')}</p>
      ) : (
        <DynamicTable
          config={
            {
              rowKey: 'documentId',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: { defaultPageSize: 8, pageSizeOptions: [8, 15, 30] },
              columns: [
                { key: 'createdAt', title: t('rpt_col_date'), dataIndex: 'createdAt', render: 'renderDate', mono: true, width: 140 },
                { key: 'documentCategory', title: t('scf_doc_category'), dataIndex: 'documentCategory' },
                { key: 'fileName', title: t('scf_doc_name'), dataIndex: 'fileName', render: 'renderFile' },
                { key: 'createdBy', title: t('scf_doc_by'), dataIndex: 'createdBy', render: 'renderBy' },
              ],
              api: {
                method: async () => ({
                  data: documents as unknown as Record<string, unknown>[],
                  total: documents.length,
                  success: true,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={
            {
              renderDate: (val: unknown) =>
                typeof val === 'string' ? new Date(val).toLocaleDateString('tr-TR') : '—',
              renderFile: (val: unknown, row: Record<string, unknown>) => {
                const doc = row as CaseDocumentLink;
                return (
                  <button type="button" className="link fs-12" onClick={() => download(doc.documentId)}>
                    {String(val ?? '')}
                  </button>
                );
              },
              renderBy: (val: unknown) => <span className="fs-12 t-soft">{String(val ?? '')}</span>,
            } satisfies CustomFunctions
          }
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      )}
    </FormCard>
  );
}
