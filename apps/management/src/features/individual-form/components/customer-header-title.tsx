import { Eye, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CustomComponentProps } from '@epay/ui';

/** Bireysel müşteri formu üst bar başlığı — avatar + ad + görüntüleme rozeti. */
export function CustomerHeaderTitle({ value }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const v = (value ?? {}) as Record<string, unknown>;
  const isNew = v._isNew === true;
  const isView = v._isView === true;
  const isProspect = v._isProspect === true;
  const firstName = String(v.firstName ?? '');
  const lastName = String(v.lastName ?? '');
  const fullName = String(v.fullName ?? '');
  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase();
  const title = isNew
    ? tr ? 'Yeni Bireysel Müşteri' : 'New individual customer'
    : fullName || `${firstName} ${lastName}`.trim();

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      {!isNew && (
        <span
          className="avatar indv-f"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
            fontWeight: 600,
            background: isProspect
              ? 'var(--bg-sunken)'
              : v.gender === 'female'
                ? 'oklch(0.92 0.05 320)'
                : 'oklch(0.92 0.05 195)',
            color: isProspect
              ? 'var(--fg-muted)'
              : v.gender === 'female'
                ? 'oklch(0.42 0.13 320)'
                : 'oklch(0.42 0.10 195)',
            border: isProspect ? '1px dashed var(--line-strong)' : 'none',
            flexShrink: 0,
          }}
        >
          {initials || <User size={18} />}
        </span>
      )}
      <span>
        {title}
        {isView && (
          <span className="badge muted" style={{ fontSize: 10.5, marginLeft: 8 }}>
            <Eye size={11} />
            {t('if_view_only')}
          </span>
        )}
      </span>
    </div>
  );
}
