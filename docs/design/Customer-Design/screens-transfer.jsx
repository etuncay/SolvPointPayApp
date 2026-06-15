/* Epay — Yurt İçi / Yurt Dışı transfer formları + Para Al */
const { useState: useT } = React;

function MoneyInput({ value, onChange, sym }) {
  return (
    <div className="input-affix">
      <span className="pre" style={{ fontSize: 18 }}>{sym}</span>
      <input className="input tnum" style={{ paddingLeft: 36, fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', height: 60 }}
        inputMode="decimal" value={value} onChange={e => onChange(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="0,00" />
    </div>
  );
}

/* ---- Yurt İçine ---- */
function DomesticForm({ prefill, onReview }) {
  const [f, setF] = useT({
    src: 'w1', name: prefill?.name || '', phone: prefill?.phone || '', email: prefill?.email || '',
    currency: 'TRY', amount: '', purpose: prefill?.purpose || 'Aile Desteği', desc: prefill?.desc || '', save: false,
  });
  const cur = DATA.currencies.find(c => c.code === f.currency);
  const amt = parseFloat(String(f.amount).replace('.', '').replace(',', '.')) || 0;
  const fee = amt > 0 ? Math.max(amt * 0.002, amt > 5000 ? 5 : 0) : 0;
  const valid = f.name.trim() && amt > 0;

  function review() {
    onReview({
      kind: 'domestic', title: 'Yurt İçi Transfer', recipientName: f.name, phone: f.phone, email: f.email,
      country: 'Türkiye', currency: f.currency, sym: cur.sym, amount: amt, fee, total: amt + fee,
      purpose: f.purpose, desc: f.desc, save: f.save, src: f.src,
    });
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 940 }}>
        <div className="page-head"><div>
          <div className="eyebrow">Para Gönder · Yurt İçine</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Yurt içine para gönder</h1>
        </div></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Field label="Hangi cüzdandan?" required><SourceWalletPicker value={f.src} onChange={v => setF({ ...f, src: v })} /></Field>
            <hr className="divider" />
            <div className="form-grid">
              <Field label="Alıcı Adı Soyadı / Unvanı" required full><input className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="örn. Burak Yıldız" /></Field>
              <Field label="Alıcı Telefon"><input className="input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="+90 ..." /></Field>
              <Field label="Alıcı E-posta"><input className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
              <Field label="Para Birimi" required><select className="select" value={f.currency} onChange={e => setF({ ...f, currency: e.target.value })}>{DATA.currencies.filter(c=>c.code!=='GBP').map(c => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}</select></Field>
              <Field label="Ödeme Türü" required><select className="select" value={f.purpose} onChange={e => setF({ ...f, purpose: e.target.value })}>{DATA.purposes.map(p => <option key={p}>{p}</option>)}</select></Field>
              <Field label="Tutar" required full><MoneyInput value={f.amount} onChange={v => setF({ ...f, amount: v })} sym={cur.sym} /></Field>
              <Field label="İşlem Açıklaması" hint="TCKN ve kart numarası girişi güvenlik nedeniyle engellenir." full><textarea className="textarea" style={{ minHeight: 80 }} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="örn. Kira ödemesi" /></Field>
            </div>
            <label className="checkbox"><input type="checkbox" checked={f.save} onChange={e => setF({ ...f, save: e.target.checked })} /><span className="checkbox-label">Bu kişiyi <strong>Kayıtlı Kişilerime</strong> ekle</span></label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 92 }}>
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Özet</h3>
              <div className="kv"><span className="k">Gönderilen tutar</span><span className="v tnum">{DATA.fmt(amt, cur.sym)}</span></div>
              <div className="kv"><span className="k">Toplam ücret</span><span className="v tnum">{DATA.fmt(fee, cur.sym)}</span></div>
              <div className="kv" style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 12 }}><span className="k" style={{ fontWeight: 700, color: 'var(--ink)' }}>Ödenecek toplam</span><span className="v tnum" style={{ fontSize: 17, color: 'var(--brand-700)' }}>{DATA.fmt(amt + fee, cur.sym)}</span></div>
              <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 18 }} disabled={!valid} onClick={review}>Devam et <Icon name="right" /></button>
              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 10, display: 'flex', gap: 6, justifyContent: 'center' }}><Icon name="lock" style={{ width: 14, height: 14 }} /> İşlem OTP ile onaylanır</p>
            </div>
            <FeeTable />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Yurt Dışına (FX) ---- */
