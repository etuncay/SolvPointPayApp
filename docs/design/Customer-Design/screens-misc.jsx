/* Epay — Para Yükle (bilgilendirme), Dilek/Şikâyet, Ayarlar */
const { useState: useM } = React;

/* ---- Para Yükle ---- */
function LoadMoneyScreen() {
  const steps = [
    { n: 1, t: 'Bankanıza gidin', d: 'İnternet/mobil bankacılık veya şubeden havale/EFT ekranını açın.' },
    { n: 2, t: 'Epay IBAN’ına gönderin', d: 'Aşağıdaki firma IBAN’ına yüklemek istediğiniz tutarı gönderin.' },
    { n: 3, t: 'Açıklamaya referansınızı yazın', d: 'Açıklama alanına size özel referans kodunuzu eksiksiz yazın.' },
    { n: 4, t: 'Bakiyeniz otomatik yansır', d: 'Tutar eşleştirildikten sonra cüzdanınıza yansır; bildirim alırsınız.' },
  ];
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 920 }}>
        <div className="page-head"><div>
          <div className="eyebrow">Para Yükle</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Cüzdanınıza nasıl bakiye yüklersiniz?</h1>
          <p className="page-sub">Güvenlik nedeniyle uygulama üzerinden doğrudan para yükleme yapılmaz. Yükleme, kendi banka hesabınızdan aşağıdaki <strong>firma IBAN’ına</strong> havale/EFT ile yapılır.</p>
        </div></div>

        <AlertBanner tone="info" icon="info">Tutarın doğru cüzdana yansıması için <strong>açıklama alanına size özel referans kodunuzu</strong> mutlaka yazın. Eksik/yanlış referans, yansımayı geciktirir.</AlertBanner>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map(s => (
              <div key={s.n} className="card" style={{ padding: '16px 18px', display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{s.n}</span>
                <div><div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{s.t}</div><div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 3 }}>{s.d}</div></div>
              </div>
            ))}
          </div>

          <div className="card card-pad" style={{ background: 'linear-gradient(150deg, var(--brand-700), var(--brand-500))', color: '#fff', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.16)', display: 'grid', placeItems: 'center' }}><Icon name="bank" style={{ width: 22, height: 22 }} /></span>
              <strong style={{ fontSize: 16 }}>Yükleme Talimatı</strong>
            </div>
            {[['Firma', 'Epay Ödeme Hizmetleri A.Ş.'], ['Banka', 'Garanti BBVA'], ['IBAN', 'TR33 0006 2000 0000 0012 3456 78'], ['Açıklama / Referans', 'EPAY-' + DATA.customer.no]].map(([k, v]) => (
              <div key={k} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                <div><div style={{ fontSize: 11.5, opacity: .75, fontWeight: 600 }}>{k}</div><div className="tnum" style={{ fontWeight: 700, marginTop: 3, fontSize: 14.5 }}>{v}</div></div>
                {(k === 'IBAN' || k.includes('Referans')) && <button className="icon-btn" style={{ background: 'rgba(255,255,255,.16)', border: 'none', color: '#fff', flexShrink: 0 }} title="Kopyala"><Icon name="copy" style={{ width: 16, height: 16 }} /></button>}
              </div>
            ))}
            <p style={{ fontSize: 12, opacity: .8, marginTop: 16, lineHeight: 1.55 }}>Bu IBAN ve referans size özeldir. Yalnızca kendi banka hesabınızdan gönderim yapın; üçüncü kişi hesabından gelen tutarlar iade edilebilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Dilek, Şikâyet ve Öneriler ---- */
function ComplaintScreen() {
  const [f, setF] = useM({ subject: '', type: 'Şikâyet', message: '', consent: false, files: [] });
  const [sent, setSent] = useM(null);
  const valid = f.subject.trim() && f.message.trim() && f.consent;

  if (sent) return (
    <div className="page"><div className="container" style={{ maxWidth: 560 }}>
      <div className="card" style={{ padding: '40px 34px', textAlign: 'center' }}>
        <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--pos-soft)', color: 'var(--pos)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}><Icon name="check" style={{ width: 38, height: 38, strokeWidth: 2.6 }} /></span>
        <h1 style={{ fontSize: 25 }}>Talebiniz alındı</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '10px 0 18px' }}>Talep numaranız <strong className="tnum" style={{ color: 'var(--ink)' }}>{sent}</strong>. Gelişmeler e-posta ve uygulama bildirimiyle paylaşılacaktır.</p>
        <button className="btn btn-primary" onClick={() => { setSent(null); setF({ subject: '', type: 'Şikâyet', message: '', consent: false, files: [] }); }}>Yeni talep oluştur</button>
      </div>
    </div></div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-head"><div>
          <div className="eyebrow">Destek</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Dilek, Şikâyet ve Öneriler</h1>
          <p className="page-sub">Görüş ve taleplerinizi iletin. Talebiniz Destek Merkezi tarafından değerlendirilir.</p>
        </div></div>

        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-grid">
            <Field label="Konu" required full><input className="input" value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} placeholder="Talebinizin konusu" /></Field>
            <Field label="İletişim Sebebi" required full><select className="select" value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>{DATA.complaintTypes.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Mesaj" required hint="TCKN ve kart numarası girişi güvenlik nedeniyle engellenir." full><textarea className="textarea" style={{ minHeight: 140 }} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} placeholder="Talebinizi detaylıca yazın…" /></Field>
          </div>

          <div>
            <button className="btn btn-ghost" onClick={() => setF({ ...f, files: [...f.files, 'belge-' + (f.files.length + 1) + '.pdf'] })}><Icon name="clip" /> Dosya Ekle</button>
            {f.files.length > 0 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{f.files.map((fl, i) => <span key={i} className="tag" style={{ background: 'var(--brand-soft)', color: 'var(--brand-700)', padding: '6px 12px' }}><Icon name="receipt" style={{ width: 13, height: 13 }} /> {fl} <button onClick={() => setF({ ...f, files: f.files.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}><Icon name="close" style={{ width: 12, height: 12 }} /></button></span>)}</div>}
          </div>

          <div style={{ background: 'var(--bg-2)', borderRadius: 12, padding: '14px 16px' }}>
            <label className="checkbox"><input type="checkbox" checked={f.consent} onChange={e => setF({ ...f, consent: e.target.checked })} /><span className="checkbox-label">Aydınlatma metnini okudum ve onaylıyorum.</span></label>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, marginLeft: 31, lineHeight: 1.5 }}>Bu onay, talep/şikâyetin işlenmesi için bilgilendirme teyididir; pazarlama vb. amaçlı ayrı rıza burada alınmaz.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setF({ subject: '', type: 'Şikâyet', message: '', consent: false, files: [] })}>Temizle</button>
            <button className="btn btn-primary" disabled={!valid} onClick={() => setSent('CASE-' + Math.floor(100000 + Math.random() * 900000))}><Icon name="send" /> Gönder</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoadMoneyScreen, ComplaintScreen });
