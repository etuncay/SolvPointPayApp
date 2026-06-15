/* Epay — Home dashboard + Account Activity */
const { useState: useStateH } = React;

function WalletCard({ w, featured, onClick }) {
  const ro = !w.editable;
  return (
    <div className="card" onClick={onClick} style={{
      padding: '20px 22px', cursor: onClick ? 'pointer' : 'default',
      borderColor: featured ? 'transparent' : 'var(--line)',
      background: featured ? 'linear-gradient(135deg, var(--brand-700), var(--brand-500))' : 'var(--surface)',
      color: featured ? '#fff' : 'var(--ink)', position: 'relative', overflow: 'hidden',
      boxShadow: featured ? 'var(--shadow-md)' : 'var(--shadow-sm)', minWidth: 0,
    }}>
      {featured && <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }}></div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, opacity: featured ? .92 : 1, color: featured ? '#fff' : 'var(--ink)' }}>{w.label}</div>
          <div className="tnum" style={{ fontSize: 12, opacity: featured ? .7 : .6, marginTop: 2, color: featured ? '#fff' : 'var(--muted)' }}>{w.no} · {w.currency}</div>
        </div>
        {ro
          ? <span className="tag" style={{ background: featured ? 'rgba(255,255,255,.18)' : 'var(--bg-2)', color: featured ? '#fff' : 'var(--muted)' }}>Sadece görüntüleme</span>
          : <span style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', background: featured ? 'rgba(255,255,255,.18)' : 'var(--brand-soft)', color: featured ? '#fff' : 'var(--brand-600)' }}><Icon name="wallet" style={{ width: 16, height: 16 }} /></span>}
      </div>
      <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, marginTop: 18, letterSpacing: '-.02em' }}>
        {DATA.fmt(w.balance, w.symbol)}
      </div>
    </div>
  );
}

