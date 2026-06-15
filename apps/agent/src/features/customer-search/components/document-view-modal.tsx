import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { DynamicTable, type TableCustomFunctions } from '@epay/ui';
import type { CustomerDocumentViewRow } from '../domain/types';
import { buildDocumentsViewTableConfig } from '../customer-search-table-config';

interface Props {
  open: boolean;
  documents: CustomerDocumentViewRow[];
  onClose: () => void;
}

function validityText(key: string, t: (k: string) => string): string {
  if (key === 'unlimited') return t('ag_cs_valid_unlimited');
  if (key === 'expired') return t('ag_cs_valid_expired');
  if (key === 'soon') return t('ag_cs_valid_soon');
  return t('ag_cs_valid_active');
}

/** Belge görüntüleme — DynamicTable (§8). */
export function DocumentViewModal({ open, documents, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () => buildDocumentsViewTableConfig(documents, translate),
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [documents, i18n.language],
  );

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderDocValidity: (val: unknown): ReactNode => validityText(String(val), t),
    }),
    [t],
  );

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal modal-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <span>{t('ag_cs_view_title')}</span>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label={t('form_cancel')}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-b">
          {documents.length === 0 ? (
            <p className="t-mute">{t('ag_cs_no_documents')}</p>
          ) : (
            <DynamicTable
              config={tableConfig}
              permissions={{}}
              customFunctions={customFunctions}
              locale={i18n.language}
              t={translate}
            />
          )}
          <p className="t-mute fs-12" style={{ marginTop: 12 }}>
            {t('ag_cs_no_download_note')}
          </p>
        </div>
        <div className="modal-f">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {t('form_close', 'Kapat')}
          </button>
        </div>
      </div>
    </div>
  );
}
