/* Epay — Ayarlar (çok bölümlü) */
const { useState: useSet } = React;

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 46, height: 27, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: on ? 'var(--brand)' : 'var(--line-strong)', position: 'relative', transition: 'background .18s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }}></span>
    </button>
  );
}
function SettingsCard({ title, desc, children }) {
  return (
    <div className="card card-pad" style={{ marginBottom: 18 }}>
      <div style={{ marginBottom: 18 }}><h3 className="card-title">{title}</h3>{desc && <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 4 }}>{desc}</p>}</div>
      {children}
    </div>
  );
}
function PrefRow({ icon, title, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
      {icon && <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-soft)', color: 'var(--brand-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={icon} style={{ width: 18, height: 18 }} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14.5 }}>{title}</div>{desc && <div style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 2 }}>{desc}</div>}</div>
      {children}
    </div>
  );
}

const SETTINGS_NAV = [
  { key: 'profile', label: 'Kişisel Bilgiler', icon: 'user' },
  { key: 'security', label: 'Güvenlik & Parola', icon: 'lock' },
  { key: 'contact', label: 'İletişim & Adres', icon: 'mail' },
  { key: 'limits', label: 'Transfer Limitleri', icon: 'shield' },
  { key: 'notif', label: 'Bildirim Tercihleri', icon: 'bell' },
  { key: 'app', label: 'Uygulama Ayarları', icon: 'settings' },
  { key: 'receipts', label: 'Dekontlarım', icon: 'receipt' },
];

