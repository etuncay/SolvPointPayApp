import { useTranslation } from 'react-i18next';
import { AlertTriangle, FilePlus } from 'lucide-react';

interface Props {
  onAddDocument: () => void;
}

/** Tüzel müşteride onaylı belge eksik — inline uyarı + Belge Ekle (§5). */
export function CorporateDocWarning({ onAddDocument }: Props) {
  const { t } = useTranslation();
  return (
    <div
      className="fcard"
      style={{
        marginBottom: 16,
        borderColor: 'var(--warning-border, #fde68a)',
        background: 'var(--warning-bg, #fffbeb)',
      }}
    >
      <div
        className="fcard-body"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning-text, #92400e)' }}>
          <AlertTriangle size={16} />
          <span className="fs-12" style={{ fontWeight: 500 }}>
            {t('ag_wd_corporate_doc_missing')}
          </span>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onAddDocument}>
          <FilePlus size={14} /> {t('ag_wd_add_document')}
        </button>
      </div>
    </div>
  );
}
