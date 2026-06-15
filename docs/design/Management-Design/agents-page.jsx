// agents-page.jsx — Temsilciler grid, stat-strip, filters, drawer.

// ─────────── helpers ───────────
function AgentInitials({ a }) {
  // First two meaningful words
  const words = a.name.split(/\s+/)
    .filter(w => w.length > 1 && !/^(A\.Ş\.|Ltd\.|Şti\.)$/.test(w));
  return words.slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function GroupPill({ group }) {
  return <span className={`grp-pill ${group.key}`}>{group.label}</span>;
}

function FreqLabel({ f, t }) {
  return (
    <span className={`freq ${f}`}>
      <span className="dot"></span>
      {f === "realtime" ? t("set_realtime")
       : f === "daily"  ? t("set_daily")
       : f === "weekly" ? t("set_weekly")
       :                  t("set_monthly")}
    </span>
  );
}

function fmtCcyAmount(n, lang, ccy) {
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function BalanceCell({ b, lang }) {
  function row(ccy, amt) {
    const cls = amt < 0 ? "neg" : amt === 0 ? "zero" : (ccy === "TRY" && amt < 5000) ? "low" : "";
    return (
      <>
        <span className="ccy">{ccy}</span>
        <span className={`amt ${cls}`}>{fmtCcyAmount(amt, lang, ccy)}</span>
      </>
    );
  }
  return (
    <div className="balance">
      {row("TRY", b.TRY)}
      {row("USD", b.USD)}
      {row("EUR", b.EUR)}
    </div>
  );
}

function AgentStatusPill({ a, t }) {
  const label = {
    active:   t("st_active"),
    inactive: t("st_inactive"),
    blocked:  t("st_blocked"),
    closed:   t("st_closed"),
  }[a.status];
  const reason = a.blockReason || a.closeReason;
  return <span className={`st ${a.status}`}>{label}{reason ? ` – ${reason}` : ""}</span>;
}

function fmtDate(iso, lang, t) {
  if (iso === "today") return t("ag_today");
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US",
    { year: "numeric", month: "short", day: "2-digit" });
}

// ─────────── Stat strip ───────────
function StatStrip({ t, lang, agents }) {
  const I = window.Icon;
  const active = agents.filter(a => a.status === "active").length;
  const totalTRY = agents.reduce((s, a) => s + a.balance.TRY, 0);
  const lowBal = agents.filter(a => a.balance.TRY < 5000 && a.balance.TRY >= 0 && a.status === "active").length;
  const negBal = agents.filter(a => a.balance.TRY < 0).length;
  const blocked = agents.filter(a => a.status === "blocked").length;
  const txToday = agents.reduce((s, a) => s + a.txToday, 0);
  return (
    <div className="stat-strip">
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.building, { size: 12 })}
          {t("ag_stat_total")}
        </span>
        <span className="val">{window.fmtNumber(active, lang)} <span className="t-mute fs-12">/ {agents.length}</span></span>
        <span className="sub up">↑ 2 {lang === "tr" ? "bu hafta" : "this week"}</span>
      </div>
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.wallet, { size: 12 })}
          {t("ag_stat_advance")}
        </span>
        <span className="val">{window.fmtMoney(totalTRY, lang)}</span>
        <span className="sub">USD/EUR {lang === "tr" ? "hariç" : "excl."}</span>
      </div>
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.warning, { size: 12 })}
          {t("ag_stat_low")}
        </span>
        <span className="val">
          {window.fmtNumber(lowBal, lang)}
          {negBal > 0 && <span className="t-mute fs-12" style={{ color: "var(--danger-fg)" }}> · {negBal} <span style={{ fontSize: 10 }}>{t("ag_balance_neg").toLowerCase()}</span></span>}
        </span>
        <span className="sub">{t("ag_low_thresh")}</span>
      </div>
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.ban, { size: 12 })}
          {t("ag_stat_blocked")}
        </span>
        <span className="val" style={{ color: blocked > 0 ? "var(--danger-fg)" : undefined }}>
          {window.fmtNumber(blocked, lang)}
        </span>
        <span className="sub">{lang === "tr" ? "İncele" : "Review"} →</span>
      </div>
      <div className="stat-tile">
        <span className="lbl">
          {React.createElement(I.transfer, { size: 12 })}
          {t("ag_stat_tx_today")}
        </span>
        <span className="val">{window.fmtNumber(txToday, lang)}</span>
        <span className="sub up">↑ 12% {lang === "tr" ? "düne göre" : "vs yesterday"}</span>
      </div>
    </div>
  );
}

