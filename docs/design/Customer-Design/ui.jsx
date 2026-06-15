/* Epay — shared UI components */
const { useState, useRef, useEffect } = React;

function Logo({ size = 38 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 7.5C6 6.7 6.7 6 7.5 6H18v3H9v2.5h7.5v3H9V17h9v3H7.5C6.7 20 6 19.3 6 18.5V7.5z" fill="#fff"/>
        <circle cx="17" cy="17.5" r="3" fill="var(--accent)"/>
      </svg>
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    Completed: { cls: 'pill-completed', label: 'Tamamlandı' },
    Pending: { cls: 'pill-pending', label: 'Onay Bekliyor' },
    Sent: { cls: 'pill-sent', label: 'İletildi' },
    ErrorSend: { cls: 'pill-error', label: 'Gönderim Hatası' },
    ErrorReceive: { cls: 'pill-error', label: 'Alım Hatası' },
  };
  const m = map[status] || map.Pending;
  return <span className={'pill ' + m.cls}><span className="pdot"></span>{m.label}</span>;
}

function DirBadge({ dir }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', flexShrink: 0,
        background: dir === 'in' ? 'var(--pos-soft)' : 'var(--bg-2)', color: dir === 'in' ? 'var(--pos)' : 'var(--ink-2)' }}>
        <Icon name={dir === 'in' ? 'arrowDownLeft' : 'arrowUpRight'} style={{ width: 16, height: 16 }} />
      </span>
    </span>
  );
}

function Field({ label, required, hint, children, full }) {
  return (
    <div className={'field' + (full ? ' full' : '')}>
      {label && <label className="label">{label}{required && <span className="req">*</span>}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

function Modal({ onClose, children, max = 460 }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  return (
    <div className="modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="modal" style={{ maxWidth: max }} onMouseDown={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* OTP input — 6 boxes */
function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.padEnd(6).split('').slice(0, 6);
  function set(i, v) {
    v = v.replace(/\D/g, '').slice(-1);
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = v || ' ';
    onChange(arr.join('').replace(/ /g, ''));
    if (v && i < 5) refs.current[i + 1] && refs.current[i + 1].focus();
  }
  function keyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1] && refs.current[i - 1].focus();
  }
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={el => refs.current[i] = el} inputMode="numeric" maxLength={1}
          value={digits[i].trim()} onChange={e => set(i, e.target.value)} onKeyDown={e => keyDown(i, e)}
          style={{ width: 50, height: 60, textAlign: 'center', fontSize: 26, fontWeight: 700,
            fontFamily: 'var(--font-display)', borderRadius: 13, border: '1.5px solid var(--line-strong)',
            background: 'var(--surface)', color: 'var(--ink)', outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--brand-500) 16%, transparent)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--line-strong)'; e.target.style.boxShadow = 'none'; }} />
      ))}
    </div>
  );
}

/* Alert banner (per docs: warnings at top, pink-bg/maroon text style) */
function AlertBanner({ tone = 'warn', icon = 'warn', children, onClose }) {
  const tones = {
    warn: { bg: 'var(--warn-soft)', fg: 'var(--warn)', bd: 'color-mix(in srgb, var(--warn) 30%, transparent)' },
    info: { bg: 'var(--info-soft)', fg: 'var(--info)', bd: 'color-mix(in srgb, var(--info) 26%, transparent)' },
    error: { bg: 'var(--neg-soft)', fg: 'var(--neg)', bd: 'color-mix(in srgb, var(--neg) 28%, transparent)' },
  };
  const c = tones[tone];
  return (
    <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', background: c.bg, color: c.fg,
      border: '1px solid ' + c.bd, borderRadius: 'var(--r-md)', padding: '13px 16px', marginBottom: 18, fontSize: 14 }}>
      <Icon name={icon} style={{ width: 19, height: 19, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, lineHeight: 1.5 }}>{children}</div>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.fg, cursor: 'pointer', opacity: .7, padding: 2 }}><Icon name="close" style={{ width: 16, height: 16 }} /></button>}
    </div>
  );
}

/* ===== Header with top menu ===== */
const NAV = [
  { key: 'home', label: 'Ana Sayfa', icon: 'home' },
  { key: 'activity', label: 'Hesap Hareketleri', icon: 'activity' },
  { key: 'topup', label: 'Para Yükle', icon: 'topup' },
  { key: 'send', label: 'Para Gönder', icon: 'send', children: [
    { key: 'recipients', label: 'Kayıtlı Kişilerim', icon: 'users', desc: 'Hızlı gönderim için kayıtlı alıcılar' },
    { key: 'domestic', label: 'Yurt İçine', icon: 'flag', desc: 'Türkiye içindeki kişilere gönderin' },
    { key: 'intl', label: 'Yurt Dışına', icon: 'globe', desc: 'Döviz dönüşümü ile uluslararası' },
  ]},
  { key: 'receive', label: 'Para Al', icon: 'receive' },
  { key: 'complaint', label: 'Dilek & Şikâyet', icon: 'complaint' },
];

function Header({ route, go, theme, toggleTheme, lang, setLang }) {
  const [open, setOpen] = useState(null);
  const popRef = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(null); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  const sendActive = ['send','recipients','domestic','intl'].includes(route);

  return (
    <header className="hdr">
      <div className="container hdr-inner">
        <a className="brand" onClick={() => go('home')} style={{ cursor: 'pointer' }}>
          <Logo />
          <span className="brand-name">e<span>pay</span></span>
        </a>

        <nav className="nav" ref={popRef}>
          {NAV.map(item => {
            const isActive = item.key === 'send' ? sendActive : route === item.key;
            if (item.children) {
              return (
                <div key={item.key} style={{ position: 'relative' }}>
                  <button className={'nav-item' + (isActive ? ' active' : '') + (open === item.key ? ' open' : '')}
                    onClick={() => setOpen(open === item.key ? null : item.key)}>
                    <Icon name={item.icon} /> {item.label}
                    <Icon name="chevron" style={{ width: 13, height: 13, opacity: .6 }} />
                  </button>
                  {open === item.key && (
                    <div className="nav-pop">
                      {item.children.map(c => (
                        <button key={c.key} className="pop-item" onClick={() => { go(c.key); setOpen(null); }}>
                          <span className="pi"><Icon name={c.icon} /></span>
                          <span><h5>{c.label}</h5><p>{c.desc}</p></span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button key={item.key} className={'nav-item' + (isActive ? ' active' : '')} onClick={() => go(item.key)}>
                <Icon name={item.icon} /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hdr-actions">
          <button className="icon-btn" title={lang} onClick={() => setLang(lang === 'TR' ? 'EN' : 'TR')}
            style={{ fontWeight: 700, fontSize: 13, width: 'auto', padding: '0 12px', gap: 6 }}>
            <Icon name="globe" style={{ width: 17, height: 17 }} /> {lang}
          </button>
          <button className="icon-btn" title="Tema" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button className="icon-btn" title="Bildirimler" onClick={() => go('home')}>
            <Icon name="bell" /><span className="dot"></span>
          </button>
          <button className="icon-btn" title="Ayarlar" onClick={() => go('settings')}>
            <Icon name="settings" />
          </button>
          <button className="avatar" title={DATA.customer.name} onClick={() => go('settings')}>{DATA.customer.initials}</button>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Logo, StatusPill, DirBadge, Field, Modal, OtpInput, AlertBanner, Header, NAV });
