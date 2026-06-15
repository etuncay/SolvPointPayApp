// para-transfer-page.jsx — Para Transferi (6) interactive transaction form.

function ParaTransferPage({ t, lang }) {
  const I = window.Icon;
  const F = window.Field;
  const fmtCur = window.PT_fmtCur;

  // ── query / sender state ──
  const [query, setQuery] = React.useState("");
  const [querying, setQuerying] = React.useState(false);
  const [sender, setSender] = React.useState(null);
  const [notFound, setNotFound] = React.useState(false);
  const [scanFront, setScanFront] = React.useState(false);
  const [scanBack, setScanBack] = React.useState(false);
  const [authChecked, setAuthChecked] = React.useState(false);

  // ── flow + form state ──
  const [flow, setFlow] = React.useState("own"); // own | bank | person | abroad
  const [form, setForm] = React.useState({});
  const setF = (k, v) => setForm(s => ({ ...s, [k]: v }));

  // ── sanction / approval / success ──
  const [sanction, setSanction] = React.useState(null); // null | running | clean | hit-sender | hit-recv
  const [addlOpen, setAddlOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [success, setSuccess] = React.useState(null); // { ref }
  const [lastRef, setLastRef] = React.useState(null);
  const [idemWarn, setIdemWarn] = React.useState(false);

  // ── FX timer (6.4) ──
  const [fxSeconds, setFxSeconds] = React.useState(30);
  const [fxExpiredOnce, setFxExpiredOnce] = React.useState(false);
  React.useEffect(() => {
    if (flow !== "abroad" || !sender) return;
    setFxSeconds(30);
    const id = setInterval(() => {
      setFxSeconds(s => {
        if (s <= 1) { setFxExpiredOnce(true); return 30; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [flow, sender, form.srcCcy, form.tgtCcy]);

  function runQuery(val) {
    const q = (val ?? query).trim();
    if (!q) return;
    setQuerying(true);
    setSender(null); setNotFound(false);
    setTimeout(() => {
      const found = window.PT_findSender(q);
      setQuerying(false);
      if (found) {
        setSender(found);
        setNotFound(false);
        // reset downstream
        setScanFront(false); setScanBack(false); setAuthChecked(false);
        setForm({ ccy: "TRY", srcCcy: "TRY", tgtCcy: "EUR" });
        setSanction(null); setSuccess(null);
      } else {
        setNotFound(true);
      }
    }, 700);
  }

  function resetAll() {
    setQuery(""); setSender(null); setNotFound(false);
    setScanFront(false); setScanBack(false); setAuthChecked(false);
    setFlow("own"); setForm({}); setSanction(null); setApproveOpen(false);
    setOtp(""); setSuccess(null); setIdemWarn(false);
  }

  // ── derived ──
  const amount = parseFloat(flow === "abroad" ? form.sendAmount : form.amount) || 0;
  const ccy = flow === "abroad" ? (form.srcCcy || "TRY") : (form.ccy || "TRY");
  const fee = window.PT_computeFee(amount);
  const feeRow = window.PT_feeRowFor(amount);
  const fxRate = sender && flow === "abroad" ? window.PT_fxRate(form.srcCcy || "TRY", form.tgtCcy || "EUR") : 1;
  const netAbroad = flow === "abroad" ? amount * fxRate : 0;

  // KYC gate for "own wallet" (min L2)
  const kycBlocked = flow === "own" && sender && sender.kycLevel < 2;

  // IBAN validation (6.2)
  const ibanRaw = (form.iban || "").replace(/\s+/g, "").toUpperCase();
  const ibanIsForeign = ibanRaw.length >= 2 && !ibanRaw.startsWith("TR");
  const ibanValid = ibanRaw.startsWith("TR") && ibanRaw.length === 26;
  React.useEffect(() => {
    // auto-route foreign IBAN to abroad flow
    if (flow === "bank" && ibanIsForeign && ibanRaw.length >= 4) {
      const id = setTimeout(() => { setFlow("abroad"); }, 1200);
      return () => clearTimeout(id);
    }
  }, [flow, ibanRaw, ibanIsForeign]);

  // recipient registration check (6.3)
  const recvId = (form.recvId || "").trim().toUpperCase().replace(/\s+/g, "");
  const regMatch = recvId ? window.PT_REG_RECIPIENTS[recvId] : null;

  // risky country (6.4)
  const selCountry = window.PT_COUNTRIES.find(c => c.code === form.country);
  const countryRisky = selCountry?.risky;

  // ── readiness for submit ──
  function canSubmit() {
    if (!sender) return false;
    if (kycBlocked) return false;
    if (amount <= 0) return false;
    if (flow === "bank" && !ibanValid) return false;
    if ((flow === "bank" || flow === "person" || flow === "abroad") && !form.recvName) return false;
    if (flow === "abroad" && !form.country) return false;
    return true;
  }

  function onSubmit() {
    const ref = `TRX-${Math.floor(2000000 + Math.random() * 7999999)}`;
    // idempotency: block same ref re-submit
    if (lastRef && idemWarn) return;
    // sanction screening for low-KYC senders/recipients
    if (sender.kycLevel <= 1) {
      setSanction("running");
      setTimeout(() => {
        if (sender.sanctionHit) {
          setSanction("hit-sender");
        } else if ((form.recvName || "").toLowerCase().includes("victor")) {
          setSanction("hit-recv");
          setAddlOpen(true);
        } else {
          setSanction("clean");
          setApproveOpen(true);
        }
      }, 1600);
    } else {
      setApproveOpen(true);
    }
  }

  function confirmApproval() {
    const ref = `TRX-${Math.floor(2000000 + Math.random() * 7999999)}`;
    setLastRef(ref);
    setApproveOpen(false);
    setOtp("");
    setSuccess({ ref, abroad: flow === "abroad" });
  }

  // ── render: success ──
  if (success) {
    return (
      <div className="pt-layout" style={{ gridTemplateColumns: "1fr" }}>
        <div className="fcard">
          <div className="pt-success">
            <div className="check">{React.createElement(I.check, { size: 30 })}</div>
            <h2>{t("pt_success_title")}</h2>
            <p>{t("pt_success_desc")}{success.abroad ? ` ${t("pt_sent_partner")}` : ""}</p>
            <div className="ref">
              <span className="t-mute">{t("pt_ref_no")}:</span>
              <strong>{success.ref}</strong>
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="btn" onClick={resetAll}>
                {React.createElement(I.plus, { size: 13 })} {t("pt_new_txn")}
              </button>
              <a className="btn primary" href="Ana Sayfa.html" style={{ textDecoration: "none" }}>
                {t("m_home")} {React.createElement(I.arrow, { size: 13 })}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head" style={{ alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">{t("pt_title")}</h1>
          <p className="page-subtitle">{t("pt_subtitle")}</p>
        </div>
        <div className="head-actions">
          <span className="role-chip">
            {React.createElement(I.building, { size: 12, style: { marginRight: 2 } })}
            {t("pt_agent_loc")}
          </span>
        </div>
      </div>

      <div className="pt-layout">
        {/* ── LEFT: form column ── */}
        <div className="pt-form-col">
          {/* Query block */}
          <div className="pt-query">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div className="card-icon accent" style={{ width: 26, height: 26 }}>
                {React.createElement(I.search, { size: 13 })}
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{t("pt_query_title")}</h3>
            </div>
            <p className="t-mute fs-12" style={{ margin: "0 0 12px" }}>{t("pt_query_hint")}</p>
            <div className="row">
              <div className="grow">
                <F label={t("pt_query_label")} required>
                  <input className="input mono" value={query}
                         placeholder={t("pt_query_ph")}
                         onChange={e => { setQuery(e.target.value); setNotFound(false); }}
                         onKeyDown={e => { if (e.key === "Enter") runQuery(); }} />
                </F>
              </div>
              <button className="btn primary" style={{ height: 32 }} disabled={querying || !query.trim()}
                      onClick={() => runQuery()}>
                {querying
                  ? <><span className="b-spin" style={{ width: 13, height: 13 }}></span> {t("pt_querying")}</>
                  : <>{React.createElement(I.search, { size: 13 })} {t("pt_query_btn")}</>}
              </button>
              {(sender || notFound) && (
                <button className="btn" style={{ height: 32 }} onClick={resetAll}>
                  {t("pt_clear")}
                </button>
              )}
            </div>
            <div className="examples">
              <span>{t("pt_try_examples")}</span>
              <button className="pt-ex-chip" onClick={() => { setQuery("MUS-0100482"); runQuery("MUS-0100482"); }}>MUS-0100482 · {t("pt_ex_indv")}</button>
              <button className="pt-ex-chip" onClick={() => { setQuery("98765432109"); runQuery("98765432109"); }}>98765432109 · {t("pt_ex_indv_low")}</button>
              <button className="pt-ex-chip" onClick={() => { setQuery("1234567890"); runQuery("1234567890"); }}>VKN 1234567890 · {t("pt_ex_corp")}</button>
              <button className="pt-ex-chip" onClick={() => { setQuery("00000000000"); runQuery("00000000000"); }}>00000000000 · {t("pt_ex_none")}</button>
            </div>
          </div>

          {/* Not found */}
          {notFound && (
            <div className="fcard">
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <div className="glyph" style={{ background: "var(--warn-soft)", color: "var(--warn-fg)" }}>
                  {React.createElement(I.user, { size: 22 })}
                </div>
                <h3>{t("pt_notfound_title")}</h3>
                <p style={{ maxWidth: 380, margin: "0 auto 14px" }}>{t("pt_notfound_desc")}</p>
                <a className="btn primary" href="Yeni Bireysel Müşteri.html" style={{ textDecoration: "none" }}>
                  {React.createElement(I.plus, { size: 13 })} {t("pt_notfound_cta")}
                </a>
              </div>
            </div>
          )}

          {/* Sender resolved */}
          {sender && (
            <>
              <div className="sender-card">
                <div className={`savatar ${sender.type === "corporate" ? "corp" : "indv"}`}>
                  {sender.type === "corporate"
                    ? sender.name.split(" ").slice(0, 2).map(w => w[0]).join("")
                    : sender.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div className="sinfo">
                  <h3>
                    {sender.name}
                    <span className="badge muted" style={{ fontSize: 10 }}>
                      {sender.type === "corporate" ? t("pt_sender_corp") : t("pt_sender_indv")}
                    </span>
                    <span className={`st active`} style={{ fontSize: 10.5 }}>{t("st_active")}</span>
                  </h3>
                  <div className="smeta">
                    <span className="mono">{sender.type === "corporate" ? `VKN ${sender.vkn}` : `${sender.idType} ${sender.idNo}`}</span>
                    <span>·</span>
                    <span className="mono">{sender.phone}</span>
                  </div>
                </div>
                <div className="sstats">
                  <div className="sstat">
                    <span className="k">{sender.type === "corporate" ? t("pt_kyc_status") : t("pt_kyc_level")}</span>
                    <span className="v">{sender.kyc}</span>
                  </div>
                  <div className="sstat">
                    <span className="k">{t("pt_wallet_balance")}</span>
                    <span className="v">{fmtCur(sender.wallets.TRY, "TRY", lang)}</span>
                  </div>
                </div>
                <button className="btn" onClick={resetAll} style={{ alignSelf: "center" }}>
                  {t("pt_change_sender")}
                </button>
              </div>

              {/* Identity scan (individual KYC>=1) */}
              {sender.type === "individual" && sender.kycLevel >= 1 && (
                <section className="fcard">
                  <div className="fcard-head">
                    <div className="card-icon info" style={{ width: 26, height: 26 }}>{React.createElement(I.shield, { size: 13 })}</div>
                    <h3>{t("pt_id_scan")}</h3>
                    <span className="meta">{(scanFront && scanBack) && <span className="badge ok">{React.createElement(I.check, { size: 11 })} {t("pt_ocr_match")}</span>}</span>
                  </div>
                  <div className="fcard-body">
                    <p className="t-mute fs-12" style={{ marginTop: 0, marginBottom: 14 }}>{t("pt_id_scan_hint")}</p>
                    <div className="scan-grid">
                      <div className={`scan-box ${scanFront ? "done" : ""}`} onClick={() => setScanFront(true)}>
                        {scanFront
                          ? <>{React.createElement(I.check, { size: 18 })}<span className="scan-label">{t("pt_id_front")}</span><span>{t("pt_scanned")} ✓</span></>
                          : <><div className="scan-thumb"></div><span className="scan-label">{t("pt_id_front")}</span><span>{t("pt_scan_drop")}</span></>}
                      </div>
                      <div className={`scan-box ${scanBack ? "done" : ""}`} onClick={() => setScanBack(true)}>
                        {scanBack
                          ? <>{React.createElement(I.check, { size: 18 })}<span className="scan-label">{t("pt_id_back")}</span><span>{t("pt_scanned")} ✓</span></>
                          : <><div className="scan-thumb"></div><span className="scan-label">{t("pt_id_back")}</span><span>{t("pt_scan_drop")}</span></>}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Corporate authorized person */}
              {sender.type === "corporate" && (
                <section className="fcard">
                  <div className="fcard-head">
                    <div className="card-icon warn" style={{ width: 26, height: 26 }}>{React.createElement(I.key, { size: 13 })}</div>
                    <h3>{t("pt_auth_check")}</h3>
                    <span className="meta">{authChecked && <span className="badge ok">{React.createElement(I.check, { size: 11 })} {t("pt_auth_ok")}</span>}</span>
                  </div>
                  <div className="fcard-body">
                    <p className="t-mute fs-12" style={{ marginTop: 0, marginBottom: 14 }}>{t("pt_auth_person_hint")}</p>
                    {sender.docExpired && (
                      <div className="pt-banner warn" style={{ marginBottom: 14 }}>
                        <span className="ic">{React.createElement(I.warning, { size: 15 })}</span>
                        <div style={{ flex: 1 }}>{t("pt_corp_doc_warn")}</div>
                        <button className="btn" style={{ padding: "3px 9px" }}>{t("pt_add_doc")}</button>
                      </div>
                    )}
                    <div className="fgrid cols-2">
                      <F label={t("pt_auth_person")} required>
                        <input className="input mono" defaultValue={sender.authPersonId}
                               onChange={() => setAuthChecked(false)} />
                      </F>
                      <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button className="btn" style={{ height: 32 }} onClick={() => setAuthChecked(true)}>
                          {React.createElement(I.shield, { size: 13 })} {t("pt_auth_check")}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Sub-flow selector */}
              <section className="fcard">
                <div className="fcard-head">
                  <div className="card-icon accent" style={{ width: 26, height: 26 }}>{React.createElement(I.transfer, { size: 13 })}</div>
                  <h3>{t("pt_flow_title")}</h3>
                </div>
                <div className="fcard-body">
                  <div className="flow-grid">
                    {[
                      { id: "own",    no: "6.1", icon: "wallet",   label: t("pt_flow_own"),    d: t("pt_flow_own_d") },
                      { id: "bank",   no: "6.2", icon: "bank",     label: t("pt_flow_bank"),   d: t("pt_flow_bank_d") },
                      { id: "person", no: "6.3", icon: "user",     label: t("pt_flow_person"), d: t("pt_flow_person_d") },
                      { id: "abroad", no: "6.4", icon: "globe",    label: t("pt_flow_abroad"), d: t("pt_flow_abroad_d") },
                    ].map(fl => (
                      <button key={fl.id} className={`flow-card ${flow === fl.id ? "on" : ""}`}
                              onClick={() => { setFlow(fl.id); setSanction(null); setIdemWarn(false); }}>
                        <span className="fno">{fl.no}</span>
                        <span className="fic">{React.createElement(I[fl.icon], { size: 16 })}</span>
                        <b>{fl.label}</b>
                        <span className="fd">{fl.d}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Flow-specific form */}
              <section className="fcard">
                <div className="fcard-head">
                  <span className="no">{flow === "own" ? "6.1" : flow === "bank" ? "6.2" : flow === "person" ? "6.3" : "6.4"}</span>
                  <h3>
                    {flow === "own" ? t("pt_flow_own") : flow === "bank" ? t("pt_flow_bank") : flow === "person" ? t("pt_flow_person") : t("pt_flow_abroad")}
                  </h3>
                </div>
                <div className="fcard-body">
                  {kycBlocked && (
                    <div className="pt-banner hit" style={{ marginBottom: 14 }}>
                      <span className="ic">{React.createElement(I.warning, { size: 15 })}</span>
                      <div>{t("pt_kyc_block")}</div>
                    </div>
                  )}

                  {/* 6.1 OWN WALLET */}
                  {flow === "own" && !kycBlocked && (
                    <div className="fgrid cols-2">
                      <F label={t("pt_currency")} required>
                        <select className="select" value={form.ccy || "TRY"} onChange={e => setF("ccy", e.target.value)}>
                          {Object.keys(sender.wallets).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </F>
                      <F label={t("pt_amount")} required>
                        <input className="input mono" type="number" placeholder={t("pt_amount_ph")}
                               value={form.amount || ""} onChange={e => setF("amount", e.target.value)} />
                      </F>
                      <F label={t("pt_wallet_no")} hint={t("pt_wallet_auto")} locked col={2}>
                        <input className="input mono locked" readOnly
                               value={`WAL-${form.ccy || "TRY"}-${sender.idNo ? sender.idNo.slice(-4) : "0001"}`} />
                      </F>
                      <label className="chk col-2" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                        <input type="checkbox" className="cbx" checked={!!form.suspicious} onChange={e => setF("suspicious", e.target.checked)} />
                        {t("pt_suspicious")}
                        <span className="t-mute fs-11">— {t("pt_suspicious_hint")}</span>
                      </label>
                    </div>
                  )}

                  {/* 6.2 BANK */}
                  {flow === "bank" && (
                    <>
                      {ibanIsForeign && (
                        <div className="pt-banner warn" style={{ marginBottom: 14 }}>
                          <span className="ic">{React.createElement(I.globe, { size: 15 })}</span>
                          <div>{t("pt_iban_foreign")}</div>
                        </div>
                      )}
                      <div className="fgrid cols-2">
                        <F label={t("pt_recv_name")} required col={2}>
                          <input className="input" value={form.recvName || ""} onChange={e => setF("recvName", e.target.value)} />
                        </F>
                        <F label={t("pt_iban")} required col={2}
                           error={ibanRaw.length >= 4 && !ibanRaw.startsWith("TR") ? null : (ibanRaw.length > 0 && ibanRaw.length < 26 && ibanRaw.startsWith("TR") ? t("pt_iban_invalid") : null)}>
                          <div className="input-affix">
                            <input className="input mono" placeholder={t("pt_iban_ph")}
                                   value={form.iban || ""} onChange={e => setF("iban", e.target.value)} />
                            {ibanValid && <span className="affix ok">{t("pt_iban_valid")} ✓</span>}
                          </div>
                        </F>
                        <F label={t("pt_recv_phone")}>
                          <input className="input mono" value={form.recvPhone || ""} onChange={e => setF("recvPhone", e.target.value)} placeholder="+90 …" />
                        </F>
                        <F label={t("pt_recv_email")}>
                          <input className="input" value={form.recvEmail || ""} onChange={e => setF("recvEmail", e.target.value)} placeholder="@" />
                        </F>
                        <F label={t("pt_currency")} required>
                          <select className="select" value={form.ccy || "TRY"} onChange={e => setF("ccy", e.target.value)}>
                            {window.PT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </F>
                        <F label={t("pt_amount")} required>
                          <input className="input mono" type="number" placeholder={t("pt_amount_ph")}
                                 value={form.amount || ""} onChange={e => setF("amount", e.target.value)} />
                        </F>
                        <F label={t("pt_payment_purpose")} required>
                          <select className="select" value={form.purpose || ""} onChange={e => setF("purpose", e.target.value)}>
                            <option value="">—</option>
                            {["pp_family","pp_goods","pp_services","pp_education","pp_rent","pp_salary","pp_other"].map(k => <option key={k} value={k}>{t(k)}</option>)}
                          </select>
                        </F>
                        <F label={t("pt_desc")} col={1}>
                          <input className="input" value={form.desc || ""} onChange={e => setF("desc", e.target.value)} placeholder={t("pt_desc_ph")} />
                        </F>
                        <label className="chk col-2" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                          <input type="checkbox" className="cbx" checked={!!form.suspicious} onChange={e => setF("suspicious", e.target.checked)} />
                          {t("pt_suspicious")}
                        </label>
                      </div>
                    </>
                  )}

                  {/* 6.3 PERSON */}
                  {flow === "person" && (
                    <div className="fgrid cols-2">
                      <F label={t("pt_recv_name")} required>
                        <input className="input" value={form.recvName || ""} onChange={e => setF("recvName", e.target.value)} />
                      </F>
                      <F label={t("pt_recv_id")} hint={!regMatch ? t("pt_recv_id_opt") : null}>
                        <div className="input-affix">
                          <input className="input mono" value={form.recvId || ""} onChange={e => setF("recvId", e.target.value)} placeholder="TCKN / MUS-…" />
                          {regMatch && <span className="affix ok">✓ {lang === "tr" ? "Kayıtlı" : "Registered"}</span>}
                        </div>
                      </F>
                      {regMatch && (
                        <div className="pt-banner clean col-2" style={{ gridColumn: "span 2" }}>
                          <span className="ic">{React.createElement(I.check, { size: 15 })}</span>
                          <div>{lang === "tr" ? "Kayıtlı alıcı bulundu — bilgiler maskeli gösterilir:" : "Registered recipient found — masked:"} <strong className="mono">{regMatch.masked}</strong> · {regMatch.customerNo}</div>
                        </div>
                      )}
                      <F label={t("pt_recv_phone")}>
                        <input className="input mono" value={form.recvPhone || ""} onChange={e => setF("recvPhone", e.target.value)} placeholder="+90 …" />
                      </F>
                      <F label={t("pt_recv_email")}>
                        <input className="input" value={form.recvEmail || ""} onChange={e => setF("recvEmail", e.target.value)} placeholder="@" />
                      </F>
                      <F label={t("pt_currency")} required>
                        <select className="select" value={form.ccy || "TRY"} onChange={e => setF("ccy", e.target.value)}>
                          {window.PT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </F>
                      <F label={t("pt_amount")} required>
                        <input className="input mono" type="number" placeholder={t("pt_amount_ph")}
                               value={form.amount || ""} onChange={e => setF("amount", e.target.value)} />
                      </F>
                      <F label={t("pt_payment_purpose")} required>
                        <select className="select" value={form.purpose || ""} onChange={e => setF("purpose", e.target.value)}>
                          <option value="">—</option>
                          {["pp_family","pp_goods","pp_services","pp_education","pp_rent","pp_salary","pp_other"].map(k => <option key={k} value={k}>{t(k)}</option>)}
                        </select>
                      </F>
                      <F label={t("pt_desc")}>
                        <input className="input" value={form.desc || ""} onChange={e => setF("desc", e.target.value)} placeholder={t("pt_desc_ph")} />
                      </F>
                      <label className="chk col-2" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                        <input type="checkbox" className="cbx" checked={!!form.suspicious} onChange={e => setF("suspicious", e.target.checked)} />
                        {t("pt_suspicious")}
                      </label>
                    </div>
                  )}

                  {/* 6.4 ABROAD */}
                  {flow === "abroad" && (
                    <>
                      <div className="fgrid cols-2">
                        <F label={t("pt_recv_name")} required>
                          <input className="input" value={form.recvName || ""} onChange={e => setF("recvName", e.target.value)} />
                        </F>
                        <F label={t("pt_recv_country")} required
                           error={countryRisky ? null : null}>
                          <select className="select" value={form.country || ""} onChange={e => setF("country", e.target.value)}>
                            <option value="">—</option>
                            {window.PT_COUNTRIES.map(c => <option key={c.code} value={c.code}>{lang === "tr" ? c.tr : c.en}{c.risky ? " ⚠" : ""}</option>)}
                          </select>
                        </F>
                        <F label={t("pt_recv_phone")}>
                          <input className="input mono" value={form.recvPhone || ""} onChange={e => setF("recvPhone", e.target.value)} placeholder="+.." />
                        </F>
                        <F label={t("pt_recv_email")}>
                          <input className="input" value={form.recvEmail || ""} onChange={e => setF("recvEmail", e.target.value)} placeholder="@" />
                        </F>
                        <F label={t("pt_src_currency")} required>
                          <select className="select" value={form.srcCcy || "TRY"} onChange={e => setF("srcCcy", e.target.value)}>
                            {window.PT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </F>
                        <F label={t("pt_tgt_currency")} required>
                          <select className="select" value={form.tgtCcy || "EUR"} onChange={e => setF("tgtCcy", e.target.value)}>
                            {window.PT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </F>
                        <F label={t("pt_send_amount")} required>
                          <input className="input mono" type="number" placeholder={t("pt_amount_ph")}
                                 value={form.sendAmount || ""} onChange={e => setF("sendAmount", e.target.value)} />
                        </F>
                        <F label={t("pt_payment_purpose")} required>
                          <select className="select" value={form.purpose || ""} onChange={e => setF("purpose", e.target.value)}>
                            <option value="">—</option>
                            {["pp_family","pp_goods","pp_services","pp_education","pp_rent","pp_salary","pp_other"].map(k => <option key={k} value={k}>{t(k)}</option>)}
                          </select>
                        </F>
                      </div>

                      {/* FX quote */}
                      <div className={`fx-quote ${fxSeconds <= 5 ? "warn-state" : ""}`} style={{ marginTop: 14 }}>
                        <div>
                          <div className="t-mute fs-11">{t("pt_fx_rate")}</div>
                          <div className="rate">1 {form.srcCcy || "TRY"} = {fxRate.toFixed(4)} {form.tgtCcy || "EUR"}</div>
                        </div>
                        <div>
                          <div className="t-mute fs-11">{t("pt_net_amount")}</div>
                          <div className="rate">{fmtCur(netAbroad, form.tgtCcy || "EUR", lang)}</div>
                        </div>
                        <div className="timer">
                          {fxExpiredOnce && fxSeconds > 25 ? <span style={{ color: "var(--warn-fg)" }}>{t("pt_fx_expired")}</span> : null}
                          <span className="timer-ring"></span>
                          {t("pt_fx_valid")} {fxSeconds}s {lang === "tr" ? "" : ""}
                        </div>
                      </div>

                      {countryRisky && (
                        <div className="pt-banner warn" style={{ marginTop: 12 }}>
                          <span className="ic">{React.createElement(I.warning, { size: 15 })}</span>
                          <div>{t("pt_country_risk")}</div>
                        </div>
                      )}
                      <F label={t("pt_desc")} col={2} className="" >
                        <input className="input" value={form.desc || ""} onChange={e => setF("desc", e.target.value)} placeholder={t("pt_desc_ph")} style={{ marginTop: 14 }} />
                      </F>
                    </>
                  )}
                </div>
              </section>

              {/* Fee table */}
              {!kycBlocked && (
                <section className="fcard">
                  <div className="fcard-head">
                    <div className="card-icon" style={{ width: 26, height: 26 }}>{React.createElement(I.wallet, { size: 13 })}</div>
                    <h3>{t("pt_fees_title")}</h3>
                    <span className="meta">{amount > 0 && feeRow >= 0 ? <span className="badge accent">{t("pt_fee_active")}: {fmtCur(fee, ccy, lang)}</span> : t("pt_fee_none")}</span>
                  </div>
                  <div className="fcard-body padless">
                    <table className="fee-table">
                      <thead>
                        <tr>
                          <th>{t("pt_fee_range")}</th>
                          <th className="r">{t("pt_fee_fixed")}</th>
                          <th className="r">{t("pt_fee_rate")}</th>
                          <th className="r">{t("pt_fee_ccy")}</th>
                          <th className="r">{t("pt_fee_campaign")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {window.PT_FEES.map((f, i) => (
                          <tr key={i} className={amount > 0 && i === feeRow ? "active-row" : ""}>
                            <td>{f.min.toLocaleString("tr-TR")} – {f.max === Infinity ? "∞" : f.max.toLocaleString("tr-TR")}</td>
                            <td className="r">{f.fixed.toFixed(2)}</td>
                            <td className="r">% {f.rate.toFixed(2)}</td>
                            <td className="r">{ccy}</td>
                            <td className="r">{window.PT_FEE_CAMPAIGN}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* sanction banner */}
              {sanction === "running" && (
                <div className="pt-banner running"><span className="b-spin"></span><div>{t("pt_sanction_running")}</div></div>
              )}
              {sanction === "clean" && (
                <div className="pt-banner clean"><span className="ic">{React.createElement(I.check, { size: 15 })}</span><div>{t("pt_sanction_clean")}</div></div>
              )}
              {sanction === "hit-sender" && (
                <div className="pt-banner hit"><span className="ic">{React.createElement(I.ban, { size: 15 })}</span><div>{t("pt_sanction_hit_sender")}</div></div>
              )}
              {sanction === "hit-recv" && (
                <div className="pt-banner warn"><span className="ic">{React.createElement(I.warning, { size: 15 })}</span><div>{t("pt_sanction_hit_recv")} <button className="btn" style={{ padding: "2px 9px", marginLeft: 8 }} onClick={() => setAddlOpen(true)}>{t("pt_addl_info")}</button></div></div>
              )}
              {idemWarn && (
                <div className="pt-banner warn"><span className="ic">{React.createElement(I.info, { size: 15 })}</span><div>{t("pt_idem_warn")}</div></div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT: summary column ── */}
        {sender && (
          <div className="pt-summary-col">
            <div className="sum-card">
              <div className="sum-head">
                {React.createElement(I.doc, { size: 15 })}
                {t("pt_summary")}
              </div>
              {amount > 0 ? (
                <>
                  <div className="sum-body">
                    <div className="sum-row"><span className="k">{t("pt_sum_type")}</span><span className="v" style={{ fontFamily: "var(--font-ui)" }}>{flow === "own" ? t("pt_flow_own") : flow === "bank" ? t("pt_flow_bank") : flow === "person" ? t("pt_flow_person") : t("pt_flow_abroad")}</span></div>
                    <div className="sum-row"><span className="k">{t("pt_sum_sender")}</span><span className="v" style={{ fontFamily: "var(--font-ui)" }}>{sender.name}</span></div>
                    {flow !== "own" && (
                      <div className="sum-row"><span className="k">{t("pt_sum_recv")}</span><span className="v" style={{ fontFamily: "var(--font-ui)" }}>{regMatch ? regMatch.masked : (form.recvName || "—")}</span></div>
                    )}
                    <div className="sum-row"><span className="k">{t("pt_sum_amount")}</span><span className="v">{fmtCur(amount, ccy, lang)}</span></div>
                    <div className="sum-row"><span className="k">{t("pt_sum_fee")}</span><span className="v">{fmtCur(fee, ccy, lang)}</span></div>
                    <div className="sum-row total"><span className="k">{t("pt_sum_total")}</span><span className="v">{fmtCur(amount + fee, ccy, lang)}</span></div>
                    {flow === "abroad" && (
                      <div className="sum-row net"><span className="k">{t("pt_sum_net")}</span><span className="v">{fmtCur(netAbroad, form.tgtCcy || "EUR", lang)}</span></div>
                    )}
                  </div>
                  <div className="sum-foot">
                    <button className="btn primary" disabled={!canSubmit() || sanction === "running"} onClick={onSubmit}>
                      {React.createElement(I.shield, { size: 14 })} {t("pt_submit")}
                    </button>
                    <button className="btn ghost" onClick={resetAll}>{t("pt_reset")}</button>
                  </div>
                </>
              ) : (
                <div className="sum-empty">{t("pt_sum_empty")}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional info modal (recipient sanction hit) */}
      {addlOpen && (
        <div className="modal-backdrop" onClick={() => setAddlOpen(false)}>
          <div className="modal" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 style={{ color: "var(--warn-fg)" }}>{t("pt_addl_info")}</h2>
              <p>{t("pt_addl_info_desc")}</p>
            </div>
            <div className="modal-body" style={{ gap: 12 }}>
              <F label={t("pt_addl_birth")}><input className="input" type="date" /></F>
              <F label={t("pt_addl_country")}><input className="input" placeholder="—" /></F>
              <F label={t("pt_addl_addr")}><textarea className="textarea" placeholder="—"></textarea></F>
            </div>
            <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setAddlOpen(false)}>{t("s_cancel")}</button>
              <button className="btn primary" onClick={() => { setAddlOpen(false); setSanction("clean"); setApproveOpen(true); }}>
                {React.createElement(I.refresh, { size: 13 })} {t("pt_rescan")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval modal (1.1) */}
      {approveOpen && (
        <div className="modal-backdrop" onClick={() => setApproveOpen(false)}>
          <div className="modal" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{t("pt_approve_title")} <span className="badge muted" style={{ fontSize: 10 }}>1.1</span></h2>
              <p>{t("pt_approve_desc")}</p>
            </div>
            <div className="modal-body" style={{ gap: 10 }}>
              <div className="sum-card" style={{ border: "1px solid var(--line)" }}>
                <div className="sum-body">
                  <div className="sum-row"><span className="k">{t("pt_sum_type")}</span><span className="v" style={{ fontFamily: "var(--font-ui)" }}>{flow === "own" ? t("pt_flow_own") : flow === "bank" ? t("pt_flow_bank") : flow === "person" ? t("pt_flow_person") : t("pt_flow_abroad")}</span></div>
                  <div className="sum-row"><span className="k">{t("pt_sum_sender")}</span><span className="v" style={{ fontFamily: "var(--font-ui)" }}>{sender.name}</span></div>
                  {flow !== "own" && <div className="sum-row"><span className="k">{t("pt_sum_recv")}</span><span className="v" style={{ fontFamily: "var(--font-ui)" }}>{regMatch ? regMatch.masked : (form.recvName || "—")}</span></div>}
                  <div className="sum-row total"><span className="k">{t("pt_sum_total")}</span><span className="v">{fmtCur(amount + fee, ccy, lang)}</span></div>
                </div>
              </div>
              <F label={t("pt_otp")} hint={t("pt_otp_sent")}>
                <input className="input otp-input mono" maxLength={6} value={otp}
                       onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="------" />
              </F>
            </div>
            <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setApproveOpen(false)}>{t("pt_approve_cancel")}</button>
              <button className="btn primary" disabled={otp.length !== 6} onClick={confirmApproval}>
                {React.createElement(I.check, { size: 14 })} {t("pt_approve_btn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

window.ParaTransferPage = ParaTransferPage;
