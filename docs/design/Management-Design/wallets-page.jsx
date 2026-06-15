// wallets-page.jsx — Dijital Cüzdanlar grid.

const WT_META = {
  customer_main:      { iconCls: "cust", icon: "wallet"   },
  customer_savings:   { iconCls: "savg", icon: "wallet"   },
  agent_advance:      { iconCls: "adv",  icon: "building" },
  agent_commission:   { iconCls: "com",  icon: "wallet"   },
  system_reserve:     { iconCls: "res",  icon: "shield"   },
  system_revenue:     { iconCls: "rev",  icon: "chart"    },
  system_suspense:    { iconCls: "sus",  icon: "warning"  },
  system_settlement:  { iconCls: "set",  icon: "key"      },
};
const CCY_OPTS = ["TRY", "USD", "EUR", "GBP"];

// Role → visible wallet categories (per spec §3)
const ROLE_VIS = {
  ops:        ["customer", "agent"],
  finance:    ["system"],
  compliance: ["customer", "agent", "system"],
  management: ["customer", "agent", "system"],
};

function WalletTypeCell({ w, t }) {
  const m = WT_META[w.type];
  const I = window.Icon[m.icon] || window.Icon.wallet;
  return (
    <div className="wt-cell">
      <div className={`ic ${m.iconCls}`}>{React.createElement(I, { size: 12 })}</div>
      <span>{t(`wt_${w.type}`)}</span>
    </div>
  );
}

function fmtAmount(n, ccy, lang) {
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function MoneyCell({ n, ccy, lang, big }) {
  const cls = n < 0 ? "neg" : n === 0 ? "zero" : "";
  return (
    <span className={`wl-amount ${cls} ${big ? "big" : ""}`}>
      {fmtAmount(n, ccy, lang)}<span className="ccy">{ccy}</span>
    </span>
  );
}

function BlockedCell({ w, lang, t }) {
  if (w.blocked === -1) return <span className="blk-cell full">{t("wl_full_blocked")}</span>;
  if (w.blocked > 0)    return <span className="blk-cell part">{fmtAmount(w.blocked, w.ccy, lang)}</span>;
  return <span className="blk-cell none">0</span>;
}

// ─────────── Stat strip ───────────
function WStatStrip({ t, lang, wallets }) {
  const I = window.Icon;
  const totals = {};
  wallets.forEach(w => {
    if (!totals[w.ccy]) totals[w.ccy] = 0;
    totals[w.ccy] += w.balance;
  });
  const blocked = wallets.filter(w => w.blocked === -1).length;
  const partial = wallets.filter(w => w.blocked > 0).length;
  const txToday = wallets.reduce((s, w) => s + w.txToday, 0);
  return (
    <div className="stat-strip">
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.wallet, { size: 12 })}
          {t("wl_stat_count")}
        </span>
        <span className="val">{window.fmtNumber(wallets.length, lang)}</span>
        <span className="sub">
          {wallets.filter(w => w.cat === "customer").length} M · {" "}
          {wallets.filter(w => w.cat === "agent").length} T · {" "}
          {wallets.filter(w => w.cat === "system").length} S
        </span>
      </div>
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.chart, { size: 12 })}
          {t("wl_stat_total")} · TRY
        </span>
        <span className="val">{window.fmtMoney(totals.TRY || 0, lang)}</span>
        <span className="sub">
          {totals.USD ? `$${fmtAmount(totals.USD, "USD", lang)}` : ""}
          {totals.EUR ? `  €${fmtAmount(totals.EUR, "EUR", lang)}` : ""}
          {totals.GBP ? `  £${fmtAmount(totals.GBP, "GBP", lang)}` : ""}
        </span>
      </div>
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.lock, { size: 12 })}
          {t("wl_stat_blocked")}
        </span>
        <span className="val" style={{ color: blocked > 0 ? "var(--danger-fg)" : undefined }}>
          {blocked}
          <span className="t-mute fs-12"> · {partial} kısmi</span>
        </span>
        <span className="sub">{lang === "tr" ? "İncele" : "Review"} →</span>
      </div>
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.transfer, { size: 12 })}
          {t("wl_stat_tx_today")}
        </span>
        <span className="val">{window.fmtNumber(txToday, lang)}</span>
        <span className="sub up">↑ 9% {lang === "tr" ? "düne göre" : "vs yesterday"}</span>
      </div>
    </div>
  );
}

