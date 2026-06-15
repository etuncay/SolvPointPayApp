import type { ChangeEvent, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { Field } from '@epay/ui';

type Props = {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
};

export function FileDropzone({ file, onFileSelect, disabled, error }: Props) {
  const { t } = useTranslation();

  const pick = (f: File | undefined) => {
    if (f) onFileSelect(f);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    pick(e.target.files?.[0]);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    pick(e.dataTransfer.files?.[0]);
  };

  return (
    <Field label={t('scf_doc_name')} required error={error ? t(error) : undefined}>
      <label
        className="du-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{
          border: '2px dashed var(--line-strong)',
          borderRadius: 'var(--r-md)',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input
          type="file"
          className="sr-only"
          disabled={disabled}
          onChange={onInputChange}
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
        />
        <Upload size={22} style={{ marginBottom: 8, opacity: 0.65 }} />
        <div className="fs-13">
          <strong>{t('du_drop_title')}</strong>
        </div>
        <div className="fs-11 t-mute" style={{ marginTop: 6 }}>
          {t('du_drop_hint')}
        </div>
        {file && (
          <div className="fs-12 mono" style={{ marginTop: 12, color: 'var(--fg)' }}>
            {file.name} · {(file.size / 1024).toFixed(1)} KB
          </div>
        )}
      </label>
    </Field>
  );
}
