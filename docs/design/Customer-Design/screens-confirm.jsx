/* Epay — İşlem Onay (OTP), başarı ekranı, İşlem Detay (Detay Modu) */
const { useState: useC, useEffect: useEffC } = React;

function Panel({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--brand-600)', marginBottom: 10 }}>{title}</div>
      <div className="card" style={{ padding: '6px 18px' }}>{children}</div>
    </div>
  );
}
function Row({ k, v }) {
  if (v === undefined || v === null || v === '' || v === '—') return null;
  return <div className="kv"><span className="k">{k}</span><span className="v">{v}</span></div>;
}

/* Onay Modu */
function ConfirmScreen({ draft, onApprove, onCancel, onEdit }) {
  const [otp, setOtp] = useC('');
  const [sending, setSending] = useC(false);
  const [secs, setSecs] = useC(58);
  const [showDecl, setShowDecl] = useC(false);
  const [declText, setDeclText] = useC('');
  const isCritical = draft.amount >= 20000 || draft.country === 'BAE'; // demo risk rule
  // Referans mount'ta bir kez üretilir; OTP sayacı her saniye re-render etse de değişmez
  const [ref] = useC(() => 'REF-' + Math.random().toString(36).slice(2, 8).toUpperCase());

  useEffC(() => { const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 0), 1000); return () => clearInterval(t); }, []);

  function approve() {
    if (otp.length < 6) return;
    if (isCritical && !showDecl) { setShowDecl(true); return; }
    setSending(true);
    setTimeout(() => onApprove({ ...draft, ref }), 1100);
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <button className="btn btn-quiet" onClick={onCancel} style={{ marginBottom: 10 }}><Icon name="left" style={{ width: 16, height: 16 }} /> Geri</button>
        <div className="page-head"><div>
          <div className="eyebrow">İşlem Onay</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>İşlemi onaylayın</h1>
          <p className="page-sub">Lütfen işlem özetini kontrol edin ve telefonunuza gelen tek kullanımlık kodu girin.</p>
        </div></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 22, alignItems: 'start' }}>
          <div>
            <Panel title="Gönderen">
              <Row k="Adı / Unvanı" v={DATA.customer.name} />
              <Row k="Müşteri No" v={DATA.customer.no} />
              <Row k="Cüzdan" v={(DATA.wallets.find(w => w.id === draft.src) || {}).no} />
            </Panel>
            <Panel title={draft.kind === 'receive' ? 'Hedef Hesap' : 'Alıcı'}>
              <Row k="Adı / Unvanı" v={draft.recipientName} />
              <Row k="Telefon" v={draft.phone} />
              <Row k="E-posta" v={draft.email} />
              <Row k="IBAN" v={draft.iban} />
              <Row k="Banka" v={draft.bank} />
              <Row k="Ülke" v={draft.country} />
            </Panel>
            <Panel title="İşlem ve Tutarlar">
              <Row k="Gönderilen Tutar" v={<span className="tnum">{DATA.fmt(draft.amount, draft.sym)}</span>} />
              <Row k="Toplam Ücret" v={<span className="tnum">{DATA.fmt(draft.fee, draft.sym)}</span>} />
              {draft.kind === 'intl' && <Row k="Döviz Kuru" v={<span className="tnum">1 {draft.srcCur} = {draft.fxRate.toLocaleString('tr-TR',{maximumFractionDigits:4})} {draft.dstCur}</span>} />}
              {draft.kind === 'intl' && <Row k="Alıcının Alacağı" v={<span className="tnum">{DATA.fmt(draft.net, draft.dstSym)}</span>} />}
              <div className="kv" style={{ borderTop: '1px solid var(--line)' }}><span className="k" style={{ fontWeight: 700, color: 'var(--ink)' }}>Ödenecek Toplam</span><span className="v tnum" style={{ fontSize: 17, color: 'var(--brand-700)' }}>{DATA.fmt(draft.total, draft.sym)}</span></div>
            </Panel>
            <Panel title="İşlem Detayları">
              <Row k="İşlem Türü" v={draft.title} />
              <Row k="Ödeme Türü" v={draft.purpose} />
              <Row k="Açıklama" v={draft.desc} />
              <Row k="İşlem Referans No" v={<span className="tnum">{ref}</span>} />
            </Panel>
          </div>

          {/* OTP card */}
          <div className="card card-pad" style={{ position: 'sticky', top: 92, textAlign: 'center' }}>
            <span style={{ width: 54, height: 54, borderRadius: 15, background: 'var(--brand-soft)', color: 'var(--brand-600)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><Icon name="shield" style={{ width: 26, height: 26 }} /></span>
            <h3 style={{ fontSize: 19 }}>Güvenlik Kodu</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: '7px 0 20px' }}>{DATA.customer.phone} numaralı telefona gönderilen 6 haneli kodu girin.</p>
            <OtpInput value={otp} onChange={setOtp} />
            <div style={{ fontSize: 12.5, color: 'var(--muted)', margin: '16px 0' }}>
              {secs > 0 ? <>Kod {secs} sn içinde yenilenebilir</> : <button className="btn btn-quiet" style={{ color: 'var(--brand-600)' }} onClick={() => setSecs(58)}><Icon name="refresh" style={{ width: 15, height: 15 }} /> Tekrar gönder</button>}
            </div>
            <button className="btn btn-primary btn-lg btn-block" disabled={otp.length < 6 || sending} onClick={approve}>
              {sending ? 'Onaylanıyor…' : <><Icon name="check" /> Onayla</>}
            </button>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-ghost btn-block" onClick={onEdit}><Icon name="edit" /> Düzenle</button>
              <button className="btn btn-ghost btn-block" onClick={onCancel}>İptal Et</button>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 14, lineHeight: 1.5 }}>Bu işlem için kimliğiniz doğrulanmaktadır. Kodu kimseyle paylaşmayın.</p>
          </div>
        </div>
      </div>

      {showDecl && (
        <Modal onClose={() => setShowDecl(false)} max={480}>
          <span style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--warn-soft)', color: 'var(--warn)', display: 'grid', placeItems: 'center', marginBottom: 14 }}><Icon name="info" style={{ width: 24, height: 24 }} /></span>
          <h3 style={{ fontSize: 20 }}>İşlem Beyanı</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: '8px 0 18px' }}>Bu işlem yüksek tutarlı/riskli olarak değerlendirildi. İşleme devam etmek için gönderim amacını kısaca beyan edin. Bu beyan işlem kaydına kalıcı olarak işlenir.</p>
          <Field label="Gönderim amacı / kaynağı" required><textarea className="textarea" style={{ minHeight: 90 }} value={declText} onChange={e => setDeclText(e.target.value)} placeholder="örn. Birikimlerimden aile desteği gönderiyorum." /></Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowDecl(false)}>Vazgeç</button>
            <button className="btn btn-primary" disabled={!declText.trim()} onClick={() => { setShowDecl(false); setSending(true); setTimeout(() => onApprove({ ...draft, ref, declaration: declText }), 1100); }}>Beyanı onayla & devam et</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* Başarı ekranı */
