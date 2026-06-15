import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig, type TableCustomFunctions } from '@epay/ui';
import type { TransactionDocument } from '../domain/detail-types';
import documentsJson from '../config/transaction-documents.table.config.json';

type Props = {
  documents: TransactionDocument[];
  onDownload: (docId: number) => void;
};

type TableConfigJson = Omit<TableConfig, 'api'>;

export function TransactionDocumentsTable({ documents, onDownload }: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) => t(key, { defaultValue: fb ?? key });

  const config = useMemo(() => {
    const base = documentsJson as TableConfigJson;
    return {
      ...base,
      title: t('td_panel_documents', base.title as string),
      api: {
        method: async () => ({
          data: documents as unknown as Record<string, unknown>[],
          total: documents.length,
          success: true,
        }),
      },
    } satisfies TableConfig;
  }, [documents, t]);

  const fns: TableCustomFunctions = useMemo(
    () => ({
      renderDocType: (val: unknown): ReactNode => t(`td_doc_type_${String(val)}`, String(val)),
      renderDocDownload: (val: unknown): ReactNode => (
        <button type="button" className="link-btn" onClick={() => onDownload(Number(val))}>
          {t('dd_download')}
        </button>
      ),
    }),
    [onDownload, t],
  );

  if (documents.length === 0) return <p className="t-mute">{t('td_docs_empty')}</p>;

  return <DynamicTable config={config} permissions={{}} customFunctions={fns} locale={i18n.language} t={translate} />;
}
