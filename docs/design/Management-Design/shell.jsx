// shell.jsx — shared app chrome (Topbar + Sidebar) used by all back-office pages.
// Pages mount their content inside <Shell activeNav="...">.

function Topbar({ t, lang, theme, setTheme, role, setRole, onOpenSettings, sidebarCollapsed, setSidebarCollapsed }) {
  const I = window.Icon;
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const ROLE_LABELS = {
    ops: t("role_ops"),
    finance: t("role_finance"),
    compliance: t("role_compliance"),
    management: t("role_management"),
  };

  return (
    <header className="topbar" ref={wrapRef}>
      <button className="icon-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Menu">
        {React.createElement(I.menu, { size: 16 })}
      </button>
      <div className="brand">
        <div className="brand-mark">€</div>
        <span>{t("brand")}</span>
        <span className="t-mute fs-11" style={{ fontWeight: 400 }}>BackOffice</span>
        <span className="brand-env">{t("env")}</span>
      </div>
      <div className="tb-divider"></div>
      <div className="tb-search">
        {React.createElement(I.search, { size: 14 })}
        <input type="text" placeholder={t("search_ph")} />
        <kbd>⌘K</kbd>
      </div>
      <div className="tb-spacer"></div>
      <div className="tb-actions">
        <div className="env-row" style={{ marginRight: 6 }}>
          <span className="role-chip" onClick={() => {
            const roles = ["ops", "finance", "compliance", "management"];
            setRole(roles[(roles.indexOf(role) + 1) % roles.length]);
          }} style={{ cursor: "pointer" }} title="Rolü değiştir">
            <span className="role-chip-dot"></span>
            {ROLE_LABELS[role]}
          </span>
        </div>
        <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Tema">
          {React.createElement(theme === "dark" ? I.sun : I.moon, { size: 16 })}
        </button>
        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
                  aria-label={t("notifications")}>
            {React.createElement(I.bell, { size: 16 })}
            <span className="dot"></span>
          </button>
          {notifOpen && (
            <div className="popover">
              <div className="popover-h">
                <b>{t("notifications")}</b>
                <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 11.5 }}>
                  {lang === "tr" ? "Tümünü işaretle" : "Mark all read"}
                </button>
              </div>
              <div className="popover-list">
                {window.NOTIFS.map(n => {
                  const tone = { warn: "warn-soft", info: "info-soft", danger: "danger-soft", ok: "ok-soft" }[n.level];
                  const fg = { warn: "var(--warn-fg)", info: "var(--info-fg)", danger: "var(--danger-fg)", ok: "var(--ok-fg)" }[n.level];
                  return (
                    <div key={n.id} className="notif">
                      <div className="notif-icon" style={{ background: `var(--${tone})`, color: fg }}>
                        {React.createElement(window.Icon[n.icon], { size: 14 })}
                      </div>
                      <div className="notif-body">
                        <b>{n.title}</b>
                        <p>{n.desc}</p>
                        <time>{n.time}</time>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <button className="icon-btn" onClick={onOpenSettings} aria-label={t("settings")}>
          {React.createElement(I.settings, { size: 16 })}
        </button>
        <div className="tb-divider"></div>
        <div className="user-chip" onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}>
          <div className="user-avatar">EK</div>
          <div className="user-meta">
            <b>Emre Koç</b>
            <span>{ROLE_LABELS[role]}</span>
          </div>
        </div>
        {userOpen && (
          <div className="popover" style={{ width: 240, right: 12 }}>
            <div className="popover-list">
              <div className="notif" onClick={onOpenSettings} style={{ cursor: "pointer" }}>
                <div className="notif-icon" style={{ background: "var(--bg-sunken)", color: "var(--fg-soft)" }}>
                  {React.createElement(I.settings, { size: 14 })}
                </div>
                <div className="notif-body">
                  <b>{t("settings")}</b>
                  <p>{lang === "tr" ? "Parola, tema, dil…" : "Password, theme, language…"}</p>
                </div>
              </div>
              <div className="notif" style={{ cursor: "pointer" }}>
                <div className="notif-icon" style={{ background: "var(--danger-soft)", color: "var(--danger-fg)" }}>
                  {React.createElement(I.logout, { size: 14 })}
                </div>
                <div className="notif-body">
                  <b>{t("logout")}</b>
                  <p>{lang === "tr" ? "Oturumu sonlandır" : "End session"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Sidebar({ t, role, activeNav = "home", activeSub = null }) {
  const I = window.Icon;

  // Full menu (per 00.index.md) — ordered 1..13.
  // built: navigates to a real page; not built yet: visible but marked "Yakında".
  const menu = [
    {
      id: "home", icon: "home", label: t("m_home"),
      href: "Ana Sayfa.html", builtin: true,
    },
    {
      id: "customers", icon: "user", label: t("m_customers"),
      href: "Müşteriler.html",
      kids: [
        { id: "cust_new_indv",  no: "2.1", label: t("s_cust_new_indv"),  soon: true },
        { id: "cust_new_corp",  no: "2.2", label: t("s_cust_new_corp"),  soon: true },
        { id: "cust_notes",     no: "2.3", label: t("s_cust_notes"),     soon: true },
        { id: "cust_doc",       no: "2.4", label: t("s_cust_doc"),       soon: true },
        { id: "cust_fees",      no: "2.5", label: t("s_cust_fees"),      soon: true },
        { id: "cust_campaign",  no: "2.6", label: t("s_cust_campaign"),  soon: true },
      ],
    },
    {
      id: "agents", icon: "building", label: t("m_agents"),
      href: "Temsilciler.html",
      kids: [
        { id: "ag_new",        no: "3.1", label: t("s_ag_new"),        soon: true },
        { id: "ag_authperson", no: "3.2", label: t("s_ag_authperson"), soon: true },
        { id: "ag_group",      no: "3.3", label: t("s_ag_group"),      soon: true },
        { id: "ag_fees",       no: "3.4", label: t("s_ag_fees"),       soon: true },
      ],
    },
    {
      id: "wallets", icon: "wallet", label: t("m_wallets"),
      href: "Dijital Cüzdanlar.html",
      kids: [
        { id: "wl_detail",   no: "4.1", label: t("s_wl_detail"),   soon: true },
        { id: "wl_activity", no: "4.2", label: t("s_wl_activity"), soon: true },
      ],
    },
    {
      id: "transfers", icon: "transfer", label: t("m_transfers"),
      badge: 124, soon: true,
      kids: [
        { id: "tr_detail", no: "5.1", label: t("s_tr_detail"), soon: true },
        { id: "tr_refund", no: "5.2", label: t("s_tr_refund"), soon: true },
      ],
    },
    {
      id: "banks", icon: "bank", label: t("m_banks"), soon: true,
      kids: [
        { id: "bk_integrated", no: "6.1", label: t("s_bk_integrated"), soon: true },
        { id: "bk_accounts",   no: "6.2", label: t("s_bk_accounts"),   soon: true },
        { id: "bk_movements",  no: "6.3", label: t("s_bk_movements"),  soon: true },
        { id: "bk_recon",      no: "6.4", label: t("s_bk_recon"),      soon: true },
      ],
    },
    {
      id: "risk", icon: "shield", label: t("m_risk"), soon: true, badge: 9, badgeTone: "danger",
      kids: [
        { id: "rk_score",  no: "7.1", label: t("s_rk_score"),  soon: true },
        { id: "rk_limits", no: "7.2", label: t("s_rk_limits"), soon: true },
        { id: "rk_scores", no: "7.3", label: t("s_rk_scores"), soon: true },
        { id: "rk_fraud",  no: "7.4", label: t("s_rk_fraud"),  soon: true },
        { id: "rk_cases",  no: "7.5", label: t("s_rk_cases"),  soon: true },
        { id: "rk_admin",  no: "7.6", label: t("s_rk_admin"),  soon: true },
      ],
    },
    {
      id: "ops", icon: "process", label: t("m_ops"), soon: true,
      kids: [
        { id: "op_approval",   no: "8.1", label: t("s_op_approval"),   soon: true, badge: 14 },
        { id: "op_kyc",        no: "8.2", label: t("s_op_kyc"),        soon: true, badge: 12 },
        { id: "op_accounting", no: "8.3", label: t("s_op_accounting"), soon: true },
        { id: "op_btrans",     no: "8.4", label: t("s_op_btrans"),     soon: true },
        { id: "op_recon",      no: "8.5", label: t("s_op_recon"),      soon: true },
        { id: "op_fx",         no: "8.6", label: t("s_op_fx"),         soon: true },
      ],
    },
    {
      id: "dms", icon: "doc", label: t("m_dms"), soon: true,
      kids: [
        { id: "dms_new",   no: "9.1", label: t("s_dms_new"),   soon: true },
        { id: "dms_types", no: "9.3", label: t("s_dms_types"), soon: true },
      ],
    },
    {
      id: "support", icon: "support", label: t("m_support"), soon: true,
      kids: [
        { id: "supp_new",     no: "10.1", label: t("s_supp_new"),     soon: true },
        { id: "supp_reports", no: "10.2", label: t("s_supp_reports"), soon: true },
      ],
    },
    {
      id: "reports", icon: "chart", label: t("m_reports"), soon: true,
    },
    {
      id: "system", icon: "settings", label: t("m_system"), soon: true,
      kids: [
        { id: "sys_users",         no: "12.1", label: t("s_sys_users"),         soon: true },
        { id: "sys_approval_rules",no: "12.2", label: t("s_sys_approval_rules"),soon: true },
        { id: "sys_roles",         no: "12.3", label: t("s_sys_roles"),         soon: true },
        { id: "sys_params",        no: "12.4", label: t("s_sys_params"),        soon: true },
        { id: "sys_scheduled",     no: "12.5", label: t("s_sys_scheduled"),     soon: true },
        { id: "sys_notifications", no: "12.6", label: t("s_sys_notifications"), soon: true },
        { id: "sys_integrations",  no: "12.7", label: t("s_sys_integrations"),  soon: true },
      ],
    },
    {
      id: "hr", icon: "hr", label: t("m_hr"), soon: true,
      kids: [
        { id: "hr_employees", no: "13.1", label: t("s_hr_employees"), soon: true },
        { id: "hr_leave",     no: "13.2", label: t("s_hr_leave"),     soon: true },
      ],
    },
    {
      id: "paratransferi", icon: "transfer", label: t("pt_menu"),
      href: "Para Transferi.html",
      kids: [
        { id: "pt_own",    no: "6.1", label: t("pt_flow_own") },
        { id: "pt_bank",   no: "6.2", label: t("pt_flow_bank") },
        { id: "pt_person", no: "6.3", label: t("pt_flow_person") },
        { id: "pt_abroad", no: "6.4", label: t("pt_flow_abroad") },
      ],
    },
    {
      id: "txnhistory", icon: "pulse", label: t("th_menu"),
      href: "İşlem Hareketleri.html",
    },
    {
      id: "dso", icon: "support", label: t("dso_menu"),
      href: "Dilek Şikayet Öneriler.html",
    },
  ];

  // Open-state per parent. Auto-open the active item's parent.
  const initialOpen = React.useMemo(() => {
    const o = {};
    menu.forEach(m => { if (m.id === activeNav && m.kids) o[m.id] = true; });
    return o;
  }, [activeNav]);
  const [open, setOpen] = React.useState(initialOpen);

  function toggle(id) {
    setOpen(s => ({ ...s, [id]: !s[id] }));
  }

  // Renders one main menu item (with optional kids list).
  function renderItem(m) {
    const active = m.id === activeNav;
    const hasActiveChild = m.id === activeNav && activeSub != null;
    const isOpen = open[m.id] || active;
    const Inner = (
      <>
        <span className="nav-icon">{React.createElement(I[m.icon] || I.home, { size: 15 })}</span>
        <span className="nav-label">{m.label}</span>
        {m.badge != null && (
          <span className="nav-badge" style={m.badgeTone === "danger" ? {
            background: "var(--danger-soft)", color: "var(--danger-fg)", borderColor: "transparent",
          } : {}}>{m.badge}</span>
        )}
      </>
    );
    if (m.kids && m.kids.length) {
      const parentCls = `nav-parent ${active ? "active has-active" : ""} ${isOpen ? "open" : ""}`;
      return (
        <React.Fragment key={m.id}>
          <div className={parentCls}>
            {m.href && !active ? (
              <a href={m.href} style={{ display: "contents", color: "inherit", textDecoration: "none" }}>
                {Inner}
              </a>
            ) : (
              <span style={{ display: "contents" }}>{Inner}</span>
            )}
            <button onClick={(e) => { e.stopPropagation(); toggle(m.id); }}
                    aria-label={isOpen ? t("collapse_menu") : t("expand_menu")}
                    className="chev"
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, display: "grid", placeItems: "center" }}>
              {React.createElement(I.chevDown, { size: 13 })}
            </button>
          </div>
          {isOpen && (
            <div className="nav-sub">
              {m.kids.map(k => {
                const subActive = k.id === activeSub;
                const cls = `nav-sub-item ${subActive ? "active" : ""} ${k.soon ? "soon" : ""}`;
                return (
                  <a key={k.id} className={cls} href="#" onClick={e => e.preventDefault()}>
                    <span className="sub-no">{k.no}</span>
                    <span>{k.label}</span>
                    {k.badge != null && <span className="nav-badge" style={{ marginLeft: "auto", fontSize: 10 }}>{k.badge}</span>}
                    {k.soon && k.badge == null && <span className="soon-pill">{t("coming_soon")}</span>}
                  </a>
                );
              })}
            </div>
          )}
        </React.Fragment>
      );
    }
    // simple leaf with no kids
    const cls = `nav-item ${active ? "active" : ""}`;
    if (m.href && !active) {
      return (
        <a key={m.id} className={cls} href={m.href}
           style={{ textDecoration: "none", color: "inherit" }}>
          {Inner}
          {m.soon && <span className="soon-pill" style={{
            marginLeft: "auto", fontSize: 9.5, textTransform: "uppercase",
            letterSpacing: "0.05em", color: "var(--fg-faint)",
            background: "var(--bg-sunken)", padding: "1px 5px",
            borderRadius: 3, border: "1px solid var(--line)",
          }}>{t("coming_soon")}</span>}
        </a>
      );
    }
    return (
      <div key={m.id} className={cls}>
        {Inner}
        {m.soon && <span className="soon-pill" style={{
          marginLeft: "auto", fontSize: 9.5, textTransform: "uppercase",
          letterSpacing: "0.05em", color: "var(--fg-faint)",
          background: "var(--bg-sunken)", padding: "1px 5px",
          borderRadius: 3, border: "1px solid var(--line)",
        }}>{t("coming_soon")}</span>}
      </div>
    );
  }

  // Visual grouping with section headers
  const SECTIONS = [
    { title: t("nav_overview"),    ids: ["home"] },
    { title: t("nav_ops"),         ids: ["customers", "agents", "wallets", "transfers", "banks"] },
    { title: t("nav_compliance"),  ids: ["risk", "ops"] },
    { title: t("nav_admin"),       ids: ["dms", "support", "reports", "system", "hr"] },
    { title: t("pt_section_txn"),  ids: ["paratransferi", "txnhistory", "dso"] },
  ];
  const byId = Object.fromEntries(menu.map(m => [m.id, m]));

  return (
    <aside className="sidebar">
      {SECTIONS.map((sec, i) => (
        <React.Fragment key={i}>
          <div className="nav-section">{sec.title}</div>
          {sec.ids.map(id => renderItem(byId[id]))}
        </React.Fragment>
      ))}
      <div className="sidebar-foot">
        <span>v2.14.0</span>
        <span className="build-tag">build · {new Date().toISOString().slice(0, 10)}</span>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Shell — wraps a page with topbar, sidebar, settings drawer, tweaks panel.
// Children are rendered inside <main>.
// ─────────────────────────────────────────────────────────────────────
function Shell({ activeNav = "home", activeSub = null, children, tweakDefaults, extraTweaks }) {
  const defaults = tweakDefaults || {
    theme: "light",
    lang: "tr",
    role: "ops",
    density: "standard",
    textSize: "standard",
  };
  const [t_, setTweak] = useTweaks(defaults);
  const t = useT(t_.lang);

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [welcomeMsg, setWelcomeMsg] = React.useState(
    t_.lang === "tr"
      ? "Mavi köpekbalığı 🦈 — sadece sen bilirsin."
      : "Blue shark 🦈 — only you know this."
  );

  React.useEffect(() => {
    document.documentElement.dataset.theme = t_.theme;
    document.documentElement.dataset.density = t_.density;
    document.documentElement.dataset.textSize = t_.textSize;
  }, [t_.theme, t_.density, t_.textSize]);

  // Provide t / lang / role / setters AND tweaks store to children
  const pageProps = { t, lang: t_.lang, role: t_.role, tweaks: t_, setTweak };

  // ─ Breadcrumb derived from activeNav / activeSub ─
  const NAV_TO_BREADCRUMB = {
    home:      [{ label: t("nav_overview") },              { label: t("m_home"), href: "Ana Sayfa.html" }],
    customers: [{ label: t("nav_ops") },                   { label: t("m_customers"), href: "Müşteriler.html" }],
    agents:    [{ label: t("nav_ops") },                   { label: t("m_agents"),    href: "Temsilciler.html" }],
    wallets:   [{ label: t("nav_ops") },                   { label: t("m_wallets"),   href: "Dijital Cüzdanlar.html" }],
    transfers: [{ label: t("nav_ops") },                   { label: t("m_transfers") }],
    banks:     [{ label: t("nav_ops") },                   { label: t("m_banks") }],
    risk:      [{ label: t("nav_compliance") },            { label: t("m_risk") }],
    ops:       [{ label: t("nav_compliance") },            { label: t("m_ops") }],
    dms:       [{ label: t("nav_admin") },                 { label: t("m_dms") }],
    support:   [{ label: t("nav_admin") },                 { label: t("m_support") }],
    reports:   [{ label: t("nav_admin") },                 { label: t("m_reports") }],
    system:    [{ label: t("nav_admin") },                 { label: t("m_system") }],
    hr:        [{ label: t("nav_admin") },                 { label: t("m_hr") }],
    paratransferi: [{ label: t("pt_section_txn") },        { label: t("pt_menu"), href: "Para Transferi.html" }],
    txnhistory:    [{ label: t("pt_section_txn") },        { label: t("th_menu"), href: "İşlem Hareketleri.html" }],
    dso:           [{ label: t("pt_section_txn") },        { label: t("dso_menu"), href: "Dilek Şikayet Öneriler.html" }],
  };
  const crumbs = NAV_TO_BREADCRUMB[activeNav] || [];

  return (
    <div className={`app ${sidebarCollapsed ? "collapsed" : ""}`}>
      <Topbar
        t={t} lang={t_.lang} theme={t_.theme}
        setTheme={(v) => setTweak("theme", v)}
        role={t_.role} setRole={(v) => setTweak("role", v)}
        onOpenSettings={() => setSettingsOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <Sidebar t={t} role={t_.role} activeNav={activeNav} activeSub={activeSub} />
      <main className="main">
        {crumbs.length > 0 && activeNav !== "home" && (
          <div className="breadcrumb">
            <a href="Ana Sayfa.html">{t("m_home")}</a>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <span className="sep">{t("bc_separator")}</span>
                {i === crumbs.length - 1
                  ? <span className="current">{c.label}</span>
                  : <span className="lk">{c.label}</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        {typeof children === "function" ? children(pageProps) : children}
      </main>

      <SettingsDrawer
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        t={t} lang={t_.lang} setLang={(v) => setTweak("lang", v)}
        theme={t_.theme} setTheme={(v) => setTweak("theme", v)}
        density={t_.density} setDensity={(v) => setTweak("density", v)}
        textSize={t_.textSize} setTextSize={(v) => setTweak("textSize", v)}
        welcomeMsg={welcomeMsg} setWelcomeMsg={setWelcomeMsg}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label={t_.lang === "tr" ? "Görünüm" : "Appearance"} />
        <TweakRadio label={t_.lang === "tr" ? "Tema" : "Theme"} value={t_.theme}
          options={["light", "dark"]}
          onChange={(v) => setTweak("theme", v)} />
        <TweakRadio label={t_.lang === "tr" ? "Yoğunluk" : "Density"} value={t_.density}
          options={["compact", "standard", "comfortable"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSelect label={t_.lang === "tr" ? "Metin Boyutu" : "Text size"} value={t_.textSize}
          options={["small", "standard", "large", "xlarge"]}
          onChange={(v) => setTweak("textSize", v)} />
        <TweakRadio label={t_.lang === "tr" ? "Dil" : "Language"} value={t_.lang}
          options={["tr", "en"]}
          onChange={(v) => setTweak("lang", v)} />
        <TweakSection label={t_.lang === "tr" ? "Rol" : "Role"} />
        <TweakSelect label={t_.lang === "tr" ? "Aktif rol" : "Active role"} value={t_.role}
          options={["ops", "finance", "compliance", "management"]}
          onChange={(v) => setTweak("role", v)} />
        <TweakButton label={t_.lang === "tr" ? "Ayarları aç" : "Open settings"}
          onClick={() => setSettingsOpen(true)} />
        {extraTweaks && extraTweaks(t_, setTweak)}
      </TweaksPanel>
    </div>
  );
}

window.Shell = Shell;
window.SharedTopbar = Topbar;
window.SharedSidebar = Sidebar;