// ─────────── Filter bar (agents) ───────────
function AgentFilterBar({ t, lang, query, setQuery, statusFilter, setStatusFilter, showAdv, setShowAdv, filteredCount, total, counts }) {
  const I = window.Icon;
  const chips = [
    { v: "active",   label: t("st_active"),   count: counts.active },
    { v: "inactive", label: t("st_inactive"), count: counts.inactive },
    { v: "blocked",  label: t("st_blocked"),  count: counts.blocked },
    { v: "closed",   label: t("st_closed"),   count: counts.closed },
    { v: "all",      label: t("st_all"),      count: total },
  ];
  return (
    <div className="filter-bar">
      <div className="chips">
        {chips.map(c => (
          <button key={c.v}
                  className={`chip ${statusFilter === c.v ? "on" : ""}`}
                  onClick={() => setStatusFilter(c.v)}>
            {c.label}
            <span className="chip-count">{c.count}</span>
          </button>
        ))}
      </div>
      <div className="search">
        {React.createElement(I.search, { size: 14, className: "s-icon", style: { position: "absolute", left: 10, top: 9 } })}
        <input type="text" placeholder={t("ag_search_ph")} value={query}
               onChange={e => setQuery(e.target.value)} />
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

function AgentAdvancedFilters({ t, lang, filters, setFilters, onClear }) {
  const upd = (k, v) => setFilters({ ...filters, [k]: v });
  return (
    <div className="adv-filters">
      <div className="form-grp">
        <label>{t("ag_af_group")}</label>
        <select className="select" value={filters.group} onChange={e => upd("group", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          {window.AGENT_GROUPS.map(g => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
      </div>
      <div className="form-grp">
        <label>{t("ag_af_settlement")}</label>
        <select className="select" value={filters.settlement} onChange={e => upd("settlement", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          <option value="realtime">{t("set_realtime")}</option>
          <option value="daily">{t("set_daily")}</option>
          <option value="weekly">{t("set_weekly")}</option>
          <option value="monthly">{t("set_monthly")}</option>
        </select>
      </div>
      <div className="form-grp">
        <label>{t("ag_af_balance")}</label>
        <select className="select" value={filters.balance} onChange={e => upd("balance", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          <option value="neg">{t("ag_balance_neg")}</option>
          <option value="low">{t("ag_balance_low")}</option>
          <option value="normal">{t("ag_balance_normal")}</option>
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
function AgentDrawer({ t, lang, a, onClose }) {
  const I = window.Icon;
  React.useEffect(() => {
    if (!a) return;
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [a, onClose]);
  if (!a) return null;
  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose}></div>
      <div className="cust-drawer open" role="dialog">
        <div className="head">
          <span className="avatar corp" style={{ width: 44, height: 44, fontSize: 14 }}>
            <AgentInitials a={a} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{a.name}</h2>
            <div className="sub">
              <span className="mono">#{a.id}</span>
              <GroupPill group={a.group} />
              <AgentStatusPill a={a} t={t} />
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            {React.createElement(I.close, { size: 16 })}
          </button>
        </div>
        <div className="body">
          <div className="kv-grid">
            <div className="kv"><span className="k">{t("cd_email")}</span><span className="v" title={a.email}>{a.email}</span></div>
            <div className="kv"><span className="k">{t("cd_phone")}</span><span className="v mono">{a.phone}</span></div>
            <div className="kv"><span className="k">VKN</span><span className="v mono">{a.vkn}</span></div>
            <div className="kv"><span className="k">{t("ag_mersis")}</span><span className="v mono">{a.mersis}</span></div>
            <div className="kv"><span className="k">{t("cd_city")}</span><span className="v">{a.city}</span></div>
            <div className="kv"><span className="k">{t("ag_branches")}</span><span className="v mono">{a.branches}</span></div>
            <div className="kv"><span className="k">{t("ag_c_settlement")}</span><span className="v"><FreqLabel f={a.settlement} t={t} /></span></div>
            <div className="kv"><span className="k">{t("ag_commission")}</span><span className="v mono">% {(a.group.commission).toFixed(2)}</span></div>
            <div className="kv"><span className="k">{t("cd_created")}</span><span className="v mono">{fmtDate(a.createdAt, lang, t)}</span></div>
            <div className="kv"><span className="k">{t("ag_last_tx")}</span><span className="v mono">{fmtDate(a.lastTxAt, lang, t)}</span></div>
          </div>
          <div className="section-h" style={{ marginTop: 22 }}>{t("ag_c_balance")}</div>
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {["TRY", "USD", "EUR"].map(ccy => {
              const v = a.balance[ccy];
              const cls = v < 0 ? "neg" : v === 0 ? "zero" : (ccy === "TRY" && v < 5000) ? "low" : "";
              return (
                <div key={ccy} className="kpi">
                  <span className="kpi-label">{ccy}</span>
                  <span className={`kpi-value sm amount ${cls === "neg" ? "" : ""}`}
                        style={{ color: cls === "neg" ? "var(--danger-fg)" : cls === "low" ? "var(--warn-fg)" : "inherit" }}>
                    {fmtCcyAmount(v, lang, ccy)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="section-h" style={{ marginTop: 22 }}>{t("ag_today_tx")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <div className="kpi">
              <span className="kpi-label">{t("ag_today_tx")}</span>
              <span className="kpi-value sm">{a.txToday}</span>
            </div>
            <div className="kpi">
              <span className="kpi-label">{lang === "tr" ? "Hacim (TRY)" : "Volume (TRY)"}</span>
              <span className="kpi-value sm">{window.fmtMoney(a.txToday * 4200, lang)}</span>
            </div>
          </div>
        </div>
        <div className="foot">
          <button className="btn">
            {React.createElement(I.eye, { size: 13 })} {t("cd_edit")}
          </button>
          <button className="btn primary">
            {t("cd_open")} {React.createElement(I.arrow, { size: 13 })}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────── Main agents page ───────────
function AgentsPage({ t, lang, role }) {
  const I = window.Icon;
  const [statusFilter, setStatusFilter] = React.useState("active");
  const [query, setQuery] = React.useState("");
  const [showAdv, setShowAdv] = React.useState(false);
  const [filters, setFilters] = React.useState({
    group: "any", settlement: "any", balance: "any", from: "", to: "",
  });
  const [sort, setSort] = React.useState({ col: "id", dir: "asc" });
  const [selected, setSelected] = React.useState(new Set());
  const [pageSize, setPageSize] = React.useState(20);
  const [page, setPage] = React.useState(1);
  const [drawerA, setDrawerA] = React.useState(null);
  const [hqInfoOpen, setHqInfoOpen] = React.useState(false);

  const all = window.AGENTS;
  const counts = React.useMemo(() => ({
    active:   all.filter(a => a.status === "active").length,
    inactive: all.filter(a => a.status === "inactive").length,
    blocked:  all.filter(a => a.status === "blocked").length,
    closed:   all.filter(a => a.status === "closed").length,
  }), [all]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return all.filter(a => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (filters.group !== "any" && a.group.key !== filters.group) return false;
      if (filters.settlement !== "any" && a.settlement !== filters.settlement) return false;
      if (filters.balance === "neg" && !(a.balance.TRY < 0)) return false;
      if (filters.balance === "low" && !(a.balance.TRY >= 0 && a.balance.TRY < 5000)) return false;
      if (filters.balance === "normal" && !(a.balance.TRY >= 5000)) return false;
      if (filters.from && a.createdAt < filters.from) return false;
      if (filters.to && a.createdAt > filters.to) return false;
      if (q) {
        const hay = [String(a.id), a.name, a.email, a.phone, a.vkn].join(" ").toLocaleLowerCase("tr-TR");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, statusFilter, query, filters]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    const { col, dir } = sort;
    arr.sort((a, b) => {
      let av, bv;
      if (col === "group") { av = a.group.label; bv = b.group.label; }
      else if (col === "balance") { av = a.balance.TRY; bv = b.balance.TRY; }
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

  React.useEffect(() => { setPage(1); }, [statusFilter, query, filters, pageSize]);
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
    setFilters({ group: "any", settlement: "any", balance: "any", from: "", to: "" });
    setQuery("");
  }
  function setSortCol(col) {
    if (sort.col === col) setSort({ col, dir: sort.dir === "asc" ? "desc" : "asc" });
    else setSort({ col, dir: "asc" });
  }
  function Th({ col, label, align = "l" }) {
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

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("ag_title")}</h1>
          <p className="page-subtitle">{t("ag_subtitle")}</p>
        </div>
        <div className="head-actions">
          <button className="btn">
            {React.createElement(I.download, { size: 13 })} {t("cust_export")}
          </button>
          <button className="btn">
            {React.createElement(I.filter, { size: 13 })} {t("cust_columns")}
          </button>
          <div style={{ position: "relative" }}>
            <button className="btn primary" onClick={() => setHqInfoOpen(true)}>
              {React.createElement(I.plus, { size: 13 })} {t("ag_new")}
            </button>
            {hqInfoOpen && (
              <div className="popover" style={{ width: 280, top: 38, right: 0, padding: 14, position: "absolute" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--warn-soft)", color: "var(--warn-fg)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {React.createElement(I.info, { size: 14 })}
                  </div>
                  <div style={{ fontSize: 12.5 }}>
                    <b style={{ display: "block", marginBottom: 4 }}>{t("tp_corp_t")}</b>
                    <span className="t-mute">{t("ag_only_hq")}</span>
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button className="btn ghost" style={{ padding: "3px 8px" }} onClick={() => setHqInfoOpen(false)}>{t("s_cancel")}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <StatStrip t={t} lang={lang} agents={all} />

      <AgentFilterBar t={t} lang={lang}
        query={query} setQuery={setQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        showAdv={showAdv} setShowAdv={setShowAdv}
        filteredCount={sorted.length} total={all.length}
        counts={counts} />
      {showAdv && (
        <AgentAdvancedFilters t={t} lang={lang}
          filters={filters} setFilters={setFilters} onClear={clearFilters} />
      )}

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span><b className="mono">{selected.size}</b> {t("cust_selected")}</span>
          <div className="bulk-actions">
            <button className="btn ghost">
              {React.createElement(I.download, { size: 12 })} {t("cust_bulk_export")}
            </button>
            <button className="btn ghost">
              {React.createElement(I.refresh, { size: 12 })} {lang === "tr" ? "Mutabakat maili" : "Reconcile email"}
            </button>
            <button className="btn ghost" onClick={() => setSelected(new Set())}>
              {React.createElement(I.close, { size: 12 })} {t("cust_bulk_clear")}
            </button>
          </div>
        </div>
      )}

      <div className="grid-card">
        <div className="data-grid-wrap">
          <table className="data-grid">
            <thead>
              <tr>
                <th className="cb">
                  <input type="checkbox" className={`cbx ${someSelectedOnPage ? "indet" : ""}`}
                         checked={allSelectedOnPage}
                         onChange={toggleAll} />
                </th>
                <Th col="id" label={t("ag_c_no")} />
                <Th col="name" label={t("ag_c_name")} />
                <th>{t("ag_c_contact")}</th>
                <th>{t("ag_c_vkn")}</th>
                <Th col="group" label={t("ag_c_group")} />
                <Th col="balance" label={t("ag_c_balance")} align="r" />
                <Th col="settlement" label={t("ag_c_settlement")} />
                <Th col="createdAt" label={t("ag_c_created")} />
                <Th col="lastTxAt" label={t("ag_c_lasttx")} />
                <Th col="status" label={t("ag_c_status")} />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <div className="empty-state">
                      <div className="glyph">{React.createElement(I.search, { size: 22 })}</div>
                      <h3>{t("empty_title")}</h3>
                      <p>{t("empty_desc")}</p>
                    </div>
                  </td>
                </tr>
              )}
              {pageRows.map(a => (
                <tr key={a.id}
                    className={selected.has(a.id) ? "selected" : ""}
                    onClick={() => setDrawerA(a)}>
                  <td className="cb" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="cbx"
                           checked={selected.has(a.id)}
                           onChange={() => toggleOne(a.id)} />
                  </td>
                  <td><span className="cust-no">#{a.id}</span></td>
                  <td style={{ minWidth: 280 }}>
                    <span className="agent-cell">
                      <span className="ic"><AgentInitials a={a} /></span>
                      <span className="meta">
                        <b>{a.name}</b>
                        <span>{a.city} · {a.branches} {t("ag_branches").toLowerCase()}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="contact-cell">
                      <b>{a.email}</b>
                      <span>{a.phone}</span>
                    </span>
                  </td>
                  <td className="mono fs-12">{a.vkn}</td>
                  <td><GroupPill group={a.group} /></td>
                  <td style={{ minWidth: 170 }}><BalanceCell b={a.balance} lang={lang} /></td>
                  <td><FreqLabel f={a.settlement} t={t} /></td>
                  <td className="mono fs-12 t-soft">{fmtDate(a.createdAt, lang, t)}</td>
                  <td className="mono fs-12 t-soft">
                    {a.lastTxAt === "today"
                      ? <span style={{ color: "var(--ok-fg)" }}>{t("ag_today")}</span>
                      : fmtDate(a.lastTxAt, lang, t)}
                  </td>
                  <td><AgentStatusPill a={a} t={t} /></td>
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

      <AgentDrawer t={t} lang={lang} a={drawerA} onClose={() => setDrawerA(null)} />
    </>
  );
}

window.AgentsPage = AgentsPage;
