import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons/Icon';

export function AlertBanner({
  tone = 'warn',
  icon = 'warn',
  children,
  onClose,
}: {
  tone?: 'warn' | 'info' | 'error';
  icon?: IconName;
  children: ReactNode;
  onClose?: () => void;
}) {
  const tones = {
    warn: {
      bg: 'var(--warn-soft)',
      fg: 'var(--warn)',
      bd: 'color-mix(in srgb, var(--warn) 30%, transparent)',
    },
    info: {
      bg: 'var(--info-soft)',
      fg: 'var(--info)',
      bd: 'color-mix(in srgb, var(--info) 26%, transparent)',
    },
    error: {
      bg: 'var(--neg-soft)',
      fg: 'var(--neg)',
      bd: 'color-mix(in srgb, var(--neg) 28%, transparent)',
    },
  };
  const c = tones[tone];
  return (
    <div
      style={{
        display: 'flex',
        gap: 13,
        alignItems: 'flex-start',
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.bd}`,
        borderRadius: 'var(--r-md)',
        padding: '13px 16px',
        marginBottom: 18,
        fontSize: 14,
      }}
    >
      <Icon name={icon} style={{ width: 19, height: 19, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, lineHeight: 1.5 }}>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: c.fg,
            cursor: 'pointer',
            opacity: 0.7,
            padding: 2,
          }}
          aria-label="Kapat"
        >
          <Icon name="close" style={{ width: 16, height: 16 }} />
        </button>
      )}
    </div>
  );
}
