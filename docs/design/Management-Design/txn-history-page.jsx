// txn-history-page.jsx — İşlem Hareketleri (7) read-only listing + detail drawer.

function thFmtCur(n, ccy, lang) {
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + " " + ccy;
}
function thFmtTRY(n, lang) {
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
}
function thFmtDate(iso, lang) {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "2-digit", month: "short", year: "numeric" })
    + " · " + d.toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

const TS_TONE = {
  completed: "ok", pending: "warn", sent: "info",
  onhold: "danger", rejected: "danger", cancelled: "muted", error: "danger",
};
function TxnStatus({ s, t }) {
  return <span className={`badge ${TS_TONE[s] || "muted"}`}>{t(`ts_${s}`)}</span>;
}

function TxnTypeBadge({ ty, lang }) {
  return (
    <span className="kyc-pill" style={{ borderColor: "var(--line)" }}>
      <span className="t-mute" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{ty.no}</span>
      {lang === "tr" ? ty.tr : ty.en}
    </span>
  );
}

function PartyCell({ name, corp }) {
  const initials = corp
    ? name.split(/\s+/).filter(w => w.length > 1 && !/^(A\.Ş\.|Ltd\.|Şti\.)$/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="cust-cell">
      <span className={`avatar ${corp ? "corp" : "indv-m"}`} style={{ width: 24, height: 24, fontSize: 9.5 }}>{initials}</span>
      <span className="meta-2"><b style={{ maxWidth: 150 }}>{name}</b></span>
    </span>
  );
}

