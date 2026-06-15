import { useTranslation } from 'react-i18next';
import { AlertTriangle, FileText } from 'lucide-react';

type Props = { missingTypes: string[] };

export function MissingDocsBanner({ missingTypes }: Props) {
  const { t } = useTranslation();
  if (missingTypes.length === 0) return null;

  return (
    <div
      className="card"
      style={{
        padding: 14,
        marginBottom: 18,
        borderColor: 'var(--danger-border)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--danger-bg) 88%, white 12%) 0%, var(--danger-bg) 100%)',
        boxShadow: '0 6px 20px color-mix(in srgb, var(--danger) 14%, transparent)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              width: 24,
              height: 24,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'color-mix(in srgb, var(--danger) 16%, transparent)',
              color: 'var(--danger)',
              flex: '0 0 auto',
            }}
          >
            <AlertTriangle size={14} />
          </span>
          <strong className="fs-12" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t('ef_missing_docs_title')}
          </strong>
        </div>
        <span
          className="pill fs-11"
          style={{
            borderColor: 'color-mix(in srgb, var(--danger) 35%, transparent)',
            background: 'color-mix(in srgb, var(--danger) 14%, transparent)',
            color: 'var(--danger)',
            fontWeight: 700,
          }}
        >
          {missingTypes.length}
        </span>
      </div>

      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {missingTypes.map((type) => (
          <span
            key={type}
            className="pill fs-11"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderColor: 'color-mix(in srgb, var(--danger) 25%, transparent)',
              background: 'var(--panel)',
              color: 'var(--danger-ink)',
            }}
          >
            <FileText size={12} />
            {t(`ef_doc_${type}`, type)}
          </span>
        ))}
      </div>
    </div>
  );
}
