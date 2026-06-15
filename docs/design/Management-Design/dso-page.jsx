// dso-page.jsx — Dilek, Şikâyet ve Öneriler (8) request form.

function DsoPage({ t, lang }) {
  const I = window.Icon;
  const F = window.Field;

  const [owner, setOwner] = React.useState("self"); // self | customer
  const [custNo, setCustNo] = React.useState("");
  const [custFound, setCustFound] = React.useState(null);
  const [subject, setSubject] = React.useState("");
  const [type, setType] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [files, setFiles] = React.useState([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [success, setSuccess] = React.useState(null);

  // regex: detect TCKN (11 digits) or card (13-16 digits)
  const sensitive = (s) => /\b\d{11}\b/.test(s || "") || /\b\d{13,16}\b/.test((s || "").replace(/\s/g, ""));
  const detailBad = sensitive(detail);
  const notesBad = sensitive(notes);

  const SAMPLE_FILES = [
    { name: "dekont-2026-05.pdf", size: "248 KB" },
    { name: "ekran-goruntusu.png", size: "1.2 MB" },
    { name: "sozlesme-eki.pdf", size: "640 KB" },
  ];

  function lookupCust() {
    if (!custNo.trim()) return;
    const f = window.PT_findSender ? window.PT_findSender(custNo) : null;
    setCustFound(f ? { name: f.name } : { name: custNo.trim().toUpperCase() });
  }
  function addFile() {
    const next = SAMPLE_FILES[files.length % SAMPLE_FILES.length];
    setFiles([...files, { ...next, id: Date.now() + Math.random() }]);
  }
  function clearForm() {
    setOwner("self"); setCustNo(""); setCustFound(null);
    setSubject(""); setType(""); setDetail(""); setNotes(""); setFiles([]); setSubmitted(false);
  }
  function canSubmit() {
    if (!subject.trim() || !type || !detail.trim()) return false;
    if (owner === "customer" && !custNo.trim()) return false;
    if (detailBad || notesBad) return false;
    return true;
  }
  function onSend() {
    setSubmitted(true);
    if (!canSubmit()) return;
    setSuccess({ caseNo: `CASE-${Math.floor(100000 + Math.random() * 899999)}` });
  }

  if (success) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1 className="page-title">{t("dso_title")}</h1>
            <p className="page-subtitle">{t("dso_subtitle")}</p>
          </div>
        </div>
        <div className="fcard" style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="pt-success">
            <div className="check">{React.createElement(I.check, { size: 30 })}</div>
            <h2>{t("dso_success_title")}</h2>
            <p>{t("dso_success_desc")}</p>
            <div className="ref">
              <span className="t-mute">{t("dso_case_no")}:</span>
              <strong>{success.caseNo}</strong>
            </div>
            <div className="notify-row" style={{ justifyContent: "center", marginTop: 14 }}>
              <span className="notify-pill">{React.createElement(I.bell, { size: 12 })} {t("dso_sms_sent")}</span>
              <span className="notify-pill">{React.createElement(I.doc, { size: 12 })} {t("dso_email_sent")}</span>
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="btn" onClick={() => { setSuccess(null); clearForm(); }}>
                {React.createElement(I.plus, { size: 13 })} {t("dso_new")}
              </button>
              <button className="btn primary">
                {t("dso_goto_support")} {React.createElement(I.arrow, { size: 13 })}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const TYPES = [
    ["ct_complaint", t("ct_complaint")],
    ["ct_request", t("ct_request")],
    ["ct_suggestion", t("ct_suggestion")],
    ["ct_info", t("ct_info")],
    ["ct_objection", t("ct_objection")],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("dso_title")}</h1>
          <p className="page-subtitle">{t("dso_subtitle")}</p>
        </div>
      </div>

      <div style={{ maxWidth: 760 }}>
        <div className="pt-banner running" style={{ marginBottom: 14 }}>
          <span className="ic">{React.createElement(I.info, { size: 15 })}</span>
          <div>{t("dso_notify")}</div>
        </div>

        <section className="fcard">
          <div className="fcard-head">
            <div className="card-icon accent" style={{ width: 26, height: 26 }}>{React.createElement(I.support, { size: 13 })}</div>
            <h3>{t("dso_form_title")}</h3>
          </div>
          <div className="fcard-body">
            <div className="fgrid cols-2">
              {/* Talep Sahibi */}
              <F label={t("dso_owner")} required col={owner === "customer" ? 1 : 2}>
                <div className="seg" style={{ alignSelf: "flex-start" }}>
                  <button className={owner === "self" ? "on" : ""} onClick={() => { setOwner("self"); setCustFound(null); }}>{t("dso_owner_self")}</button>
                  <button className={owner === "customer" ? "on" : ""} onClick={() => setOwner("customer")}>{t("dso_owner_customer")}</button>
                </div>
              </F>

              {/* Müşteri No (conditional) */}
              {owner === "customer" && (
                <F label={t("dso_cust_no")} required
                   error={submitted && !custNo.trim() ? t("dso_cust_no") : null}>
                  <div className="input-affix">
                    <input className="input mono" value={custNo}
                           onChange={e => { setCustNo(e.target.value); setCustFound(null); }}
                           onKeyDown={e => { if (e.key === "Enter") lookupCust(); }}
                           placeholder={t("dso_cust_no_ph")} />
                    {custFound
                      ? <span className="affix ok">✓ {custFound.name}</span>
                      : <button className="affix" style={{ cursor: "pointer", border: "none" }} onClick={lookupCust}>{t("dso_cust_lookup")}</button>}
                  </div>
                </F>
              )}

              {/* Konu */}
              <F label={t("dso_subject")} required col={1}
                 error={submitted && !subject.trim() ? t("dso_subject") : null}>
                <input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder={t("dso_subject_ph")} />
              </F>

              {/* Talep Tipi */}
              <F label={t("dso_type")} required col={1}
                 error={submitted && !type ? t("dso_type") : null}>
                <select className="select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="">—</option>
                  {TYPES.map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
                </select>
              </F>

              {/* Talep Detayı */}
              <F label={t("dso_detail")} required col={2}
                 error={submitted && !detail.trim() ? t("dso_detail") : (detailBad ? t("dso_regex_warn") : null)}>
                <textarea className={`textarea ${detailBad ? "err" : ""}`} value={detail}
                          onChange={e => setDetail(e.target.value)} placeholder={t("dso_detail_ph")}
                          style={{ minHeight: 90 }}></textarea>
              </F>

              {/* Notlar */}
              <F label={t("dso_notes")} col={2}
                 error={notesBad ? t("dso_regex_warn") : null}>
                <textarea className={`textarea ${notesBad ? "err" : ""}`} value={notes}
                          onChange={e => setNotes(e.target.value)} placeholder={t("dso_notes_ph")}></textarea>
              </F>

              {/* Files */}
              <F label={t("dso_files")} col={2}>
                <div className="attach-drop" onClick={addFile}>
                  {React.createElement(I.download, { size: 20, style: { transform: "rotate(180deg)", opacity: 0.6, marginBottom: 4 } })}
                  <div><strong>{t("dso_add_file")}</strong></div>
                  <div className="fs-11 t-mute" style={{ marginTop: 3 }}>{t("dso_drop")}</div>
                </div>
                {files.length > 0 && (
                  <div className="attach-list">
                    {files.map(f => (
                      <div key={f.id} className="attach-item">
                        <span className="fic">{React.createElement(I.doc, { size: 14 })}</span>
                        <span className="fname">{f.name}</span>
                        <span className="fsize">{f.size}</span>
                        <button className="frm" onClick={() => setFiles(files.filter(x => x.id !== f.id))}>
                          {React.createElement(I.close, { size: 13 })}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </F>
            </div>
          </div>
          <div className="card-foot" style={{ justifyContent: "flex-end", gap: 8, padding: "12px 18px" }}>
            <button className="btn" onClick={addFile}>
              {React.createElement(I.download, { size: 13, style: { transform: "rotate(180deg)" } })} {t("dso_add_file")}
            </button>
            <button className="btn ghost" onClick={clearForm}>{t("dso_clear")}</button>
            <button className="btn primary" disabled={submitted && !canSubmit()} onClick={onSend}>
              {React.createElement(I.arrow, { size: 13 })} {t("dso_send")}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

window.DsoPage = DsoPage;