function HomeScreen({ go, openTx }) {
  const d = DATA;
  const persistent = d.wallets.filter(w => w.editable);
  const recent = d.tx.slice(0, 7);
  const [showFail, setShowFail] = useStateH(true);

  return (
    <div className="page">
      <div className="container">
        {showFail && (
          <AlertBanner tone="warn" icon="shield" onClose={() => setShowFail(false)}>
            Son başarılı girişinizden sonra <strong>1 başarısız erişim denemesi</strong> tespit edildi — {d.customer.failedAttempt.when}, {d.customer.failedAttempt.city} ({d.customer.failedAttempt.ip}). Siz değilseniz parolanızı değiştirin.
          </AlertBanner>
        )}

        <div className="page-head">
          <div>
            <div className="eyebrow">Hoş geldiniz</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>Merhaba, {d.customer.name.split(' ')[0]} 👋</h1>
            <p className="page-sub">Karşılama anahtarınız: <strong style={{ color: 'var(--ink)' }}>“{d.customer.welcome}”</strong> — bu metni görmüyorsanız sayfayı kapatın.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-soft" onClick={() => go('receive')}><Icon name="receive" /> Para Al</button>
            <button className="btn btn-primary" onClick={() => go('send')}><Icon name="send" /> Para Gönder</button>
          </div>
        </div>

        {/* Balances */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 28 }}>
          {persistent.map((w, i) => <WalletCard key={w.id} w={w} featured={i === 0} onClick={() => go('activity')} />)}
          {d.wallets.filter(w => !w.editable).map(w => <WalletCard key={w.id} w={w} />)}
        </div>

        {/* Quick actions + recent */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          <div className="card card-pad">
            <div className="card-head">
              <h3 className="card-title">Son Hesap Hareketleri</h3>
              <button className="btn btn-quiet" onClick={() => go('activity')}>Tümünü gör <Icon name="right" style={{ width: 15, height: 15 }} /></button>
            </div>
            <div className="table-wrap" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              <table className="tbl">
                <thead><tr>
                  <th style={{ width: 44 }}></th><th>İşlem</th><th>Karşı Taraf</th><th>Tarih</th><th>Durum</th><th style={{ textAlign: 'right' }}>Tutar</th>
                </tr></thead>
                <tbody>
                  {recent.map(t => (
                    <tr key={t.id} onClick={() => openTx(t)}>
                      <td><DirBadge dir={t.dir} /></td>
                      <td><div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.type}</div><div className="tnum" style={{ fontSize: 12, color: 'var(--faint)' }}>{t.id}</div></td>
                      <td>{t.cp}</td>
                      <td className="tnum" style={{ whiteSpace: 'nowrap' }}>{t.date.split(' ')[0]}</td>
                      <td><StatusPill status={t.status} /></td>
                      <td className="tnum" style={{ textAlign: 'right' }}><span className={t.dir === 'in' ? 'amt-in' : 'amt-out'}>{t.dir === 'in' ? '+' : '−'}{DATA.fmt(t.amount, t.sym)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Account Activity ===== */
function ActivityScreen({ openTx }) {
  const d = DATA;
  const [dir, setDir] = useStateH('all');
  const [q, setQ] = useStateH('');
  const [wallet, setWallet] = useStateH('all');

  let rows = d.tx;
  if (dir !== 'all') rows = rows.filter(t => t.dir === dir);
  if (q.trim()) { const s = q.toLowerCase(); rows = rows.filter(t => (t.cp + t.id + t.type + t.desc).toLowerCase().includes(s)); }

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">Hesabım</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>Hesap Hareketleri</h1>
            <p className="page-sub">Tüm cüzdanlarınızdaki para giriş ve çıkışlarını görüntüleyin, filtreleyin ve dekontlarınızı indirin.</p>
          </div>
        </div>

        {/* balance strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
          {d.wallets.filter(w => w.editable).map((w, i) => <WalletCard key={w.id} w={w} featured={i === 0} />)}
        </div>

        {/* filters */}
        <div className="card card-pad" style={{ marginBottom: 18, padding: '16px 18px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="input-affix" style={{ flex: '1 1 260px' }}>
              <span className="pre"><Icon name="search" style={{ width: 17, height: 17 }} /></span>
              <input className="input" style={{ paddingLeft: 40 }} placeholder="İşlem no, karşı taraf, açıklama ara…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg-2)', padding: 4, borderRadius: 11 }}>
              {[['all','Tümü'],['in','Para Girişi'],['out','Para Çıkışı']].map(([k,l]) => (
                <button key={k} onClick={() => setDir(k)} style={{
                  border: 'none', cursor: 'pointer', borderRadius: 8, padding: '8px 14px', fontSize: 13.5, fontWeight: 700,
                  background: dir === k ? 'var(--surface)' : 'transparent', color: dir === k ? 'var(--ink)' : 'var(--muted)',
                  boxShadow: dir === k ? 'var(--shadow-sm)' : 'none' }}>{l}</button>
              ))}
            </div>
            <button className="btn btn-ghost"><Icon name="filter" /> Gelişmiş filtre</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="tbl">
            <thead><tr>
              <th style={{ width: 44 }}></th><th>İşlem No / Tür</th><th>Karşı Taraf</th><th>Karşı Hesap</th><th>Tarih</th><th>Durum</th><th style={{ textAlign: 'right' }}>Tutar</th><th style={{ textAlign: 'right' }}>Sonrası Bakiye</th>
            </tr></thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id} onClick={() => openTx(t)}>
                  <td><DirBadge dir={t.dir} /></td>
                  <td><div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.type}</div><div className="tnum" style={{ fontSize: 12, color: 'var(--faint)' }}>{t.id}</div></td>
                  <td>{t.cp}<div className="tnum" style={{ fontSize: 12, color: 'var(--faint)' }}>{t.cpNo}</div></td>
                  <td className="tnum" style={{ fontSize: 13 }}>{t.iban !== '—' ? t.iban : t.acct}</td>
                  <td className="tnum" style={{ whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td><StatusPill status={t.status} /></td>
                  <td className="tnum" style={{ textAlign: 'right' }}><span className={t.dir === 'in' ? 'amt-in' : 'amt-out'}>{t.dir === 'in' ? '+' : '−'}{DATA.fmt(t.amount, t.sym)}</span></td>
                  <td className="tnum" style={{ textAlign: 'right', color: 'var(--muted)' }}>{DATA.fmt(t.after, t.sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty">Filtrelerinize uygun hareket bulunamadı.</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WalletCard, HomeScreen, ActivityScreen });
