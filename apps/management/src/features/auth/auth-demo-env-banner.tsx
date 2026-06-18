import { useTranslation } from 'react-i18next';
import { Monitor, Shield } from 'lucide-react';
import { isDemoMode } from '@/lib/data-layer';

type Variant = 'login' | 'register';

const COPY: Record<Variant, string> = {
  login: 'auth_demo_env_banner',
  register: 'auth_register_demo_banner',
};

/** Login/register — demo ortamı uyarıları (mock mod). */
export function AuthDemoEnvBanner({ variant = 'login' }: { variant?: Variant }) {
  const { t } = useTranslation();
  if (!isDemoMode()) return null;

  const Icon = variant === 'register' ? Monitor : Shield;

  return (
    <div
      role="note"
      className="auth-demo-env-banner"
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        padding: '10px 12px',
        marginBottom: 14,
        borderRadius: 'var(--r-sm)',
        background: 'color-mix(in srgb, var(--accent, #2563eb) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent, #2563eb) 28%, transparent)',
      }}
    >
      <Icon size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <span className="fs-12" style={{ lineHeight: 1.45 }}>
        {t(COPY[variant])}
      </span>
    </div>
  );
}