// ─────────── Filter bar ───────────
function WFilterBar({ t, lang, query, setQuery, showAdv, setShowAdv, filteredCount, total, ccyFilter, setCcyFilter, counts }) {
  const I = window.Icon;
  return (
    <div className="filter-bar">
      <div className="chips">
        <button className={`chip ${ccyFilter === "all" ? "on" : ""}`} onClick={() => setCcyFilter("all")}>
          {t("st_all")} <span className="chip-count">{total}</span>
        </button>
        {CCY_OPTS.map(c => (
          <button key={c} className={`chip ${ccyFilter === c ? "on" : ""}`} onClick={() => setCcyFilter(c)}>
            {c} <span className="chip-count">{counts[c] || 0}</span>
          </button>
        ))}
      </div>
      <div className="search">
        {React.createElement(I.search, { size: 14, className: "s-icon", style: { position: "absolute", left: 10, top: 9 } })}
        <input type="text" placeholder={t("wl_search_ph")} value={query} onChange={e => setQuery(e.target.value)} />
        {query && (
          <button className="clear" onClick={() => setQuery("")} aria-label="clear">
            {React.createElement(I.close, { size: 12 })}
          </button>
        )}
      </div>
      <button className={`btn ${showAdv ? "primary" : ""}`} onClick={() => setShowAdv(!showAdv)}>
        {React.createElement(I.filter, { size: 13 })}
        {showAdv ? t("cust_advanced_close") : t("cust_advanced")}
      </button>
      <div className="filter-meta">
        <span className="mono">{window.fmtNumber(filteredCount, lang)}</span>
        <span>{t("cust_results")}</span>
        <span className="t-mute">·</span>
        <span>{t("cust_of")} {window.fmtNumber(total, lang)}</span>
      </div>
    </div>
  );
}