function IntlForm({ prefill, onReview }) {
  const [f, setF] = useT({
    src: 'w1', name: prefill?.name || '', country: prefill?.country && prefill.country !== 'Türkiye' ? prefill.country : 'Almanya',
    phone: prefill?.phone || '', email: prefill?.email || '', srcCur: 'TRY', dstCur: 'EUR', amount: '',
    purpose: prefill?.purpose || 'Aile Desteği', desc: prefill?.desc || '', save: false,
  });
  const srcC = DATA.currencies.find(c => c.code === f.srcCur);
  const dstC = DATA.currencies.find(c => c.code === f.dstCur);
  const amt = parseFloat(String(f.amount).replace('.', '').replace(',', '.')) || 0;
  const rateKey = f.srcCur + '>' + f.dstCur;
  const rate = f.srcCur === f.dstCur ? 1 : (DATA.fxRates[rateKey] || 1);
  const net = amt * rate;
  const fee = amt > 0 ? Math.max(amt * 0.0025, 5) : 0;
  const valid = f.name.trim() && f.country && amt > 0;
  const risky = ['BAE', 'Suudi Arabistan'].includes(f.country);

  function review() {
    onReview({
      kind: 'intl', title: 'Yurt Dışı Transfer', recipientName: f.name, phone: f.phone, email: f.email,
      country: f.country, currency: f.srcCur, sym: srcC.sym, amount: amt, fee, total: amt + fee,
      srcCur: f.srcCur, dstCur: f.dstCur, fxRate: rate, net, dstSym: dstC.sym,
      purpose: f.purpose, desc: f.desc, save: f.save, src: f.src,
    });
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 940 }}>
        <div className="page-head"><div>
          <div className="eyebrow">Para Gönder · Yurt Dışına</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Yurt dışına para gönder</h1>
        </div></div>

        {risky && <AlertBanner tone="warn" icon="warn">Seçtiğiniz ülke (<strong>{f.country}</strong>) için ilave kontroller uygulanabilir; işlem onay havuzuna düşebilir.</AlertBanner>}

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
          <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Field label="Hangi cüzdandan?" required><SourceWalletPicker value={f.src} onChange={v => setF({ ...f, src: v })} /></Field>
            <hr className="divider" />
            <div className="form-grid">
              <Field label="Alıcı Adı Soyadı / Unvanı" required><input className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
              <Field label="Alıcı Ülkesi" required><select className="select" value={f.country} onChange={e => setF({ ...f, country: e.target.value })}>{DATA.countries.filter(c => c !== 'Türkiye').map(c => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Alıcı Telefon"><input className="input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
              <Field label="Alıcı E-posta"><input className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
            </div>

            <div style={{ background: 'var(--brand-softer)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 18 }}>
              <div className="form-grid" style={{ gap: '16px 18px' }}>
                <Field label="Kaynak Para Birimi" required><select className="select" value={f.srcCur} onChange={e => setF({ ...f, srcCur: e.target.value })}>{DATA.currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}</select></Field>
                <Field label="Hedef Para Birimi" required><select className="select" value={f.dstCur} onChange={e => setF({ ...f, dstCur: e.target.value })}>{DATA.currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}</select></Field>
                <Field label="Gönderilecek Tutar" required full><MoneyInput value={f.amount} onChange={v => setF({ ...f, amount: v })} sym={srcC.sym} /></Field>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '12px 14px', background: 'var(--surface)', borderRadius: 11, border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'var(--muted)' }}><Icon name="swap" style={{ width: 18, height: 18, color: 'var(--brand-600)' }} /> Dönüşüm Kuru <span className="tnum" style={{ color: 'var(--ink)', fontWeight: 700 }}>1 {f.srcCur} = {rate.toLocaleString('tr-TR',{maximumFractionDigits:4})} {f.dstCur}</span></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Alıcının alacağı net</div><div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--brand-700)' }}>{DATA.fmt(net, dstC.sym)}</div></div>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="refresh" style={{ width: 13, height: 13 }} /> Kur 90 saniye geçerlidir; süre dolarsa otomatik yenilenir.</p>
            </div>

            <div className="form-grid">
              <Field label="Ödeme Türü" required><select className="select" value={f.purpose} onChange={e => setF({ ...f, purpose: e.target.value })}>{DATA.purposes.map(p => <option key={p}>{p}</option>)}</select></Field>
              <Field label="İşlem Açıklaması" full><textarea className="textarea" style={{ minHeight: 70 }} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} /></Field>
            </div>
            <label className="checkbox"><input type="checkbox" checked={f.save} onChange={e => setF({ ...f, save: e.target.checked })} /><span className="checkbox-label">Bu kişiyi <strong>Kayıtlı Kişilerime</strong> ekle</span></label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 92 }}>
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 14 }}>Özet</h3>
              <div className="kv"><span className="k">Gönderilen tutar</span><span className="v tnum">{DATA.fmt(amt, srcC.sym)}</span></div>
              <div className="kv"><span className="k">Toplam ücret</span><span className="v tnum">{DATA.fmt(fee, srcC.sym)}</span></div>
              <div className="kv"><span className="k">Döviz kuru</span><span className="v tnum">{rate.toLocaleString('tr-TR',{maximumFractionDigits:4})}</span></div>
              <div className="kv"><span className="k">Alıcı alır</span><span className="v tnum" style={{ color: 'var(--info)' }}>{DATA.fmt(net, dstC.sym)}</span></div>
              <div className="kv" style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 12 }}><span className="k" style={{ fontWeight: 700, color: 'var(--ink)' }}>Ödenecek toplam</span><span className="v tnum" style={{ fontSize: 17, color: 'var(--brand-700)' }}>{DATA.fmt(amt + fee, srcC.sym)}</span></div>
              <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 18 }} disabled={!valid} onClick={review}>Devam et <Icon name="right" /></button>
              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 10, display: 'flex', gap: 6, justifyContent: 'center' }}><Icon name="lock" style={{ width: 14, height: 14 }} /> Pending → Sent → Completed</p>
            </div>
            <FeeTable />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Para Al (own IBAN ↔ own wallet) ---- */
