import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import { HR_DOCUMENT_TYPES, type HrDocumentTypeCode } from '../domain/hr-document-types';
import type { DocumentUploadInput } from '../domain/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (doc: DocumentUploadInput) => void;
};

export function HrDocUploadModal({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<HrDocumentTypeCode>(HR_DOCUMENT_TYPES[0]!.code);
  const [fileName, setFileName] = useState('belge.pdf');

  if (!open) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('ef_upload_doc')}</h2>
        </div>
        <div className="modal-body" style={{ gap: 12 }}>
          <Field label={t('ef_doc_type')} required>
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value as HrDocumentTypeCode)}
            >
              {HR_DOCUMENT_TYPES.map((docType) => (
                <option key={docType.code} value={docType.code}>
                  {t(docType.labelKey)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('scf_doc_name')} required>
            <input className="input" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              onSubmit({ type, fileName: fileName.trim() || 'belge.pdf' });
              onClose();
            }}
          >
            {t('ef_upload')}
          </Button>
        </div>
      </div>
    </div>
  );
}
