// settings.jsx — Settings drawer (Ayarlar).
// Tabs: Parola, Karşılama, Uygulama Ayarları, Hatalı Girişler.

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 16) s++;
  return Math.min(s, 4);
}

function PasswordTab({ t, lang }) {
  const I = window.Icon;
  const [oldPw, setOldPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [newPw2, setNewPw2] = React.useState("");
  const [freq, setFreq] = React.useState("3");
  const [show, setShow] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const str = pwStrength(newPw);
  const strLabels = ["—", t("pw_strength_weak"), t("pw_strength_weak"), t("pw_strength_med"), t("pw_strength_strong")];
  const strColors = ["var(--line)", "var(--danger)", "var(--danger)", "var(--warn)", "var(--ok)"];

  const errors = [];
  if (submitted) {
    if (newPw.length > 0 && newPw.length < 12) errors.push({ field: "new", msg: t("pw_too_short") });
    if (newPw.length >= 12 && str < 3) errors.push({ field: "new", msg: t("pw_weak") });
    if (newPw && newPw2 && newPw !== newPw2) errors.push({ field: "new2", msg: t("pw_mismatch") });
    if (newPw && oldPw && newPw === oldPw) errors.push({ field: "new", msg: t("pw_same") });
  }
  const errFor = (f) => errors.find(e => e.field === f)?.msg;

  return (
    <>
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "12px 14px", marginBottom: 18,
        background: "var(--warn-soft)", color: "var(--warn-fg)",
        borderRadius: "var(--r-md)", fontSize: 12.5,
      }}>
        {React.createElement(I.info, { size: 16, style: { marginTop: 2, flexShrink: 0 } })}
        <span>{t("s_revoke_warn")}</span>
      </div>

      <div className="form-grp">
        <label>{t("s_old_pw")}</label>
        <div style={{ position: "relative" }}>
          <input className="input" type={show ? "text" : "password"} value={oldPw}
                 onChange={e => setOldPw(e.target.value)} placeholder="••••••••••••" />
          <button onClick={() => setShow(!show)}
                  className="icon-btn" type="button"
                  style={{ position: "absolute", right: 4, top: 4, width: 28, height: 28 }}>
            {React.createElement(show ? I.eyeOff : I.eye, { size: 14 })}
          </button>
        </div>
      </div>

      <div className="form-grp">
        <label>{t("s_new_pw")}</label>
        <input className={`input ${errFor("new") ? "input-err" : ""}`}
               type={show ? "text" : "password"} value={newPw}
               onChange={e => { setNewPw(e.target.value); setSubmitted(true); }}
               placeholder="••••••••••••••" />
        {newPw && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div style={{ flex: 1, height: 4, background: "var(--bg-sunken)", borderRadius: 999, overflow: "hidden", display: "flex", gap: 2 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  flex: 1, height: "100%",
                  background: str >= i ? strColors[str] : "var(--bg-sunken)",
                  borderRadius: 999,
                  transition: "background .15s",
                }}></div>
              ))}
            </div>
            <span className="fs-11" style={{ color: strColors[str], minWidth: 48, textAlign: "right" }}>
              {strLabels[str]}
            </span>
          </div>
        )}
        <span className={`hint ${errFor("new") ? "field-msg" : ""}`}>
          {errFor("new") || t("pw_policy")}
        </span>
      </div>

      <div className="form-grp">
        <label>{t("s_new_pw2")}</label>
        <input className={`input ${errFor("new2") ? "input-err" : ""}`}
               type={show ? "text" : "password"} value={newPw2}
               onChange={e => { setNewPw2(e.target.value); setSubmitted(true); }}
               placeholder="••••••••••••••" />
        {errFor("new2") && <span className="field-msg">{errFor("new2")}</span>}
        {newPw && newPw2 && newPw === newPw2 && !errFor("new") && (
          <span className="field-msg ok">
            ✓ {lang === "tr" ? "Parolalar eşleşiyor" : "Passwords match"}
          </span>
        )}
      </div>

      <div className="form-grp">
        <label>{t("s_pw_freq")}</label>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          {[
            ["1", t("s_1m")],
            ["3", t("s_3m")],
            ["6", t("s_6m")],
          ].map(([v, lbl]) => (
            <button key={v} className={freq === v ? "on" : ""} onClick={() => setFreq(v)}>{lbl}</button>
          ))}
        </div>
        <span className="hint">{t("s_pw_freq_hint")}</span>
      </div>
    </>
  );
}

function WelcomeTab({ t, lang, welcomeMsg, setWelcomeMsg }) {
  const I = window.Icon;
  return (
    <>
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "12px 14px", marginBottom: 18,
        background: "var(--accent-soft)", color: "var(--accent-fg)",
        borderRadius: "var(--r-md)", fontSize: 12.5,
      }}>
        {React.createElement(I.shield, { size: 16, style: { marginTop: 2, flexShrink: 0 } })}
        <span>{t("s_welcome_hint")}</span>
      </div>
      <div className="form-grp">
        <label>{t("s_welcome_label")}</label>
        <textarea className="textarea" value={welcomeMsg}
                  maxLength={140}
                  onChange={e => setWelcomeMsg(e.target.value)}
                  placeholder={lang === "tr" ? "Örn. \"Mavi köpekbalığı 🦈 — bunu sadece sen bilirsin.\"" : "e.g. \"Blue shark 🦈 — only you know this.\""} />
        <span className="hint">{welcomeMsg.length} / 140 · {lang === "tr" ? "Yalnızca harf, rakam, boşluk ve emoji" : "Letters, numbers, spaces and emoji only"}</span>
      </div>
      <div className="section-h" style={{ marginTop: 24 }}>{lang === "tr" ? "Önizleme" : "Preview"}</div>
      <div className="welcome" style={{ margin: 0 }}>
        <div className="welcome-icon">{React.createElement(I.shield, { size: 14 })}</div>
        <div>
          <strong>{t("welcome_back")}, Emre.</strong>{" "}
          <span style={{ opacity: 0.8 }}>{welcomeMsg || (lang === "tr" ? "(boş)" : "(empty)")}</span>
        </div>
      </div>
    </>
  );
}

