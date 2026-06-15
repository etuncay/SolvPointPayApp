import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableCustomFunctions } from '@epay/ui';
import { buildDocumentsTableConfig } from '../documents-table-config';

const DOC_META: Array<{ key: string; category: string; typeKey: string }> = [
  { key: 'identityFront', category: 'Identity', typeKey: 'ag_cust_doc_identity_front' },
  { key: 'identityBack', category: 'Identity', typeKey: 'ag_cust_doc_identity_back' },
  { key: 'proofOfFunds', category: 'ProofOfFunds', typeKey: 'ag_cust_doc_pof' },
  { key: 'proofOfAddress', category: 'ProofOfAddress', typeKey: 'ag_cust_doc_poa' },
];

function asDocs(value: unknown): Record<string, string | undefined> {
  return value && typeof value === 'object' ? (value as Record<string, string | undefined>) : {};
}

interface CustomFieldProps {
  value?: unknown;
}

/** Yüklü belgeler — form `documents` alanından DynamicTable ile listeler. */
export function DocumentList({ value }: CustomFieldProps) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const docs = asDocs(value);
  const today = new Date().toISOString().slice(0, 10);

  const rows = useMemo(
    () =>
      DOC_META.filter((d) => docs[d.key]).map((d) => ({
        key: d.key,
        uploadedAt: today,
        category: d.category,
        typeLabel: d.typeKey,
        docStatus: 'uploaded',
        approval: 'pending',
      })),
    [docs, today],
  );

  const tableConfig = useMemo(
    () => buildDocumentsTableConfig(rows, translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, i18n.language],
  );

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderDocCategory: (val: unknown) => t(`ag_cust_doccat_${String(val)}`),
      renderDocType: (val: unknown) => t(String(val)),
      renderDocStatus: () => <span className="st pending">{t('ag_cust_docstatus_uploaded')}</span>,
      renderDocApproval: () => <span className="st muted">{t('ag_cust_docapproval_pending')}</span>,
    }),
    [t],
  );

  return (
    <DynamicTable
      config={tableConfig}
      permissions={{}}
      customFunctions={customFunctions}
      locale={i18n.language}
      t={translate}
    />
  );
}
