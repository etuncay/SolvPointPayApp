import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';

const CARDS = [
  { to: '/send/recipients', icon: 'users' as const, title: 'Kayıtlı Kişilerim', desc: 'Kayıtlı alıcılara hızlı gönderim' },
  { to: '/send/domestic', icon: 'flag' as const, title: 'Yurt İçine', desc: 'Türkiye içi transfer' },
  { to: '/send/intl', icon: 'globe' as const, title: 'Yurt Dışına', desc: 'Döviz ile uluslararası transfer' },
];

export function SendHubPage() {
  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">Transfer</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              Para Gönder
            </h1>
            <p className="page-sub">Yalnızca kalıcı (CustomerPersistent) cüzdanlardan gönderim yapılabilir.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {CARDS.map((c) => (
            <Link key={c.to} to={c.to} className="card card-pad" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--brand-soft)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--brand-700)',
                  marginBottom: 14,
                }}
              >
                <Icon name={c.icon} />
              </span>
              <h3 className="card-title">{c.title}</h3>
              <p className="hint" style={{ marginTop: 8 }}>
                {c.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