// ─────────── Detail drawer (1.1 Detay Modu — read-only, no buttons) ───────────
function TxnDetailDrawer({ t, lang, txn, onClose }) {
  const I = window.Icon;
  React.useEffect(() => {
    if (!txn) return;
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [txn, onClose]);
  if (!txn) return null;
  const fee = Math.max(0, Math.round(15 + txn.amount * 0.0012));
  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose}></div>
      <div className="cust-drawer open" role="dialog" style={{ width: 480 }}>
        <div className="head">
          <div style={{ width: 44, height: 44, borderRadius: 11, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--accent-soft)", color: "var(--accent-fg)" }}>
            {React.createElement(I.transfer, { size: 20 })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {txn.id}
              <span className="badge muted" style={{ fontSize: 10 }}>1.1</span>
            </h2>
            <div className="sub">
              <TxnStatus s={txn.status} t={t} />
              <span className="t-mute">{t("th_detail_mode")}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            {React.createElement(I.close, { size: 16 })}
          </button>
        </div>
        <div className="body">
          <div className="section-h">{t("th_d_parties")}</div>
          <div className="kv-grid">
            <div className="kv"><span className="k">{t("th_c_sender")}</span><span className="v">{txn.sender}</span></div>
            <div className="kv"><span className="k">{t("th_c_receiver")}</span><span className="v">{txn.receiver}</span></div>
            {txn.iban && <div className="kv" style={{ gridColumn: "span 2" }}><span className="k">IBAN</span><span className="v mono">{txn.iban}</span></div>}
            <div className="kv"><span className="k">{t("th_c_role")}</span><span className="v">{txn.role === "sender" ? t("th_role_sender") : t("th_role_receiver")}</span></div>
            <div className="kv"><span className="k">{t("th_c_type")}</span><span className="v">{lang === "tr" ? txn.type.tr : txn.type.en}</span></div>
          </div>

          <div className="section-h" style={{ marginTop: 22 }}>{t("th_d_amounts")}</div>
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
            <div className="sum-row"><span className="k">{t("th_c_amount")}</span><span className="v">{thFmtCur(txn.amount, txn.ccy, lang)}</span></div>
            <div className="sum-row"><span className="k">{t("pt_sum_fee")}</span><span className="v">{thFmtCur(fee, txn.ccy, lang)}</span></div>
            <div className="sum-row total"><span className="k">{t("pt_sum_total")}</span><span className="v">{thFmtCur(txn.amount + fee, txn.ccy, lang)}</span></div>
          </div>

          <div className="section-h" style={{ marginTop: 22 }}>{t("th_d_meta")}</div>
          <div className="kv-grid">
            <div className="kv"><span className="k">{t("th_c_date")}</span><span className="v mono" style={{ whiteSpace: "normal" }}>{thFmtDate(txn.date, lang)}</span></div>
            <div className="kv"><span className="k">{t("th_c_ref")}</span><span className="v mono">{txn.ref}</span></div>
            <div className="kv"><span className="k">{t("th_c_ccy")}</span><span className="v mono">{txn.ccy}</span></div>
            <div className="kv"><span className="k">{t("th_c_desc")}</span><span className="v">{txn.purpose}</span></div>
          </div>

          <div className="section-h" style={{ marginTop: 22 }}>{t("th_d_income")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--ok-soft)", borderRadius: "var(--r-md)", color: "var(--ok-fg)" }}>
            {React.createElement(I.wallet, { size: 18 })}
            <div>
              <div className="fs-11" style={{ opacity: 0.8 }}>{t("th_c_income")}</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{thFmtTRY(txn.incomeTRY, lang)} <span style={{ fontSize: 12 }}>TRY</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TxnHistoryPage({ t, lang }) {
  const I = window.Icon;
  const all = window.TXNS;

  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dateScope, setDateScope] = React.useState("today"); // today | all
  const [query, setQuery] = React.useState("");
  const [showAdv, setShowAdv] = React.useState(false);
  const [filters, setFilters] = React.useState({ type: "any", role: "any", from: "", to: "", min: "", max: "" });
  const [sort, setSort] = React.useState({ col: "date", dir: "desc" });
  const [pageSize, setPageSize] = React.useState(20);
  const [page, setPage] = React.useState(1);
  const [detail, setDetail] = React.useState(null);

  const counts = React.useMemo(() => {
    const base = dateScope === "today" ? all.filter(x => x.isToday) : all;
    const c = { all: base.length };
    ["completed", "pending", "sent", "onhold", "rejected", "cancelled", "error"].forEach(s => {
      c[s] = base.filter(x => x.status === s).length;
    });
    return c;
  }, [all, dateScope]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return all.filter(x => {
      if (dateScope === "today" && !x.isToday) return false;
      if (statusFilter !== "all" && x.status !== statusFilter) return false;
      if (filters.type !== "any" && x.type.code !== filters.type) return false;
      if (filters.role !== "any" && x.role !== filters.role) return false;
      if (filters.min && x.amount < parseFloat(filters.min)) return false;
      if (filters.max && x.amount > parseFloat(filters.max)) return false;
      if (filters.from && x.date.slice(0, 10) < filters.from) return false;
      if (filters.to && x.date.slice(0, 10) > filters.to) return false;
      if (q) {
        const hay = [x.id, x.ref, x.sender, x.receiver, x.iban].join(" ").toLocaleLowerCase("tr-TR");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, dateScope, statusFilter, query, filters]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    const { col, dir } = sort;
    arr.sort((a, b) => {
      let av = col === "type" ? a.type.no : a[col];
      let bv = col === "type" ? b.type.no : b[col];
      if (typeof av === "string") av = av.toLocaleLowerCase("tr-TR");
      if (typeof bv === "string") bv = bv.toLocaleLowerCase("tr-TR");
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  React.useEffect(() => { setPage(1); }, [statusFilter, dateScope, query, filters, pageSize]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  // stats based on filtered set
  const stats = React.useMemo(() => {
    const vol = filtered.reduce((s, x) => s + (x.ccy === "TRY" ? x.amount : x.amount * (x.ccy === "USD" ? 38.82 : 42.04)), 0);
    const inc = filtered.reduce((s, x) => s + x.incomeTRY, 0);
    const pend = filtered.filter(x => ["pending", "sent", "onhold"].includes(x.status)).length;
    return { count: filtered.length, vol: Math.round(vol), inc, pend };
  }, [filtered]);

  function setSortCol(col) {
    if (sort.col === col) setSort({ col, dir: sort.dir === "asc" ? "desc" : "asc" });
    else setSort({ col, dir: col === "date" || col === "amount" || col === "incomeTRY" ? "desc" : "asc" });
  }
  function Th({ col, label, align }) {
    const on = sort.col === col;
    return (
      <th className={`${align === "r" ? "r" : ""} ${on ? "sorted" : ""}`} onClick={() => setSortCol(col)}>
        <span className="th-content">{label}<span className="sort-ind">{on ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}</span></span>
      </th>
    );
  }
  function clearFilters() {
    setFilters({ type: "any", role: "any", from: "", to: "", min: "", max: "" });
    setQuery("");
  }

  const chips = [
    { v: "all", label: t("th_f_all"), count: counts.all },
    { v: "completed", label: t("ts_completed"), count: counts.completed },
    { v: "pending", label: t("ts_pending"), count: counts.pending },
    { v: "sent", label: t("ts_sent"), count: counts.sent },
    { v: "onhold", label: t("ts_onhold"), count: counts.onhold },
    { v: "rejected", label: t("ts_rejected"), count: counts.rejected },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("th_title")}</h1>
          <p className="page-subtitle">{t("th_subtitle")}</p>
        </div>
        <div className="head-actions">
          <div className="seg">
            <button className={dateScope === "today" ? "on" : ""} onClick={() => setDateScope("today")}>{t("th_today_only")}</button>
            <button className={dateScope === "all" ? "on" : ""} onClick={() => setDateScope("all")}>{t("th_all_dates")}</button>
          </div>
          <button className="btn">
            {React.createElement(I.download, { size: 13 })} {t("cust_export")}
          </button>
        </div>
      </div>

      {/* stat strip */}
      <div className="stat-strip" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat-tile">
          <span className="lbl">{React.createElement(I.transfer, { size: 12 })} {t("th_stat_count")}</span>
          <span className="val">{window.fmtNumber(stats.count, lang)}</span>
          <span className="sub">{dateScope === "today" ? t("th_today_only") : t("th_all_dates")}</span>
        </div>
        <div className="stat-tile">
          <span className="lbl">{React.createElement(I.chart, { size: 12 })} {t("th_stat_volume")}</span>
          <span className="val">{thFmtTRY(stats.vol, lang)}</span>
          <span className="sub">≈ TRY</span>
        </div>
        <div className="stat-tile">
          <span className="lbl">{React.createElement(I.wallet, { size: 12 })} {t("th_stat_income")}</span>
          <span className="val" style={{ color: "var(--ok-fg)" }}>{thFmtTRY(stats.inc, lang)}</span>
          <span className="sub up">{lang === "tr" ? "komisyon geliri" : "commission"}</span>
        </div>
        <div className="stat-tile">
          <span className="lbl">{React.createElement(I.clock, { size: 12 })} {t("th_stat_pending")}</span>
          <span className="val" style={{ color: stats.pend ? "var(--warn-fg)" : undefined }}>{window.fmtNumber(stats.pend, lang)}</span>
          <span className="sub">{lang === "tr" ? "bekleyen/gönderildi" : "pending/sent"}</span>
        </div>
      </div>

      {/* filter bar */}
      <div className="filter-bar">
        <div className="chips">
          {chips.map(c => (
            <button key={c.v} className={`chip ${statusFilter === c.v ? "on" : ""}`} onClick={() => setStatusFilter(c.v)}>
              {c.label}<span className="chip-count">{c.count}</span>
            </button>
          ))}
        </div>
        <div className="search">
          {React.createElement(I.search, { size: 14, className: "s-icon", style: { position: "absolute", left: 10, top: 9 } })}
          <input type="text" placeholder={t("th_search_ph")} value={query} onChange={e => setQuery(e.target.value)} />
          {query && <button className="clear" onClick={() => setQuery("")}>{React.createElement(I.close, { size: 12 })}</button>}
        </div>
        <button className={`btn ${showAdv ? "primary" : ""}`} onClick={() => setShowAdv(!showAdv)}>
          {React.createElement(I.filter, { size: 13 })} {showAdv ? t("cust_advanced_close") : t("cust_advanced")}
        </button>
        <div className="filter-meta">
          <span className="mono">{window.fmtNumber(sorted.length, lang)}</span><span>{t("cust_results")}</span>
        </div>
      </div>

      {showAdv && (
        <div className="adv-filters">
          <div className="form-grp">
            <label>{t("th_af_type")}</label>
            <select className="select" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
              <option value="any">{t("af_any")}</option>
              <option value="own">{t("pt_flow_own")}</option>
              <option value="bank">{t("pt_flow_bank")}</option>
              <option value="person">{t("pt_flow_person")}</option>
              <option value="abroad">{t("pt_flow_abroad")}</option>
              <option value="withdraw">{lang === "tr" ? "Para Çekme" : "Withdrawal"}</option>
            </select>
          </div>
          <div className="form-grp">
            <label>{t("th_af_role")}</label>
            <select className="select" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
              <option value="any">{t("af_any")}</option>
              <option value="sender">{t("th_role_sender")}</option>
              <option value="receiver">{t("th_role_receiver")}</option>
            </select>
          </div>
          <div className="form-grp">
            <label>{t("th_af_amt_min")}</label>
            <input className="input" type="number" value={filters.min} onChange={e => setFilters({ ...filters, min: e.target.value })} placeholder="0" />
          </div>
          <div className="form-grp">
            <label>{t("th_af_amt_max")}</label>
            <input className="input" type="number" value={filters.max} onChange={e => setFilters({ ...filters, max: e.target.value })} placeholder="∞" />
          </div>
          <div className="form-grp">
            <label>{t("th_af_date_from")}</label>
            <input className="input" type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div className="form-grp">
            <label>{t("th_af_date_to")}</label>
            <input className="input" type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div className="form-grp" style={{ alignSelf: "flex-end" }}>
            <button className="btn ghost" onClick={clearFilters} style={{ height: 30 }}>
              {React.createElement(I.close, { size: 12 })} {t("cust_clear")}
            </button>
          </div>
        </div>
      )}

      {/* grid */}
      <div className="grid-card">
        <div className="data-grid-wrap">
          <table className="data-grid">
            <thead>
              <tr>
                <Th col="id" label={t("th_c_no")} />
                <Th col="date" label={t("th_c_date")} />
                <Th col="sender" label={t("th_c_sender")} />
                <Th col="receiver" label={t("th_c_receiver")} />
                <th>{t("th_c_iban")}</th>
                <Th col="type" label={t("th_c_type")} />
                <Th col="amount" label={t("th_c_amount")} align="r" />
                <th>{t("th_c_desc")}</th>
                <th>{t("th_c_ref")}</th>
                <Th col="status" label={t("th_c_status")} />
                <th>{t("th_c_role")}</th>
                <Th col="incomeTRY" label={t("th_c_income")} align="r" />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr><td colSpan={12}><div className="empty-state"><div className="glyph">{React.createElement(I.search, { size: 22 })}</div><h3>{t("empty_title")}</h3><p>{t("empty_desc")}</p></div></td></tr>
              )}
              {pageRows.map(x => (
                <tr key={x.id} onClick={() => setDetail(x)}>
                  <td className="mono fs-12">{x.id}</td>
                  <td className="mono fs-12 t-soft" style={{ whiteSpace: "nowrap" }}>{thFmtDate(x.date, lang)}</td>
                  <td><PartyCell name={x.sender} corp={x.senderCorp} /></td>
                  <td><PartyCell name={x.receiver} corp={x.recvCorp} /></td>
                  <td className="mono fs-11 t-mute">{x.iban || t("th_no_iban")}</td>
                  <td><TxnTypeBadge ty={x.type} lang={lang} /></td>
                  <td className="r amount">{thFmtCur(x.amount, x.ccy, lang)}</td>
                  <td className="t-soft fs-12">{x.purpose}</td>
                  <td className="mono fs-11 t-mute">{x.ref}</td>
                  <td><TxnStatus s={x.status} t={t} /></td>
                  <td>
                    <span className={`badge ${x.role === "sender" ? "info" : "muted"}`} style={{ fontFamily: "var(--font-ui)" }}>
                      {x.role === "sender" ? t("th_role_sender_s") : t("th_role_receiver_s")}
                    </span>
                  </td>
                  <td className="r amount" style={{ color: x.incomeTRY > 0 ? "var(--ok-fg)" : "var(--fg-faint)" }}>{thFmtTRY(x.incomeTRY, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>{t("p_rows_per")}</span>
          <select className="select" style={{ width: 64, height: 26, padding: "0 6px" }} value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {[20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="t-mute" style={{ marginLeft: 14 }}>
            {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} {t("cust_of")} {window.fmtNumber(sorted.length, lang)}
          </span>
          <div className="right">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
            {(() => {
              const pages = [];
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const end = Math.min(totalPages, start + 4);
              for (let p = start; p <= end; p++) pages.push(p);
              return pages.map(p => <button key={p} className={`page-btn ${p === page ? "on" : ""}`} onClick={() => setPage(p)}>{p}</button>);
            })()}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>

      <TxnDetailDrawer t={t} lang={lang} txn={detail} onClose={() => setDetail(null)} />
    </>
  );
}

window.TxnHistoryPage = TxnHistoryPage;
