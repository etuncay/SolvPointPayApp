import { useTranslation } from 'react-i18next';

type DocsValue = Record<string, string | undefined>;

interface CustomFieldProps {
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
}

/** Kimlik (ön/arka) + gelir/adres belge yükleme — CustomComponent. */
export function DocumentUploads({ value, onChange, disabled }: CustomFieldProps) {
  const { t } = useTranslation();
  const docs = (value ?? {}) as DocsValue;

  const setFile = (key: string, file?: File) => {
    const next: DocsValue = { ...docs };
    if (file) next[key] = file.name;
    else delete next[key];
    onChange?.(next);
  };

  const slots: Array<{ key: string; label: string; required?: boolean }> = [
    { key: 'identityFront', label: t('ag_cust_doc_identity_front'), required: true },
    { key: 'identityBack', label: t('ag_cust_doc_identity_back'), required: true },
    { key: 'proofOfFunds', label: t('ag_cust_doc_pof') },
    { key: 'proofOfAddress', label: t('ag_cust_doc_poa') },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
      {slots.map((s) => (
        <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="fs-12" style={{ fontWeight: 500 }}>
            {s.label}
            {s.required ? <span className="t-danger"> *</span> : null}
          </span>
          <input
            type="file"
            accept="image/*,application/pdf"
            disabled={disabled}
            className="input"
            onChange={(e) => setFile(s.key, e.target.files?.[0])}
          />
          {docs[s.key] ? <span className="t-mute fs-12 mono">{docs[s.key]}</span> : null}
        </div>
      ))}
    </div>
  );
}