function ReceiveScreen({ onReview }) {
  const [ibanId, setIbanId] = useT('');
  const [amount, setAmount] = useT('');
  const iban = DATA.ibans.find(i => i.id === ibanId);
  const wallet = iban ? DATA.wallets.find(w => w.id === iban.wallet) : null;
  const cur = iban ? DATA.currencies.find(c => c.code === iban.currency) : null;
  const amt = parseFloat(String(amount).replace('.', '').replace(',', '.')) || 0;
  const valid = iban && amt > 0;

  function review() {
    onReview({
      kind: 'receive', title: 'Para Al (Kendi IBAN)', recipientName: DATA.customer.name, country: 'Türkiye',
      iban: iban.iban, bank: iban.bank, currency: iban.currency, sym: cur.sym, amount: amt, fee: 0, total: amt,
      purpose: 'Kendi Hesap Aktarımı', desc: 'Cüzdandan kendi IBAN’a aktarım', walletNo: wallet.no, src: wallet.id,
    });
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="page-head"><div>
          <div className="eyebrow">Para Al</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Kendi IBAN’ınıza aktarın</h1>
          <p className="page-sub">Lisans kısıtı gereği yalnızca <strong>size ait IBAN’lar</strong> arasında işlem yapabilirsiniz; üçüncü kişilere ait IBAN’a aktarım yapılamaz.</p>
        </div></div>

        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="IBAN" required hint="Yalnızca size ait kayıtlı IBAN’lar listelenir.">
            <select className="select" value={ibanId} onChange={e => { setIbanId(e.target.value); }}>
              <option value="">IBAN seçiniz…</option>
              {DATA.ibans.map(i => <option key={i.id} value={i.id}>{i.bank} — {i.iban} ({i.currency})</option>)}
            </select>
          </Field>

          {iban && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['Cüzdan', wallet.no], ['Para Birimi', iban.currency], ['Bakiye', DATA.fmt(wallet.balance, cur.sym)]].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-2)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{k}</div>
                  <div className="tnum" style={{ fontWeight: 700, color: 'var(--ink)', marginTop: 3, fontSize: 14 }}>{v}</div>
                  <span className="tag" style={{ marginTop: 6, fontSize: 10.5 }}>otomatik · değişmez</span>
                </div>
              ))}
            </div>
          )}

          <Field label="Tutar" required full><MoneyInput value={amount} onChange={setAmount} sym={cur ? cur.sym : '₺'} /></Field>

          <button className="btn btn-primary btn-lg btn-block" disabled={!valid} onClick={review}>Devam et <Icon name="right" /></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MoneyInput, DomesticForm, IntlForm, ReceiveScreen });