function WAdvanced({ t, filters, setFilters, allowedCats, onClear }) {
  const upd = (k, v) => setFilters({ ...filters, [k]: v });
  const typeOptions = Object.keys(WT_META).filter(k => allowedCats.includes(k.startsWith("system_") ? "system" : k.startsWith("agent_") ? "agent" : "customer"));
  return (
    <div className="adv-filters">
      <div className="form-grp">
        <label>{t("wl_af_type")}</label>
        <select className="select" value={filters.type} onChange={e => upd("type", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          {typeOptions.map(k => <option key={k} value={k}>{t(`wt_${k}`)}</option>)}
        </select>
      </div>
      <div className="form-grp">
        <label>{t("wl_af_state")}</label>
        <select className="select" value={filters.state} onChange={e => upd("state", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          <option value="full">{t("wl_state_full_block")}</option>
          <option value="partial">{t("wl_state_partial")}</option>
          <option value="negative">{t("wl_state_negative")}</option>
          <option value="normal">{t("wl_state_normal")}</option>
        </select>
      </div>
      <div className="form-grp">
        <label>{t("af_created_from")}</label>
        <input type="date" className="input" value={filters.from} onChange={e => upd("from", e.target.value)} />
      </div>
      <div className="form-grp">
        <label>{t("af_created_to")}</label>
        <input type="date" className="input" value={filters.to} onChange={e => upd("to", e.target.value)} />
      </div>
      <div className="form-grp" style={{ alignSelf: "flex-end" }}>
        <button className="btn ghost" onClick={onClear} style={{ height: 30 }}>
          {React.createElement(window.Icon.close, { size: 12 })} {t("cust_clear")}
        </button>
      </div>
    </div>
  );
}

// ─────────── Drawer ───────────
function WalletDrawer({ t, lang, w, onClose }) {
  const I = window.Icon;
  React.useEffect(() => {
    if (!w) return;
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [w, onClose]);
  if (!w) return null;
  const m = WT_META[w.type];
  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose}></div>
      <div className="cust-drawer open" role="dialog">
        <div className="head">
          <div className={`avatar`} style={{
            width: 44, height: 44,
            borderRadius: w.cat === "customer" ? "50%" : 10,
            background: ({
              cust: "var(--info-soft)",
              savg: "var(--accent-soft)",
              adv:  "var(--warn-soft)",
              com:  "var(--ok-soft)",
              res:  "oklch(0.93 0.04 280)",
              rev:  "var(--ok-soft)",
              sus:  "var(--danger-soft)",
              set:  "oklch(0.93 0.03 195)",
            })[m.iconCls],
            color: ({
              cust: "var(--info-fg)",
              savg: "var(--accent-fg)",
              adv:  "var(--warn-fg)",
              com:  "var(--ok-fg)",
              res:  "oklch(0.42 0.13 280)",
              rev:  "var(--ok-fg)",
              sus:  "var(--danger-fg)",
              set:  "oklch(0.42 0.12 195)",
            })[m.iconCls],
          }}>
            {React.createElement(window.Icon[m.icon], { size: 20 })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-mono)" }}>{w.walletNo}</span>
              <span className={`cat-badge ${w.cat}`}>{t(`wl_owner_${w.cat}`)}</span>
            </h2>
            <div className="sub">
              <span>{t(`wt_${w.type}`)}</span>
              <span className="t-mute">·</span>
              <span className="mono">{w.ccy}</span>
              {w.blocked === -1 && (
                <span className="badge danger">{t("wl_full_blocked")}</span>
              )}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            {React.createElement(I.close, { size: 16 })}
          </button>
        </div>
        <div className="body">
          {/* Balance hero */}
          <div style={{
            border: "1px solid var(--line)", borderRadius: "var(--r-md)",
            padding: "16px 18px", marginBottom: 18,
            background: "var(--bg-sunken)",
          }}>
            <div className="kpi-label" style={{ marginBottom: 2 }}>
              {t("wl_c_available")}
            </div>
            <div className="kpi-value" style={{ fontSize: 26 }}>
              {fmtAmount(w.available, w.ccy, lang)}
              <span style={{ fontSize: 14, color: "var(--fg-muted)", marginLeft: 6 }}>{w.ccy}</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12 }}>
              <div>
                <span className="t-mute">{t("wl_c_balance")}: </span>
                <span className="mono">{fmtAmount(w.balance, w.ccy, lang)}</span>
              </div>
              <div>
                <span className="t-mute">{t("wl_c_blocked")}: </span>
                <span className="mono" style={{ color: w.blocked === -1 ? "var(--danger-fg)" : w.blocked > 0 ? "var(--warn-fg)" : "var(--fg-faint)" }}>
                  {w.blocked === -1 ? "-1 (Tam Bloke)" : fmtAmount(w.blocked, w.ccy, lang)}
                </span>
              </div>
            </div>
          </div>

          {w.cat !== "system" && (
            <>
              <div className="section-h">{lang === "tr" ? "Hesap Sahibi" : "Owner"}</div>
              <div className="kv-grid">
                <div className="kv">
                  <span className="k">{w.cat === "agent" ? "Temsilci No" : "Müşteri No"}</span>
                  <span className="v mono">#{w.ownerNo}</span>
                </div>
                <div className="kv">
                  <span className="k">{lang === "tr" ? "Ad / Unvan" : "Name / Title"}</span>
                  <span className="v">{w.ownerName}</span>
                </div>
                <div className="kv">
                  <span className="k">{t("cd_phone")}</span>
                  <span className="v mono">{w.phone}</span>
                </div>
                <div className="kv">
                  <span className="k">{w.idKind || "ID"}</span>
                  <span className="v mono">{w.idNo}</span>
                </div>
                {w.city && (
                  <div className="kv" style={{ gridColumn: "1 / -1" }}>
                    <span className="k">{t("cd_city")}</span>
                    <span className="v">{w.city}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="section-h" style={{ marginTop: 22 }}>
            {lang === "tr" ? "Bugün" : "Today"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="kpi">
              <span className="kpi-label">{t("wl_c_tx_count")}</span>
              <span className="kpi-value sm">{w.txToday}</span>
            </div>
            <div className="kpi">
              <span className="kpi-label">{t("wl_c_tx_amount")}</span>
              <span className="kpi-value sm">{fmtAmount(w.txAmtToday, w.ccy, lang)} <span className="t-mute fs-11">{w.ccy}</span></span>
            </div>
          </div>

          <div className="section-h" style={{ marginTop: 22 }}>
            {lang === "tr" ? "Sistem Bilgisi" : "System"}
          </div>
          <div className="kv-grid">
            <div className="kv"><span className="k">{t("wl_c_acc_no")}</span><span className="v mono">{w.walletNo}</span></div>
            <div className="kv"><span className="k">{lang === "tr" ? "Cüzdan ID" : "Wallet ID"}</span><span className="v mono">{w.id}</span></div>
            <div className="kv"><span className="k">{t("wl_c_created")}</span><span className="v mono">{w.createdAt}</span></div>
            <div className="kv"><span className="k">{t("wl_c_ccy")}</span><span className="v mono">{w.ccy}</span></div>
          </div>
        </div>
        <div className="foot">
          <button className="btn">
            {React.createElement(I.eye, { size: 13 })} 4.2 {lang === "tr" ? "Aktiviteler" : "Activities"}
          </button>
          <button className="btn primary">
            4.1 {lang === "tr" ? "Cüzdan Detay" : "Wallet Detail"} {React.createElement(I.arrow, { size: 13 })}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────── Main wallets page ───────────
function WalletsPage({ t, lang, role }) {
  const I = window.Icon;
  const allowedCats = ROLE_VIS[role] || ["customer", "agent"];
  const all = window.WALLETS.filter(w => allowedCats.includes(w.cat));

  // default category tab — first allowed
  const initCat = allowedCats.includes("customer") ? "customer"
                : allowedCats[0];
  const [cat, setCat] = React.useState(initCat);
  React.useEffect(() => { setCat(allowedCats.includes("customer") ? "customer" : allowedCats[0]); }, [role]);

  const [query, setQuery] = React.useState("");
  const [showAdv, setShowAdv] = React.useState(false);
  const [filters, setFilters] = React.useState({ type: "any", state: "any", from: "", to: "" });
  const [ccyFilter, setCcyFilter] = React.useState("all");
  const [sort, setSort] = React.useState({ col: "id", dir: "asc" });
  const [selected, setSelected] = React.useState(new Set());
  const [pageSize, setPageSize] = React.useState(20);
  const [page, setPage] = React.useState(1);
  const [drawerW, setDrawerW] = React.useState(null);

  // narrow first by category tab
  const catScoped = React.useMemo(() => {
    if (cat === "all") return all;
    return all.filter(w => w.cat === cat);
  }, [all, cat]);

  // counts per currency for the chip group
  const ccyCounts = React.useMemo(() => {
    const o = {};
    catScoped.forEach(w => { o[w.ccy] = (o[w.ccy] || 0) + 1; });
    return o;
  }, [catScoped]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return catScoped.filter(w => {
      if (ccyFilter !== "all" && w.ccy !== ccyFilter) return false;
      if (filters.type !== "any" && w.type !== filters.type) return false;
      if (filters.state === "full" && w.blocked !== -1) return false;
      if (filters.state === "partial" && !(w.blocked > 0)) return false;
      if (filters.state === "negative" && !(w.balance < 0)) return false;
      if (filters.state === "normal" && (w.blocked !== 0 || w.balance < 0)) return false;
      if (filters.from && w.createdAt < filters.from) return false;
      if (filters.to && w.createdAt > filters.to) return false;
      if (q) {
        const hay = [String(w.ownerNo ?? ""), w.walletNo, w.ownerName, w.phone ?? "", w.idNo ?? ""].join(" ").toLocaleLowerCase("tr-TR");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [catScoped, query, filters, ccyFilter]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    const { col, dir } = sort;
    arr.sort((a, b) => {
      let av, bv;
      if (col === "available") { av = a.available; bv = b.available; }
      else if (col === "balance") { av = a.balance; bv = b.balance; }
      else if (col === "type") { av = a.type; bv = b.type; }
      else { av = a[col]; bv = b[col]; }
      if (typeof av === "string") av = av.toLocaleLowerCase("tr-TR");
      if (typeof bv === "string") bv = bv.toLocaleLowerCase("tr-TR");
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  React.useEffect(() => { setPage(1); }, [cat, query, filters, ccyFilter, pageSize]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const allSelectedOnPage = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));
  const someSelectedOnPage = pageRows.some(r => selected.has(r.id)) && !allSelectedOnPage;

  function toggleAll() {
    const ns = new Set(selected);
    if (allSelectedOnPage) pageRows.forEach(r => ns.delete(r.id));
    else pageRows.forEach(r => ns.add(r.id));
    setSelected(ns);
  }
  function toggleOne(id) {
    const ns = new Set(selected);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    setSelected(ns);
  }
  function clearFilters() {
    setFilters({ type: "any", state: "any", from: "", to: "" });
    setQuery("");
    setCcyFilter("all");
  }
  function setSortCol(col) {
    if (sort.col === col) setSort({ col, dir: sort.dir === "asc" ? "desc" : "asc" });
    else setSort({ col, dir: "asc" });
  }
  function Th({ col, label, align }) {
    const on = sort.col === col;
    return (
      <th className={`${align === "r" ? "r" : ""} ${on ? "sorted" : ""}`} onClick={() => setSortCol(col)}>
        <span className="th-content">
          {label}
          <span className="sort-ind">{on ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}</span>
        </span>
      </th>
    );
  }

  // Category tabs (only allowed ones enabled)
  const ALL_TABS = [
    { key: "all",      label: t("wl_cat_all") },
    { key: "customer", label: t("wl_cat_customer") },
    { key: "agent",    label: t("wl_cat_agent") },
    { key: "system",   label: t("wl_cat_system") },
  ];
  const tabsToShow = allowedCats.length === 3 ? ALL_TABS : [
    { key: "all", label: t("wl_cat_all") },
    ...ALL_TABS.filter(tab => allowedCats.includes(tab.key)),
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("wl_title")}</h1>
          <p className="page-subtitle">{t("wl_subtitle")}</p>
        </div>
        <div className="head-actions">
          <button className="btn">
            {React.createElement(I.download, { size: 13 })} {t("cust_export")}
          </button>
          <button className="btn">
            {React.createElement(I.refresh, { size: 13 })} {t("refresh_all")}
          </button>
          <button className="btn">
            {React.createElement(I.filter, { size: 13 })} {t("cust_columns")}
          </button>
        </div>
      </div>

      {/* role-based visibility hint */}
      <div className="role-hint">
        <div className="ic">{React.createElement(I.shield, { size: 13 })}</div>
        <span>{t(`wl_role_info_${role}`)}</span>
      </div>

      <WStatStrip t={t} lang={lang} wallets={all} />

      {/* Category tabs */}
      {tabsToShow.length > 2 && (
        <div style={{ marginBottom: 12 }}>
          <div className="cat-tabs">
            {tabsToShow.map(tab => {
              const allowed = tab.key === "all" || allowedCats.includes(tab.key);
              const count = tab.key === "all" ? all.length : all.filter(w => w.cat === tab.key).length;
              return (
                <button key={tab.key}
                        className={`cat-tab ${cat === tab.key ? "on" : ""} ${!allowed ? "dis" : ""}`}
                        onClick={() => allowed && setCat(tab.key)}
                        disabled={!allowed}>
                  {tab.label}
                  <span className="ct-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <WFilterBar t={t} lang={lang}
        query={query} setQuery={setQuery}
        showAdv={showAdv} setShowAdv={setShowAdv}
        filteredCount={sorted.length} total={catScoped.length}
        ccyFilter={ccyFilter} setCcyFilter={setCcyFilter}
        counts={ccyCounts} />
      {showAdv && (
        <WAdvanced t={t} filters={filters} setFilters={setFilters}
                   allowedCats={cat === "all" ? allowedCats : [cat]}
                   onClear={clearFilters} />
      )}

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span><b className="mono">{selected.size}</b> {t("cust_selected")}</span>
          <div className="bulk-actions">
            <button className="btn ghost">
              {React.createElement(I.download, { size: 12 })} {t("cust_bulk_export")}
            </button>
            <button className="btn ghost" onClick={() => setSelected(new Set())}>
              {React.createElement(I.close, { size: 12 })} {t("cust_bulk_clear")}
            </button>
          </div>
        </div>
      )}

      <div className="grid-card">
        <div className="data-grid-wrap">
          <table className="data-grid" style={{ minWidth: 1400 }}>
            <thead>
              <tr>
                <th className="cb">
                  <input type="checkbox" className={`cbx ${someSelectedOnPage ? "indet" : ""}`}
                         checked={allSelectedOnPage}
                         onChange={toggleAll} />
                </th>
                <Th col="ownerNo" label={t("wl_c_owner_no")} />
                <Th col="walletNo" label={t("wl_c_acc_no")} />
                <Th col="type" label={t("wl_c_type")} />
                <Th col="ownerName" label={t("wl_c_name")} />
                <th>{t("wl_c_phone")}</th>
                <th>{t("wl_c_id")}</th>
                <Th col="available" label={t("wl_c_available")} align="r" />
                <Th col="balance" label={t("wl_c_blocked")} align="r" />
                <th>{t("wl_c_ccy")}</th>
                <th className="r">{t("wl_c_tx_count")}</th>
                <th className="r">{t("wl_c_tx_amount")}</th>
                <Th col="createdAt" label={t("wl_c_created")} />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr><td colSpan={13}>
                  <div className="empty-state">
                    <div className="glyph">{React.createElement(I.search, { size: 22 })}</div>
                    <h3>{t("empty_title")}</h3>
                    <p>{t("empty_desc")}</p>
                  </div>
                </td></tr>
              )}
              {pageRows.map(w => (
                <tr key={w.id}
                    className={selected.has(w.id) ? "selected" : ""}
                    onClick={() => setDrawerW(w)}>
                  <td className="cb" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="cbx"
                           checked={selected.has(w.id)}
                           onChange={() => toggleOne(w.id)} />
                  </td>
                  <td>
                    {w.cat === "system"
                      ? <span className="dash">—</span>
                      : <span className="cust-no">#{w.ownerNo}</span>}
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span className="mono fs-12">{w.walletNo}</span>
                      <span className={`cat-badge ${w.cat}`}>{t(`wl_owner_${w.cat}`)}</span>
                    </span>
                  </td>
                  <td><WalletTypeCell w={w} t={t} /></td>
                  <td>
                    {w.cat === "system"
                      ? <span className="dash">—</span>
                      : <span className="fs-12" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", verticalAlign: "middle" }}>{w.ownerName}</span>}
                  </td>
                  <td>
                    {w.cat === "system"
                      ? <span className="dash">—</span>
                      : <span className="mono fs-12 t-soft">{w.phone}</span>}
                  </td>
                  <td>
                    {w.cat === "system"
                      ? <span className="dash">—</span>
                      : <span className="idno"><span className="kind">{w.idKind}</span>{w.idNo}</span>}
                  </td>
                  <td className="r"><MoneyCell n={w.available} ccy="" lang={lang} big /></td>
                  <td className="r"><BlockedCell w={w} lang={lang} t={t} /></td>
                  <td><span className="mono fs-12">{w.ccy}</span></td>
                  <td className="r mono fs-12">{w.txToday || <span className="dash">0</span>}</td>
                  <td className="r mono fs-12">{w.txAmtToday ? fmtAmount(w.txAmtToday, w.ccy, lang) : <span className="dash">—</span>}</td>
                  <td className="mono fs-12 t-soft">{w.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>{t("p_rows_per")}</span>
          <select className="select" style={{ width: 64, height: 26, padding: "0 6px" }}
                  value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="t-mute" style={{ marginLeft: 14 }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} {t("cust_of")} {window.fmtNumber(sorted.length, lang)}
          </span>
          <div className="right">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
            {(() => {
              const pages = [];
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const end = Math.min(totalPages, start + 4);
              for (let p = start; p <= end; p++) pages.push(p);
              return pages.map(p => (
                <button key={p} className={`page-btn ${p === page ? "on" : ""}`} onClick={() => setPage(p)}>{p}</button>
              ));
            })()}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>

      <WalletDrawer t={t} lang={lang} w={drawerW} onClose={() => setDrawerW(null)} />
    </>
  );
}

window.WalletsPage = WalletsPage;
