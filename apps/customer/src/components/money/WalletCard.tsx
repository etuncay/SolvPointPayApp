import type { CustomerWallet } from '@epay/data';
import { fmtMoney } from '@/lib/format';
import { Icon } from '@/components/icons/Icon';
import { useTranslation } from 'react-i18next';

export function WalletCard({
  wallet: w,
  featured,
  onClick,
}: {
  wallet: CustomerWallet;
  featured?: boolean;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const ro = !w.editable;
  return (
    <div
      className="card"
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
        borderColor: featured ? 'transparent' : 'var(--line)',
        background: featured
          ? 'linear-gradient(135deg, var(--brand-700), var(--brand-500))'
          : 'var(--surface)',
        color: featured ? '#fff' : 'var(--ink)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: featured ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        minWidth: 0,
      }}
    >
      {featured && (
        <div
          style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.08)',
          }}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              opacity: featured ? 0.92 : 1,
              color: featured ? '#fff' : 'var(--ink)',
            }}
          >
            {w.label}
          </div>
          <div
            className="tnum"
            style={{
              fontSize: 12,
              opacity: featured ? 0.7 : 0.6,
              marginTop: 2,
              color: featured ? '#fff' : 'var(--muted)',
            }}
          >
            {w.walletNo} · {w.currency}
          </div>
        </div>
        {ro ? (
          <span
            className="tag"
            style={{
              background: featured ? 'rgba(255,255,255,.18)' : 'var(--bg-2)',
              color: featured ? '#fff' : 'var(--muted)',
            }}
          >
            {t('view_only')}
          </span>
        ) : (
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              display: 'grid',
              placeItems: 'center',
              background: featured ? 'rgba(255,255,255,.18)' : 'var(--brand-soft)',
              color: featured ? '#fff' : 'var(--brand-600)',
            }}
          >
            <Icon name="wallet" style={{ width: 16, height: 16 }} />
          </span>
        )}
      </div>
      <div
        className="tnum"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 30,
          marginTop: 18,
          letterSpacing: '-0.02em',
        }}
      >
        {fmtMoney(w.balance, w.symbol)}
      </div>
    </div>
  );
}
