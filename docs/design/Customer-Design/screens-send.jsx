/* Epay — Para Gönder: hub, kayıtlı kişiler, yurt içi, yurt dışı */
const { useState: useS, useMemo } = React;

function FeeTable() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <Icon name="info" style={{ width: 17, height: 17, color: 'var(--brand-600)' }} />
        <strong style={{ fontSize: 14 }}>Ücret ve Komisyonlar</strong>
      </div>
      <table className="tbl">
        <thead><tr><th>Tutar Aralığı</th><th>Sabit Ücret</th><th>Oransal</th><th>Kampanya</th></tr></thead>
        <tbody>{DATA.fees.map((f, i) => (
          <tr key={i} style={{ cursor: 'default' }}>
            <td className="tnum" style={{ color: 'var(--ink)', fontWeight: 600 }}>{f.range} {f.cur}</td>
            <td className="tnum">{f.fixed}</td><td className="tnum">{f.rate}</td>
            <td>{f.campaign === '—' ? <span style={{ color: 'var(--faint)' }}>—</span> : <span className="pill pill-completed" style={{ fontSize: 11 }}>{f.campaign}'a kadar</span>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function SourceWalletPicker({ value, onChange }) {
  const wallets = DATA.wallets.filter(w => w.editable);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
      {wallets.map(w => {
        const sel = value === w.id;
        return (
          <button key={w.id} onClick={() => onChange(w.id)} style={{
            textAlign: 'left', cursor: 'pointer', borderRadius: 13, padding: '13px 15px',
            border: '1.5px solid ' + (sel ? 'var(--brand-500)' : 'var(--line-strong)'),
            background: sel ? 'var(--brand-softer)' : 'var(--surface)',
            boxShadow: sel ? '0 0 0 4px color-mix(in srgb, var(--brand-500) 14%, transparent)' : 'none' }}>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{w.label} · {w.currency}</div>
            <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginTop: 3, color: 'var(--ink)' }}>{DATA.fmt(w.balance, w.symbol)}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ---- Send hub ---- */
function SendHub({ go }) {
  const cards = [
    { key: 'recipients', icon: 'users', title: 'Kayıtlı Kişilerim', desc: 'Sık gönderdiğiniz kişilere tek dokunuşla para gönderin.', cta: 'Kişileri gör' },
    { key: 'domestic', icon: 'flag', title: 'Yurt İçine', desc: 'Türkiye’deki bir kişiye anında transfer yapın.', cta: 'Gönderim başlat' },
    { key: 'intl', icon: 'globe', title: 'Yurt Dışına', desc: 'Güncel döviz kuru ile uluslararası gönderim.', cta: 'Gönderim başlat' },
  ];
  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">Para Gönder</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>Nasıl göndermek istersiniz?</h1>
            <p className="page-sub">Gönderim yalnızca <strong>CustomerPersistent</strong> cüzdanlarınızdan yapılır. Her işlem, tamamlanmadan önce OTP ile onaylanır.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {cards.map(c => (
            <button key={c.key} className="card" onClick={() => go(c.key)} style={{ textAlign: 'left', cursor: 'pointer', padding: 26, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start', transition: 'transform .14s, box-shadow .14s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <span style={{ width: 52, height: 52, borderRadius: 15, background: 'var(--brand-soft)', color: 'var(--brand-600)', display: 'grid', placeItems: 'center' }}><Icon name={c.icon} style={{ width: 26, height: 26 }} /></span>
              <div><h3 style={{ fontSize: 20 }}>{c.title}</h3><p style={{ color: 'var(--muted)', fontSize: 14.5, marginTop: 7, lineHeight: 1.5 }}>{c.desc}</p></div>
              <span style={{ color: 'var(--brand-600)', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 'auto' }}>{c.cta} <Icon name="right" style={{ width: 15, height: 15 }} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Saved recipients ---- */
function RecipientsScreen({ go, startSend }) {
  const [list, setList] = useS(DATA.recipients);
  const [edit, setEdit] = useS(null);
  const [del, setDel] = useS(null);
  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">Para Gönder</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>Kayıtlı Kişilerim</h1>
            <p className="page-sub">Sık gönderdiğiniz alıcılar. <strong>Gönder</strong>’e bastığınızda, kişinin ülkesine göre yurt içi/yurt dışı formuna alıcı bilgileri dolu olarak gidilir.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setEdit({ id: null, label: '', name: '', country: 'Türkiye', phone: '', email: '', cusNo: '', purpose: 'Aile Desteği', desc: '' })}><Icon name="plus" /> Yeni Kişi</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {list.map(r => (
            <div key={r.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
                <span className="avatar" style={{ borderRadius: 13, background: r.intl ? 'var(--info)' : 'var(--brand-700)' }}>{r.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--ink)' }}>{r.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{r.name}</div>
                </div>
                <span className="tag" style={{ marginLeft: 'auto' }}><Icon name={r.intl ? 'globe' : 'flag'} style={{ width: 13, height: 13 }} /> {r.country}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: 'var(--ink-2)' }}>
                {r.phone && <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="phone" style={{ width: 14, height: 14, color: 'var(--faint)' }} /> {r.phone}</span>}
                {r.email && <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="mail" style={{ width: 14, height: 14, color: 'var(--faint)' }} /> {r.email}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: '10px 14px' }} onClick={() => startSend(r)}><Icon name="send" /> Gönder</button>
                <button className="icon-btn" title="Değiştir" onClick={() => setEdit({ ...r })}><Icon name="edit" /></button>
                <button className="icon-btn" title="Sil" onClick={() => setDel(r)}><Icon name="trash" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {edit && (
        <Modal onClose={() => setEdit(null)} max={520}>
          <h3 style={{ fontSize: 21, marginBottom: 4 }}>{edit.id ? 'Kişiyi Düzenle' : 'Yeni Kayıtlı Kişi'}</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>Alıcı bilgilerini girin. Bu kişiye daha sonra hızlı gönderim yapabilirsiniz.</p>
          <div className="form-grid">
            <Field label="Kayıt Adı" required full><input className="input" value={edit.label} onChange={e => setEdit({ ...edit, label: e.target.value })} placeholder="örn. Burak — Kardeşim" /></Field>
            <Field label="Adı Soyadı / Unvanı" required full><input className="input" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Ülkesi" required><select className="select" value={edit.country} onChange={e => setEdit({ ...edit, country: e.target.value })}>{DATA.countries.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Müşteri No"><input className="input" value={edit.cusNo} onChange={e => setEdit({ ...edit, cusNo: e.target.value })} placeholder="Varsa" /></Field>
            <Field label="Telefon"><input className="input" value={edit.phone} onChange={e => setEdit({ ...edit, phone: e.target.value })} /></Field>
            <Field label="E-posta"><input className="input" value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} /></Field>
            <Field label="Ödeme Türü" full><select className="select" value={edit.purpose} onChange={e => setEdit({ ...edit, purpose: e.target.value })}>{DATA.purposes.map(p => <option key={p}>{p}</option>)}</select></Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setEdit(null)}>Vazgeç</button>
            <button className="btn btn-primary" disabled={!edit.label || !edit.name} onClick={() => {
              if (edit.id) setList(list.map(x => x.id === edit.id ? { ...edit, intl: edit.country !== 'Türkiye' } : x));
              else setList([...list, { ...edit, id: 'r' + Date.now(), intl: edit.country !== 'Türkiye' }]);
              setEdit(null);
            }}><Icon name="check" /> Kaydet</button>
          </div>
        </Modal>
      )}

      {del && (
        <Modal onClose={() => setDel(null)} max={400}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--neg-soft)', color: 'var(--neg)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}><Icon name="trash" style={{ width: 26, height: 26 }} /></span>
            <h3 style={{ fontSize: 20 }}>Kaydı sil?</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 24px' }}><strong>{del.label}</strong> kayıtlı kişilerinizden kaldırılacak. Bu işlem geri alınamaz.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-block" onClick={() => setDel(null)}>Vazgeç</button>
              <button className="btn btn-block" style={{ background: 'var(--neg)', color: '#fff' }} onClick={() => { setList(list.filter(x => x.id !== del.id)); setDel(null); }}>Sil</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { FeeTable, SourceWalletPicker, SendHub, RecipientsScreen });