function PrefsTab({ t, lang, setLang, theme, setTheme, density, setDensity, textSize, setTextSize }) {
  return (
    <>
      <div className="form-grp">
        <label>{t("s_language")}</label>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          <button className={lang === "tr" ? "on" : ""} onClick={() => setLang("tr")}>🇹🇷 Türkçe</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>🇬🇧 English</button>
        </div>
      </div>
      <div className="form-grp">
        <label>{t("s_theme")}</label>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          <button className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>☀ {t("s_theme_light")}</button>
          <button className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>☾ {t("s_theme_dark")}</button>
        </div>
      </div>
      <div className="form-grp">
        <label>{t("s_textsize")}</label>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          {[
            ["small",   t("s_sz_s")],
            ["standard",t("s_sz_m")],
            ["large",   t("s_sz_l")],
            ["xlarge",  t("s_sz_xl")],
          ].map(([v, lbl]) => (
            <button key={v} className={textSize === v ? "on" : ""} onClick={() => setTextSize(v)}>{lbl}</button>
          ))}
        </div>
      </div>
      <div className="divider"></div>
      <div className="form-grp">
        <label>{lang === "tr" ? "Yoğunluk" : "Density"}</label>
        <div className="seg" style={{ alignSelf: "flex-start" }}>
          {[
            ["compact",      lang === "tr" ? "Yoğun" : "Compact"],
            ["standard",     lang === "tr" ? "Standart" : "Standard"],
            ["comfortable",  lang === "tr" ? "Geniş" : "Comfortable"],
          ].map(([v, lbl]) => (
            <button key={v} className={density === v ? "on" : ""} onClick={() => setDensity(v)}>{lbl}</button>
          ))}
        </div>
        <span className="hint">{lang === "tr" ? "Tablo satır yüksekliği ve kart boşluklarını değiştirir." : "Changes row height and card spacing."}</span>
      </div>
    </>
  );
}

function FailedTab({ t, lang }) {
  return (
    <>
      <p className="t-soft fs-12" style={{ marginTop: 0 }}>{t("s_failed_intro")}</p>
      <div className="fl-list">
        {window.FAILED_LOGINS.map((r, i) => (
          <div key={i} className="fl-row">
            <div>
              <div className="ip">{r.ip}</div>
              <div className="loc">{r.loc} · {r.ua}</div>
            </div>
            <span className="when">{r.when}</span>
            <button className="btn ghost" style={{ padding: "3px 9px" }}>
              {lang === "tr" ? "İncele" : "Review"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsDrawer({ open, onClose, t, lang, setLang, theme, setTheme, density, setDensity, textSize, setTextSize, welcomeMsg, setWelcomeMsg }) {
  const I = window.Icon;
  const [tab, setTab] = React.useState("password");
  const tabs = [
    { id: "password", label: t("s_tab_password"), icon: "lock" },
    { id: "welcome",  label: t("s_tab_welcome"),  icon: "shield" },
    { id: "prefs",    label: t("s_tab_prefs"),    icon: "settings" },
    { id: "failed",   label: t("s_tab_failed"),   icon: "warning" },
  ];

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={onClose}></div>
      <div className={`drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="drawer-head">
          <h2>{t("s_title")}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat">
            {React.createElement(I.close, { size: 16 })}
          </button>
        </div>
        <div className="drawer-tabs">
          {tabs.map(tb => (
            <button key={tb.id} className={`drawer-tab ${tab === tb.id ? "active" : ""}`}
                    onClick={() => setTab(tb.id)}>
              {tb.label}
            </button>
          ))}
        </div>
        <div className="drawer-body">
          {tab === "password" && <PasswordTab t={t} lang={lang} />}
          {tab === "welcome"  && <WelcomeTab  t={t} lang={lang} welcomeMsg={welcomeMsg} setWelcomeMsg={setWelcomeMsg} />}
          {tab === "prefs"    && <PrefsTab    t={t} lang={lang} setLang={setLang}
                                              theme={theme} setTheme={setTheme}
                                              density={density} setDensity={setDensity}
                                              textSize={textSize} setTextSize={setTextSize} />}
          {tab === "failed"   && <FailedTab   t={t} lang={lang} />}
        </div>
        <div className="drawer-foot">
          <button className="btn ghost" onClick={onClose}>{t("s_cancel")}</button>
          <button className="btn primary" onClick={onClose}>
            {tab === "password" ? t("s_change_pw") : t("s_save")}
          </button>
        </div>
      </div>
    </>
  );
}

window.SettingsDrawer = SettingsDrawer;
