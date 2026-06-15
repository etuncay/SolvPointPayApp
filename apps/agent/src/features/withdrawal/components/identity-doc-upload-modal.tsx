import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export interface IdentityDocPayload {
  frontFile: string;
  backFile: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: IdentityDocPayload) => void;
}

/** Kimlik ön/arka yükleme modalı — §5 kimlik tarama. */
export function IdentityDocUploadModal({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [frontFile, setFrontFile] = useState('');
  const [backFile, setBackFile] = useState('');

  if (!open) return null;

  const canSubmit = Boolean(frontFile && backFile);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ frontFile, backFile });
    setFrontFile('');
    setBackFile('');
    onClose();
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <span>{t('ag_wd_identity_upload_title')}</span>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label={t('form_cancel')}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-b" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="field">
            <span className="field-label">{t('ag_wd_identity_front')}</span>
            <input
              type="file"
              className="input"
              accept="image/*,application/pdf"
              onChange={(e) => setFrontFile(e.target.files?.[0]?.name ?? '')}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('ag_wd_identity_back')}</span>
            <input
              type="file"
              className="input"
              accept="image/*,application/pdf"
              onChange={(e) => setBackFile(e.target.files?.[0]?.name ?? '')}
            />
          </label>
        </div>
        <div className="modal-f">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('form_cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
            {t('ag_cs_upload_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
