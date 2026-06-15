import * as React from 'react';
import { CircleAlert } from 'lucide-react';
import { ThemeProvider } from '@epay/ui';
import { APP_PRODUCT } from '@/config/app';

/** Ortalanmış auth kartı — AppShell dışındaki public sayfalar için. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg)',
          color: 'var(--fg)',
          padding: 24,
        }}
      >
        <div style={{ width: 'min(420px, 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 34,
                height: 34,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              €
            </div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              EPay <span className="t-mute" style={{ fontWeight: 500 }}>{APP_PRODUCT}</span>
            </div>
          </div>

          <div className="fcard">
            <div style={{ padding: '20px 22px' }}>
              <h1 style={{ fontSize: 18, fontWeight: 650, margin: 0 }}>{title}</h1>
              {subtitle && (
                <p className="t-mute fs-12" style={{ marginTop: 6 }}>
                  {subtitle}
                </p>
              )}
              <div style={{ marginTop: 18 }}>{children}</div>
            </div>
          </div>

          {footer && (
            <div className="fs-12 t-mute" style={{ marginTop: 14, textAlign: 'center' }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

/** Form geneli hata bandı (danger arka plan + ikon). */
export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '8px 10px',
        borderRadius: 'var(--r-sm)',
        background: 'var(--danger-soft)',
        color: 'var(--danger-fg)',
        border: '1px solid color-mix(in oklch, var(--danger) 22%, transparent)',
        fontSize: 12,
        marginBottom: 14,
      }}
    >
      <CircleAlert size={14} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}

/** Auth ekranlarındaki ana CTA butonu için ortak stil. */
export const authButtonStyle: React.CSSProperties = { width: '100%', justifyContent: 'center', marginTop: 4 };