function SuccessScreen({ result, go }) {
  const intl = result.kind === 'intl';
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card" style={{ padding: '40px 34px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, var(--brand), var(--brand-300))' }}></div>
          <span style={{ width: 78, height: 78, borderRadius: '50%', background: 'var(--pos-soft)', color: 'var(--pos)', display: 'grid', placeItems: 'center', margin: '6px auto 18px', animation: 'pageIn .5s' }}>
            <Icon name="check" style={{ width: 40, height: 40, strokeWidth: 2.6 }} />
          </span>
          <h1 style={{ fontSize: 27 }}>İşlem başarıyla {intl ? 'başlatıldı!' : 'tamamlandı!'}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, margin: '10px 0 6px' }}>
            <strong className="tnum" style={{ color: 'var(--ink)' }}>{DATA.fmt(result.amount, result.sym)}</strong> {result.recipientName} adlı {result.kind === 'receive' ? 'hesabınıza' : 'alıcıya'} {intl ? 'gönderiliyor' : 'gönderildi'}.
          </p>
          {intl && <div style={{ display: 'inline-block', margin: '6px 0 4px' }}><StatusPill status="Sent" /></div>}
          <div style={{ background: 'var(--bg-2)', borderRadius: 14, padding: '14px 18px', margin: '20px 0', textAlign: 'left' }}>
            <Row k="İşlem Referans No" v={<span className="tnum">{result.ref}</span>} />
            <Row k="Ödenen Toplam" v={<span className="tnum">{DATA.fmt(result.total, result.sym)}</span>} />
            {intl && <Row k="Alıcının Alacağı" v={<span className="tnum">{DATA.fmt(result.net, result.dstSym)}</span>} />}
            <Row k="Durum" v={intl ? 'Partner’a iletildi, onay bekleniyor' : 'Tamamlandı'} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-block"><Icon name="download" /> Dekont İndir</button>
            <button className="btn btn-primary btn-block" onClick={() => go('home')}>Ana Sayfa</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Detay Modu — açılan işlem detayı (modal) */
function TxDetailModal({ tx, onClose }) {
  return (
    <Modal onClose={onClose} max={560}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
          <DirBadge dir={tx.dir} />
          <div><h3 style={{ fontSize: 19 }}>{tx.type}</h3><div className="tnum" style={{ fontSize: 12.5, color: 'var(--faint)' }}>{tx.id}</div></div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div style={{ textAlign: 'center', padding: '8px 0 18px' }}>
        <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, color: tx.dir === 'in' ? 'var(--pos)' : 'var(--ink)' }}>{tx.dir === 'in' ? '+' : '−'}{DATA.fmt(tx.amount, tx.sym)}</div>
        <div style={{ marginTop: 10 }}><StatusPill status={tx.status} /></div>
      </div>
      <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '6px 18px', border: '1px solid var(--line)' }}>
        <Row k="Tarih" v={<span className="tnum">{tx.date}</span>} />
        <Row k="İşlem Yönü" v={tx.dir === 'in' ? 'Para Girişi' : 'Para Çıkışı'} />
        <Row k="Karşı Taraf" v={tx.cp} />
        <Row k="Karşı Taraf No" v={<span className="tnum">{tx.cpNo}</span>} />
        <Row k="Karşı Hesap" v={<span className="tnum">{tx.iban !== '—' ? tx.iban : tx.acct}</span>} />
        {tx.country && <Row k="Ülke" v={tx.country} />}
        {tx.fx && <Row k="Döviz Kuru" v={<span className="tnum">{tx.fx}</span>} />}
        <Row k="Ödeme Türü" v={tx.purpose} />
        <Row k="Referans No" v={<span className="tnum">{tx.ref}</span>} />
        <Row k="İşlem Sonrası Bakiye" v={<span className="tnum">{DATA.fmt(tx.after, tx.sym)}</span>} />
        <Row k="Açıklama" v={tx.desc} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-ghost btn-block" onClick={onClose}><Icon name="left" style={{ width: 16, height: 16 }} /> Geri Dön</button>
        <button className="btn btn-primary btn-block" disabled={tx.status !== 'Completed'}><Icon name="download" /> Dekont İndir</button>
      </div>
    </Modal>
  );
}

Object.assign(window, { ConfirmScreen, SuccessScreen, TxDetailModal });
