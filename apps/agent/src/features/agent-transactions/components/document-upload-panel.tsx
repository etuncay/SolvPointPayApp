import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, FilePlus, Shield } from 'lucide-react';
import './identity-scan.css';

interface Props {
  titleKey?: string;
  hintKey?: string;
  labelKey?: string;
  uploadedFileName?: string;
  onFileSelected: (fileName: string) => void;
}

/** Tek belge yükleme alanı — tüzel onay belgesi vb. (kimlik kutusu ile aynı görünüm). */
export function DocumentUploadPanel({
  titleKey = 'ag_tr_doc_upload_title',
  hintKey = 'ag_tr_doc_upload_hint',
  labelKey = 'ag_tr_doc_upload_label',
  uploadedFileName,
  onFileSelected,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const done = Boolean(uploadedFileName);

  return (
    <section className="fcard" style={{ marginBottom: 16 }}>
      <div className="fcard-head" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
        <span
          style={{
            width: 26,
            height: 26,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            background: '#fffbeb',
            color: '#b45309',
          }}
        >
          <Shield size={13} />
        </span>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t(titleKey)}</h3>
      </div>
      <div className="fcard-body">
        <p className="t-mute fs-12" style={{ marginTop: 0, marginBottom: 14 }}>
          {t(hintKey)}
        </p>
        <div
          role="button"
          tabIndex={0}
          className={done ? 'id-scan-box id-scan-box--done' : 'id-scan-box id-scan-box--active'}
          style={{ maxWidth: 360 }}
          onClick={() => !done && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !done && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            hidden
            onChange={(e) => {
              const name = e.target.files?.[0]?.name;
              if (name) onFileSelected(name);
            }}
          />
          {done ? (
            <>
              <Check size={20} strokeWidth={2.5} />
              <span className="id-scan-label">{t(labelKey)}</span>
              <span>{t('ag_tr_id_scanned')} ✓</span>
              <span className="t-mute fs-11 mono">{uploadedFileName}</span>
            </>
          ) : (
            <>
              <div className="id-scan-thumb" aria-hidden />
              <FilePlus size={18} style={{ opacity: 0.4 }} />
              <span className="id-scan-label">{t(labelKey)}</span>
              <span>{t('ag_tr_id_scan_drop')}</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