function SettingsScreen({ theme, toggleTheme, lang, setLang, textSize, setTextSize }) {
  const [sec, setSec] = useSet('profile');
  const [notif, setNotif] = useSet({ in: true, out: true, balance: false });
  const [limits, setLimits] = useSet({ daily: '50000', internet: '25000' });

  return (
    <div className="page">
      <div className="container">
        <div className="page-head"><div>
          <div className="eyebrow">Hesabım</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Ayarlar</h1>
        </div></div>

        <div style={{ display: 'grid', gridTemplateColumns: '248px 1fr', gap: 24, alignItems: 'start' }}>
          {/* settings nav */}
          <div className="card" style={{ padding: 8, position: 'sticky', top: 92 }}>
            {SETTINGS_NAV.map(s => (
              <button key={s.key} onClick={() => setSec(s.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 600,
                background: sec === s.key ? 'var(--brand-soft)' : 'transparent', color: sec === s.key ? 'var(--brand-700)' : 'var(--ink-2)' }}>
                <Icon name={s.icon} style={{ width: 18, height: 18 }} /> {s.label}
              </button>
            ))}
          </div>

          <div>
            {sec === 'profile' && (<>
              <div className="card card-pad" style={{ marginBottom: 18, display: 'flex', gap: 18, alignItems: 'center' }}>
                <span className="avatar" style={{ width: 64, height: 64, borderRadius: 18, fontSize: 24 }}>{DATA.customer.initials}</span>
                <div><h3 style={{ fontSize: 21 }}>{DATA.customer.name}</h3><div className="tnum" style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 3 }}>Müşteri No: {DATA.customer.no}</div><span className="pill pill-completed" style={{ marginTop: 8 }}><Icon name="shield" style={{ width: 13, height: 13 }} /> KYC Seviye 2 · Doğrulanmış</span></div>
              </div>
              <SettingsCard title="Kişisel Bilgiler" desc="Bu bilgiler beyanınızdır ve risk değerlendirmesinde kullanılabilir.">
                <div className="form-grid">
                  <Field label="Toplam Aylık Gelir"><div className="input-affix"><span className="pre">₺</span><input className="input" style={{ paddingLeft: 30 }} defaultValue="35.000" /></div></Field>
                  <Field label="Eğitim Durumu"><select className="select" defaultValue="Lisans"><option>İlköğretim</option><option>Lise</option><option>Lisans</option><option>Yüksek Lisans</option></select></Field>
                  <Field label="Çalışma Durumu"><select className="select"><option>Ücretli Çalışan</option><option>Serbest Meslek</option><option>İşveren</option><option>Emekli</option></select></Field>
                  <Field label="Mesleğim"><input className="input" defaultValue="Yazılım Mühendisi" /></Field>
                  <Field label="İş Yerim" full><input className="input" defaultValue="ACME Yazılım A.Ş." /></Field>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}><button className="btn btn-primary"><Icon name="check" /> Kaydet</button></div>
              </SettingsCard>
            </>)}

            {sec === 'security' && (<>
              <SettingsCard title="Parola Değiştir" desc="Parola değişikliği sonrası mevcut oturumunuz sonlandırılır.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
                  <Field label="Eski Parola" required><input className="input" type="password" defaultValue="••••••••" /></Field>
                  <Field label="Yeni Parola" required><input className="input" type="password" /></Field>
                  <Field label="Yeni Parola (Tekrar)" required><input className="input" type="password" /></Field>
                  <Field label="Güncelleme Sıklığı"><select className="select"><option>1 ayda bir</option><option>3 ayda bir</option><option>6 ayda bir</option></select></Field>
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Icon name="lock" /> Parolayı Güncelle</button>
                </div>
              </SettingsCard>
              <SettingsCard title="Karşılama Mesajı" desc="Phishing önlemi: girişte size özel bu metni görmüyorsanız işlem yapmayın.">
                <div className="input-affix" style={{ maxWidth: 420 }}><span className="pre"><Icon name="shield" style={{ width: 16, height: 16 }} /></span><input className="input" style={{ paddingLeft: 38 }} defaultValue={DATA.customer.welcome} /></div>
              </SettingsCard>
              <SettingsCard title="Son Hatalı Girişler">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[[DATA.customer.failedAttempt.when, DATA.customer.failedAttempt.city, DATA.customer.failedAttempt.ip]].map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--neg-soft)', color: 'var(--neg)', display: 'grid', placeItems: 'center' }}><Icon name="warn" style={{ width: 17, height: 17 }} /></span>
                      <div style={{ flex: 1 }}><div className="tnum" style={{ fontWeight: 600, fontSize: 14 }}>{r[0]}</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r[1]} · {r[2]}</div></div>
                      <span className="pill pill-error">Başarısız</span>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            </>)}

            {sec === 'contact' && (<>
              <SettingsCard title="İletişim Bilgileri" desc="E-posta ve telefonunuzu doğrulayın. Bu bilgiler size özeldir, başka müşteride kullanılamaz.">
                <PrefRow icon="mail" title={DATA.customer.email} desc="Asıl kanal · Doğrulandı"><span className="pill pill-completed"><Icon name="check" style={{ width: 13, height: 13 }} /> Doğrulandı</span></PrefRow>
                <PrefRow icon="phone" title={DATA.customer.phone} desc="Asıl kanal · OTP ile doğrulandı"><span className="pill pill-completed"><Icon name="check" style={{ width: 13, height: 13 }} /> Doğrulandı</span></PrefRow>
                <div style={{ marginTop: 16 }}><button className="btn btn-ghost"><Icon name="plus" /> İletişim bilgisi ekle</button></div>
              </SettingsCard>
              <SettingsCard title="Adresler">
                <PrefRow icon="home" title="Ev Adresi" desc="Bağdat Cd. No:124 D:7, Kadıköy / İstanbul"><button className="icon-btn"><Icon name="edit" /></button></PrefRow>
                <div style={{ marginTop: 16 }}><button className="btn btn-ghost"><Icon name="plus" /> Adres ekle</button></div>
              </SettingsCard>
            </>)}

            {sec === 'limits' && (
              <SettingsCard title="Para Transfer Limitleri" desc="Belirlediğiniz limitler kurum ve risk bazlı üst limitleri aşamaz; en kısıtlayıcı değer uygulanır.">
                <AlertBanner tone="info" icon="info">Kurumsal üst limit: günlük <strong>₺100.000</strong>. Aşağıdaki değerler bu sınırın altında olmalıdır.</AlertBanner>
                <div className="form-grid">
                  <Field label="Günlük Transfer Limiti" hint="Tüm kanallar"><div className="input-affix"><span className="pre">₺</span><input className="input tnum" style={{ paddingLeft: 30 }} value={limits.daily} onChange={e => setLimits({ ...limits, daily: e.target.value.replace(/\D/g, '') })} /></div></Field>
                  <Field label="İnternet Günlük Transfer Limiti" hint="Self-servis kanal"><div className="input-affix"><span className="pre">₺</span><input className="input tnum" style={{ paddingLeft: 30 }} value={limits.internet} onChange={e => setLimits({ ...limits, internet: e.target.value.replace(/\D/g, '') })} /></div></Field>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}><button className="btn btn-primary"><Icon name="check" /> Limitleri Güncelle</button></div>
              </SettingsCard>
            )}

            {sec === 'notif' && (
              <SettingsCard title="Mobil Bildirim Tercihleri" desc="Yalnızca opsiyonel bildirimleri etkiler. Güvenlik ve mevzuat bildirimleri her durumda gönderilir.">
                <PrefRow icon="arrowDownLeft" title="Para Girişi" desc="Cüzdanınıza para geldiğinde"><Toggle on={notif.in} onChange={v => setNotif({ ...notif, in: v })} /></PrefRow>
                <PrefRow icon="arrowUpRight" title="Para Çıkışı" desc="Cüzdanınızdan para çıktığında"><Toggle on={notif.out} onChange={v => setNotif({ ...notif, out: v })} /></PrefRow>
                <PrefRow icon="wallet" title="Düşük Bakiye" desc="Bakiye belirlenen tutarın altına inerse"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{notif.balance && <div className="input-affix" style={{ width: 130 }}><span className="pre">₺</span><input className="input tnum" style={{ paddingLeft: 28, padding: '8px 10px 8px 28px' }} defaultValue="1.000" /></div>}<Toggle on={notif.balance} onChange={v => setNotif({ ...notif, balance: v })} /></div></PrefRow>
              </SettingsCard>
            )}

            {sec === 'app' && (
              <SettingsCard title="Uygulama Ayarları" desc="Görünüm ve erişilebilirlik tercihleri.">
                <PrefRow icon="globe" title="Dil Tercihi" desc="Türkçe, İngilizce, Arapça">
                  <select className="select" style={{ width: 160 }} value={lang} onChange={e => setLang(e.target.value)}><option value="TR">Türkçe</option><option value="EN">English</option><option value="AR">العربية</option></select>
                </PrefRow>
                <PrefRow icon={theme === 'dark' ? 'moon' : 'sun'} title="Tema" desc="Açık / Koyu görünüm">
                  <div style={{ display: 'flex', gap: 6, background: 'var(--bg-2)', padding: 4, borderRadius: 10 }}>
                    {[['light', 'sun', 'Açık'], ['dark', 'moon', 'Koyu']].map(([k, ic, l]) => (
                      <button key={k} onClick={() => { if (theme !== k) toggleTheme(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', borderRadius: 7, padding: '7px 12px', fontSize: 13, fontWeight: 700, background: theme === k ? 'var(--surface)' : 'transparent', color: theme === k ? 'var(--ink)' : 'var(--muted)', boxShadow: theme === k ? 'var(--shadow-sm)' : 'none' }}><Icon name={ic} style={{ width: 15, height: 15 }} /> {l}</button>
                    ))}
                  </div>
                </PrefRow>
                <PrefRow icon="sparkle" title="Metin Boyutu" desc="Okunabilirlik için yazı ölçeği">
                  <div style={{ display: 'flex', gap: 6, background: 'var(--bg-2)', padding: 4, borderRadius: 10 }}>
                    {[['s', 'Küçük'], ['m', 'Standart'], ['l', 'Büyük'], ['xl', 'XL']].map(([k, l]) => (
                      <button key={k} onClick={() => setTextSize(k)} style={{ border: 'none', cursor: 'pointer', borderRadius: 7, padding: '7px 11px', fontSize: 13, fontWeight: 700, background: textSize === k ? 'var(--surface)' : 'transparent', color: textSize === k ? 'var(--ink)' : 'var(--muted)', boxShadow: textSize === k ? 'var(--shadow-sm)' : 'none' }}>{l}</button>
                    ))}
                  </div>
                </PrefRow>
              </SettingsCard>
            )}

            {sec === 'receipts' && (
              <SettingsCard title="Dekontlarım" desc="Tamamlanan işlemlerinizin dekontlarını indirin.">
                <div className="table-wrap" style={{ boxShadow: 'none' }}>
                  <table className="tbl"><thead><tr><th>İşlem No</th><th>Tarih</th><th style={{ textAlign: 'right' }}>Tutar</th><th></th></tr></thead>
                    <tbody>{DATA.tx.filter(t => t.status === 'Completed').map(t => (
                      <tr key={t.id} style={{ cursor: 'default' }}><td className="tnum">{t.id}</td><td className="tnum">{t.date}</td><td className="tnum" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}>{DATA.fmt(t.amount, t.sym)}</td><td style={{ textAlign: 'right' }}><button className="btn btn-soft" style={{ padding: '7px 14px' }}><Icon name="download" style={{ width: 15, height: 15 }} /> Dekont</button></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              </SettingsCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
