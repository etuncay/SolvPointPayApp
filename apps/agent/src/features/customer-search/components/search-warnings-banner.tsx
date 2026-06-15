import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CustomerSearchWarning } from '../domain/types';

interface Props {
  warnings: CustomerSearchWarning[];
}

/** Spec §5 — pembe fon / bordo metin uyarı bandı. */
export function SearchWarningsBanner({ warnings }: Props) {
  const { t } = useTranslation();
  if (!warnings.length) return null;

  return (
    <div
      className="fcard"
      style={{
        marginBottom: 16,
        borderColor: 'var(--danger-border, #fecaca)',
        background: 'var(--danger-bg, #fff1f2)',
      }}
    >
      <div className="fcard-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {warnings.map((w) => (
          <div
            key={w.code}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              color: 'var(--danger-text, #991b1b)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{t(w.message, w.message)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
