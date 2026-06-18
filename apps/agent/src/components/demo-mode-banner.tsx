import { useTranslation } from 'react-i18next';
import { Database } from 'lucide-react';
import { isDemoMode } from '@/lib/data-layer';

type Props = {
  /** Auth ekranlarında üst kenara yapışık tam genişlik */
  placement?: 'inline' | 'page-top';
};

/** Mock/dexie sürücü aktifken — management `DemoModeBanner` ile aynı görünüm. */
export function DemoModeBanner({ placement = 'inline' }: Props) {
  const { t } = useTranslation();
  if (!isDemoMode()) return null;

  const isPageTop = placement === 'page-top';

  return (
    <div
      role="status"
      className="demo-mode-banner"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: isPageTop ? '10px 20px' : '12px 16px',
        marginBottom: isPageTop ? 0 : 16,
        borderRadius: isPageTop ? 0 : 8,
        width: isPageTop ? '100%' : undefined,
        background: 'var(--warn-bg, rgba(234, 179, 8, 0.12))',
        border: isPageTop
          ? 'none'
          : '1px solid var(--warn-border, rgba(234, 179, 8, 0.35))',
        borderBottom: isPageTop
          ? '1px solid var(--warn-border, rgba(234, 179, 8, 0.35))'
          : undefined,
      }}
    >
      <Database size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <p className="fs-12" style={{ fontWeight: 600, margin: 0 }}>
          {t('demo_mode_banner_title')}
        </p>
        <p className="fs-11 t-mute" style={{ margin: '4px 0 0' }}>
          {t('demo_mode_banner_body')}
        </p>
      </div>
    </div>
  );
}
