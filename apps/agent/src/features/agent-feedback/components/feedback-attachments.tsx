import { useTranslation } from 'react-i18next';
import { FileText, Upload, X } from 'lucide-react';
import { useFeedbackAttachments } from '../hooks/use-agent-feedback';

const ACCEPT = '.pdf,.jpg,.jpeg,.png';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Ekli dosyalar — referans attach-drop + liste. */
export function FeedbackAttachments() {
  const { t } = useTranslation();
  const { attachments, uploadError, addFiles, removeAttachment, fileInputRef } =
    useFeedbackAttachments();

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div
        className="attach-drop"
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <Upload size={20} style={{ opacity: 0.6, marginBottom: 4 }} />
        <div>
          <strong>{t('ag_fb_btn_add_file')}</strong>
        </div>
        <div className="fs-11 t-mute" style={{ marginTop: 3 }}>
          {t('ag_fb_attach_hint')}
        </div>
      </div>

      {uploadError ? (
        <p className="fs-12" style={{ color: 'var(--danger-fg)', marginTop: 8 }}>
          {t(uploadError, uploadError)}
        </p>
      ) : null}

      {attachments.length > 0 ? (
        <div className="attach-list">
          {attachments.map((a) => (
            <div key={a.documentId} className="attach-item">
              <span className="fic">
                <FileText size={14} />
              </span>
              <span className="fname">{a.fileName}</span>
              <span className="fsize">{formatFileSize(a.sizeBytes)}</span>
              <button
                type="button"
                className="frm"
                onClick={() => removeAttachment(a.documentId)}
                aria-label={t('ag_fb_remove_file')}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
