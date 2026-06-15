/* Epay — Giriş / 2FA */
const { useState: useL } = React;

function LoginScreen({ onLogin }) {
  const [step, setStep] = useL(1);
  const [id, setId] = useL('');
  const [pw, setPw] = useL('');
  const [otp, setOtp] = useL('');
  const [forgot, setForgot] = useL(false);

  const features = [
    { icon: 'send', t: 'Anında gönderim', d: 'Yurt içine ve yurt dışına dakikalar içinde para gönderin.' },
    { icon: 'globe', t: 'Şeffaf döviz kuru', d: 'Gönderim öncesi alıcının alacağı net tutarı görün.' },
    { icon: 'shield', t: 'Güvenli ve denetimli', d: 'KYC, OTP ve uçtan uca koruma ile her işlem güvende.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr' }} className="login-wrap">
      {/* brand / info panel */}
      <div style={{ background: 'linear-gradient(150deg, var(--brand-700) 0%, #08382F 60%, #06291F 100%)', color: '#fff', padding: '56px 56px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }} className="login-aside">
        <div style={{ position: 'absolute', right: -120, top: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }}></div>
        <div style={{ position: 'absolute', right: 40, bottom: -100, width: 280, height: 280, borderRadius: '50%', background: 'rgba(232,133,59,.12)' }}></div>
        <div className="brand" style={{ color: '#fff' }}><Logo size={42} /><span className="brand-name" style={{ fontSize: 24 }}>e<span style={{ color: 'var(--accent)' }}>pay</span></span></div>
        <div style={{ marginTop: 'auto', maxWidth: 440, position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7 }}>Müşteri Self-Servis</div>
          <h1 style={{ fontSize: 40, lineHeight: 1.05, marginTop: 14 }}>Paranız, <br />sizin kontrolünüzde.</h1>
          <p style={{ fontSize: 16, opacity: .82, marginTop: 16, lineHeight: 1.6 }}>Cüzdanlarınızı yönetin, para gönderin ve alın — hepsi tek, güvenli bir uygulamada.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 36 }}>
            {features.map(f => (
              <div key={f.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={f.icon} style={{ width: 21, height: 21 }} /></span>
                <div><div style={{ fontWeight: 700, fontSize: 15.5 }}>{f.t}</div><div style={{ opacity: .75, fontSize: 13.5, marginTop: 2 }}>{f.d}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 12.5, opacity: .6, position: 'relative' }}>© 2026 Epay Ödeme Hizmetleri A.Ş. · Lisanslı ödeme kuruluşu</div>
      </div>

      {/* form panel */}
      <div style={{ display: 'grid', placeItems: 'center', padding: '40px 32px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {!forgot ? (step === 1 ? (
            <>
              <h2 style={{ fontSize: 28 }}>Giriş yapın</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '8px 0 28px' }}>Müşteri/Kimlik numaranız ve parolanızla devam edin.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Müşteri No veya Kimlik No"><input className="input" value={id} onChange={e => setId(e.target.value)} placeholder="CUS-4827193" /></Field>
                <Field label="Parola"><div className="input-affix"><span className="pre"><Icon name="lock" style={{ width: 16, height: 16 }} /></span><input className="input" style={{ paddingLeft: 38 }} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" /></div></Field>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="checkbox" style={{ alignItems: 'center' }}><input type="checkbox" /><span className="checkbox-label">Beni hatırla</span></label>
                  <button className="btn btn-quiet" style={{ color: 'var(--brand-600)', padding: 4, fontSize: 13.5 }} onClick={() => setForgot(true)}>Parolamı unuttum</button>
                </div>
                <button className="btn btn-primary btn-lg btn-block" onClick={() => setStep(2)}>Devam et <Icon name="right" /></button>
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-quiet" onClick={() => setStep(1)} style={{ marginBottom: 14, padding: '6px 4px' }}><Icon name="left" style={{ width: 16, height: 16 }} /> Geri</button>
              <span style={{ width: 54, height: 54, borderRadius: 15, background: 'var(--brand-soft)', color: 'var(--brand-600)', display: 'grid', placeItems: 'center', marginBottom: 16 }}><Icon name="phone" style={{ width: 26, height: 26 }} /></span>
              <h2 style={{ fontSize: 28 }}>Doğrulama kodu</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '8px 0 28px' }}>{DATA.customer.phone} numaralı telefonunuza gönderilen 6 haneli kodu girin.</p>
              <OtpInput value={otp} onChange={setOtp} />
              <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 26 }} disabled={otp.length < 6} onClick={onLogin}><Icon name="check" /> Giriş yap</button>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 16 }}>Kod gelmedi mi? <button className="btn btn-quiet" style={{ color: 'var(--brand-600)', padding: 2 }}>Tekrar gönder</button></p>
            </>
          )) : (
            <>
              <button className="btn btn-quiet" onClick={() => setForgot(false)} style={{ marginBottom: 14, padding: '6px 4px' }}><Icon name="left" style={{ width: 16, height: 16 }} /> Girişe dön</button>
              <h2 style={{ fontSize: 28 }}>Parolanızı sıfırlayın</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '8px 0 28px' }}>E-posta adresinizi girin. Adres sistemde kayıtlıysa 2 saat geçerli, tek kullanımlık bir sıfırlama bağlantısı göndereceğiz.</p>
              <Field label="E-posta"><input className="input" placeholder="ornek@eposta.com" /></Field>
              <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 18 }} onClick={() => setForgot(false)}>Sıfırlama bağlantısı gönder</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
window.LoginScreen = LoginScreen;
