import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';

export function PassiveRoleBanner() {
  const { t } = useTranslation();
  return (
    <div
      className="alert-banner"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '12px 16px',
        marginBottom: 16,
        borderRadius: 8,
        background: 'var(--warn-bg, rgba(234, 179, 8, 0.12))',
        border: '1px solid var(--warn-border, rgba(234, 179, 8, 0.35))',
      }}
    >
      <TriangleAlert size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <p className="fs-12" style={{ fontWeight: 600, margin: 0 }}>
          {t('usr_passive_role_title')}
        </p>
        <p className="fs-11 t-mute" style={{ margin: '4px 0 0' }}>
          {t('usr_passive_role_body')}
        </p>
      </div>
    </div>
  );
}
