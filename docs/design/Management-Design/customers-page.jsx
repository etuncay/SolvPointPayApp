// customers-page.jsx — Müşteriler grid, filters, drawer, and Add modal.

// ─────────── helpers ───────────
function CustomerAvatar({ c, size = 26 }) {
  const cls = c.type === "corporate" ? "corp"
            : c.type === "prospective" ? "pros"
            : c.isFemale ? "indv-f" : "indv-m";
  const initials = c.type === "corporate"
    ? c.name.split(/\s+/).filter(w => w.length > 1 && !/^(A\.Ş\.|Ltd\.|Şti\.|Koop\.)$/.test(w))
            .slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : c.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className={`avatar ${cls}`} style={{ width: size, height: size }}>{initials}</span>
  );
}

function TypeBadge({ type, t }) {
  if (type === "corporate")   return <span className="type-badge corp">{t("t_corporate")}</span>;
  if (type === "prospective") return <span className="type-badge pros">{t("t_prospective")}</span>;
  return <span className="type-badge indv">{t("t_individual")}</span>;
}

function KycPill({ c }) {
  if (c.type === "corporate") {
    const tone = { Approved: "ok", Pending: "pending", Returned: "pending", Rejected: "rejected" }[c.kyc] || "";
    return <span className={`kyc-pill ${tone}`}>{c.kyc}</span>;
  }
  const tone = c.kyc === "L3" ? "l3" : c.kyc === "L2" ? "l2" : c.kyc === "L1" ? "l1" : "l0";
  return <span className={`kyc-pill ${tone}`}>{c.kyc}</span>;
}

function RiskCell({ c, t }) {
  const w = Math.max(2, c.riskScore);
  return (
    <div className="risk">
      <div className={`risk-bar ${c.riskSeg}`}><span style={{ width: `${w}%` }}></span></div>
      <span className="risk-num">{c.riskScore}</span>
      <span className={`risk-seg ${c.riskSeg}`}>
        {c.riskSeg === "low" ? t("s_low")
         : c.riskSeg === "med" ? t("s_medium")
         : c.riskSeg === "high" ? t("s_high")
         : "Kritik"}
      </span>
    </div>
  );
}

function StatusPill({ c, t }) {
  const label = {
    active:   t("st_active"),
    inactive: t("st_inactive"),
    blocked:  t("st_blocked"),
    closed:   t("st_closed"),
    prospect: t("st_prospect"),
  }[c.status];
  const reason = c.blockReason || c.closeReason;
  return (
    <div className="status-cell">
      <span className={`st ${c.status}`}>{label}{reason ? ` – ${reason}` : ""}</span>
    </div>
  );
}

function fmtDate(iso, lang) {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US",
    { year: "numeric", month: "short", day: "2-digit" });
}

// ─────────── Filter bar ───────────
function FilterBar({
  t, lang, query, setQuery,
  statusFilter, setStatusFilter,
  showAdv, setShowAdv,
  filteredCount, total, counts,
}) {
  const I = window.Icon;
  const chips = [
    { v: "active",   label: t("st_active"),   count: counts.active },
    { v: "inactive", label: t("st_inactive"), count: counts.inactive },
    { v: "blocked",  label: t("st_blocked"),  count: counts.blocked },
    { v: "closed",   label: t("st_closed"),   count: counts.closed },
    { v: "prospect", label: t("st_prospect"), count: counts.prospect },
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
        <input type="text" placeholder={t("cust_search_ph")}
               value={query} onChange={e => setQuery(e.target.value)} />
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

// ─────────── Advanced filter panel ───────────
function AdvancedFilters({ t, lang, filters, setFilters, onClear }) {
  const upd = (k, v) => setFilters({ ...filters, [k]: v });
  return (
    <div className="adv-filters">
      <div className="form-grp">
        <label>{t("af_type")}</label>
        <select className="select" value={filters.type} onChange={e => upd("type", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          <option value="individual">{t("t_individual")}</option>
          <option value="corporate">{t("t_corporate")}</option>
          <option value="prospective">{t("t_prospective")}</option>
        </select>
      </div>
      <div className="form-grp">
        <label>{t("af_kyc")}</label>
        <select className="select" value={filters.kyc} onChange={e => upd("kyc", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          <optgroup label={t("t_individual")}>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="Tier 0">Tier 0</option>
          </optgroup>
          <optgroup label={t("t_corporate")}>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Returned">Returned</option>
            <option value="Rejected">Rejected</option>
          </optgroup>
        </select>
      </div>
      <div className="form-grp">
        <label>{t("af_risk")}</label>
        <select className="select" value={filters.risk} onChange={e => upd("risk", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          <option value="low">{t("s_low")}</option>
          <option value="med">{t("s_medium")}</option>
          <option value="high">{t("s_high")}</option>
          <option value="critical">Kritik</option>
        </select>
      </div>
      <div className="form-grp">
        <label>{t("af_campaign")}</label>
        <select className="select" value={filters.campaign} onChange={e => upd("campaign", e.target.value)}>
          <option value="any">{t("af_any")}</option>
          <option value="__none__">{t("af_none")}</option>
          {[...new Set(window.CUSTOMERS.map(c => c.campaign).filter(Boolean))].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
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

// ─────────── Add-customer type picker ───────────
function TypePickerModal({ t, onClose, onPick }) {
  const I = window.Icon;
  React.useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{t("tp_title")}</h2>
          <p>{t("tp_desc")}</p>
        </div>
        <div className="modal-body">
          <button className="type-card" onClick={() => onPick("individual")}>
            <div className="ic indv">{React.createElement(I.user, { size: 20 })}</div>
            <div>
              <b>{t("tp_indv_t")}</b>
              <span className="desc">{t("tp_indv_d")}</span>
            </div>
            <span className="arr">{React.createElement(I.chevron, { size: 14 })}</span>
          </button>
          <button className="type-card dis" onClick={(e) => e.preventDefault()}>
            <div className="ic corp">{React.createElement(I.building, { size: 20 })}</div>
            <div>
              <b>{t("tp_corp_t")}</b>
              <span className="desc">{t("tp_corp_notice")}</span>
            </div>
            <span className="arr" style={{ fontSize: 10.5, color: "var(--fg-muted)" }}>{t("tp_corp_dis")}</span>
          </button>
          <button className="type-card" onClick={() => onPick("prospective")}>
            <div className="ic indv" style={{ background: "var(--bg-sunken)", color: "var(--fg-soft)" }}>
              {React.createElement(I.plus, { size: 20 })}
            </div>
            <div>
              <b>{t("tp_pros_t")}</b>
              <span className="desc">{t("tp_pros_d")}</span>
            </div>
            <span className="arr">{React.createElement(I.chevron, { size: 14 })}</span>
          </button>
        </div>
        <div className="modal-foot">
          Esc · {t("s_cancel")}
        </div>
      </div>
    </div>
  );
}

// ─────────── Customer detail drawer ───────────
function CustomerDrawer({ t, lang, c, onClose }) {
  const I = window.Icon;
  const [tab, setTab] = React.useState("overview");
  React.useEffect(() => {
    if (!c) return;
    setTab("overview");
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [c, onClose]);
  if (!c) return null;
  const tabs = [
    { id: "overview", label: t("cd_overview") },
    { id: "kyc",      label: t("cd_kyc") },
    { id: "wallets",  label: t("cd_wallets") },
    { id: "txns",     label: t("cd_txns") },
    { id: "notes",    label: t("cd_notes") },
  ];
  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose}></div>
      <div className="cust-drawer open" role="dialog">
        <div className="head">
          <CustomerAvatar c={c} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{c.name}</h2>
            <div className="sub">
              <span className="mono">#{c.id}</span>
              <TypeBadge type={c.type} t={t} />
              <StatusPill c={c} t={t} />
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            {React.createElement(I.close, { size: 16 })}
          </button>
        </div>
        <div className="drawer-tabs2">
          {tabs.map(tb => (
            <button key={tb.id} className={tab === tb.id ? "on" : ""} onClick={() => setTab(tb.id)}>
              {tb.label}
            </button>
          ))}
        </div>
        <div className="body">
          {tab === "overview" && (
            <>
              <div className="kv-grid">
                <div className="kv"><span className="k">{t("cd_email")}</span><span className="v" title={c.email}>{c.email}</span></div>
                <div className="kv"><span className="k">{t("cd_phone")}</span><span className="v mono">{c.phone}</span></div>
                <div className="kv"><span className="k">{t("cd_id")} ({c.idKind})</span><span className="v mono">{c.idNo}</span></div>
                <div className="kv"><span className="k">{t("cd_city")}</span><span className="v">{c.city}</span></div>
                <div className="kv"><span className="k">{t("cd_segment")}</span>
                  <span className="v"><span className={`risk-seg ${c.riskSeg}`}>
                    {c.riskSeg === "low" ? t("s_low") : c.riskSeg === "med" ? t("s_medium") : c.riskSeg === "high" ? t("s_high") : "Kritik"}
                  </span></span>
                </div>
                <div className="kv"><span className="k">{t("cd_score")}</span><span className="v mono">{c.riskScore} / 100</span></div>
                <div className="kv"><span className="k">{t("cd_campaign")}</span><span className="v">{c.campaign || t("cd_none")}</span></div>
                <div className="kv"><span className="k">KYC</span><span className="v"><KycPill c={c} /></span></div>
                <div className="kv"><span className="k">{t("cd_created")}</span><span className="v mono">{fmtDate(c.createdAt, lang)}</span></div>
                <div className="kv"><span className="k">{t("cd_updated")}</span><span className="v mono">{fmtDate(c.createdAt, lang)}</span></div>
              </div>
              <div className="section-h" style={{ marginTop: 22 }}>
                {lang === "tr" ? "Son 7 Gün Özet" : "Last 7 days"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div className="kpi">
                  <span className="kpi-label">{lang === "tr" ? "İşlem" : "Transactions"}</span>
                  <span className="kpi-value sm">{Math.floor(c.riskScore / 5) + 3}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">{lang === "tr" ? "Hacim" : "Volume"}</span>
                  <span className="kpi-value sm">{window.fmtMoney((c.riskScore * 1820) + 4200, lang)}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">{lang === "tr" ? "Bekleyen" : "Pending"}</span>
                  <span className="kpi-value sm">{c.status === "active" ? 0 : 1}</span>
                </div>
              </div>
            </>
          )}
          {tab !== "overview" && (
            <div className="empty-state">
              <div className="glyph">{React.createElement(I.info, { size: 22 })}</div>
              <h3>{lang === "tr" ? "Önizleme dışında" : "Out of preview"}</h3>
              <p>{lang === "tr"
                  ? "Bu sekmenin içeriği ilgili modül ekranında görüntülenir."
                  : "Open the full detail screen to see this tab's content."}</p>
            </div>
          )}
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

// ─────────── Main customers page ───────────
function CustomersPage({ t, lang, role }) {
  const I = window.Icon;
  const [statusFilter, setStatusFilter] = React.useState("active");
  const [query, setQuery] = React.useState("");
  const [showAdv, setShowAdv] = React.useState(false);
  const [filters, setFilters] = React.useState({
    type: "any", kyc: "any", risk: "any", campaign: "any", from: "", to: "",
  });
  const [sort, setSort] = React.useState({ col: "id", dir: "asc" });
  const [selected, setSelected] = React.useState(new Set());
  const [pageSize, setPageSize] = React.useState(20);
  const [page, setPage] = React.useState(1);
  const [picker, setPicker] = React.useState(false);
  const [drawerC, setDrawerC] = React.useState(null);

  const all = window.CUSTOMERS;

  const counts = React.useMemo(() => ({
    active:   all.filter(c => c.status === "active").length,
    inactive: all.filter(c => c.status === "inactive").length,
    blocked:  all.filter(c => c.status === "blocked").length,
    closed:   all.filter(c => c.status === "closed").length,
    prospect: all.filter(c => c.status === "prospect").length,
  }), [all]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return all.filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (filters.type !== "any" && c.type !== filters.type) return false;
      if (filters.kyc !== "any" && c.kyc !== filters.kyc) return false;
      if (filters.risk !== "any" && c.riskSeg !== filters.risk) return false;
      if (filters.campaign === "__none__" && c.campaign) return false;
      if (filters.campaign !== "any" && filters.campaign !== "__none__" && c.campaign !== filters.campaign) return false;
      if (filters.from && c.createdAt < filters.from) return false;
      if (filters.to && c.createdAt > filters.to) return false;
      if (q) {
        const hay = [
          String(c.id), c.name, c.email, c.phone, c.idNo, c.campaign || "",
        ].join(" ").toLocaleLowerCase("tr-TR");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, statusFilter, query, filters]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    const { col, dir } = sort;
    arr.sort((a, b) => {
      let av = a[col], bv = b[col];
      if (col === "name") {
        av = a.name.toLocaleLowerCase("tr-TR");
        bv = b.name.toLocaleLowerCase("tr-TR");
      }
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
    if (allSelectedOnPage) {
      pageRows.forEach(r => ns.delete(r.id));
    } else {
      pageRows.forEach(r => ns.add(r.id));
    }
    setSelected(ns);
  }
  function toggleOne(id) {
    const ns = new Set(selected);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    setSelected(ns);
  }
  function clearFilters() {
    setFilters({ type: "any", kyc: "any", risk: "any", campaign: "any", from: "", to: "" });
    setQuery("");
  }
  function setSortCol(col) {
    if (sort.col === col) {
      setSort({ col, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ col, dir: "asc" });
    }
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
          <h1 className="page-title">{t("cust_title")}</h1>
          <p className="page-subtitle">{t("cust_subtitle")}</p>
        </div>
        <div className="head-actions">
          <button className="btn">
            {React.createElement(I.download, { size: 13 })} {t("cust_export")}
          </button>
          <button className="btn">
            {React.createElement(I.filter, { size: 13 })} {t("cust_columns")}
          </button>
          <button className="btn primary" onClick={() => setPicker(true)}>
            {React.createElement(I.plus, { size: 13 })} {t("cust_new")}
          </button>
        </div>
      </div>

      <FilterBar
        t={t} lang={lang}
        query={query} setQuery={setQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        showAdv={showAdv} setShowAdv={setShowAdv}
        filteredCount={sorted.length} total={all.length}
        counts={counts}
      />
      {showAdv && (
        <AdvancedFilters t={t} lang={lang}
          filters={filters} setFilters={setFilters}
          onClear={clearFilters} />
      )}

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span><b className="mono">{selected.size}</b> {t("cust_selected")}</span>
          <div className="bulk-actions">
            <button className="btn ghost">
              {React.createElement(I.download, { size: 12 })} {t("cust_bulk_export")}
            </button>
            <button className="btn ghost">
              {React.createElement(I.flag, { size: 12 })} {t("cust_bulk_assign")}
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
                <Th col="id" label={t("cc_no")} />
                <Th col="name" label={t("cc_name")} />
                <th>{t("cc_contact")}</th>
                <th>{t("cc_id")}</th>
                <Th col="type" label={t("cc_type")} />
                <th>{t("cc_campaign")}</th>
                <Th col="kyc" label={t("cc_kyc")} />
                <Th col="riskScore" label={t("cc_risk")} />
                <Th col="createdAt" label={t("cc_created")} />
                <Th col="status" label={t("cc_status")} />
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
              {pageRows.map(c => (
                <tr key={c.id}
                    className={selected.has(c.id) ? "selected" : ""}
                    onClick={() => setDrawerC(c)}>
                  <td className="cb" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="cbx"
                           checked={selected.has(c.id)}
                           onChange={() => toggleOne(c.id)} />
                  </td>
                  <td><span className="cust-no">#{c.id}</span></td>
                  <td>
                    <span className="cust-cell">
                      <CustomerAvatar c={c} />
                      <span className="meta-2">
                        <b>{c.name}</b>
                        <span>{c.city}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="contact-cell">
                      <b>{c.email}</b>
                      <span>{c.phone}</span>
                    </span>
                  </td>
                  <td>
                    <span className="idno">
                      <span className="kind">{c.idKind}</span>
                      {c.idNo}
                    </span>
                  </td>
                  <td><TypeBadge type={c.type} t={t} /></td>
                  <td className="t-soft fs-12">
                    {c.campaign || <span className="t-mute">—</span>}
                  </td>
                  <td><KycPill c={c} /></td>
                  <td><RiskCell c={c} t={t} /></td>
                  <td className="mono fs-12 t-soft">{fmtDate(c.createdAt, lang)}</td>
                  <td><StatusPill c={c} t={t} /></td>
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
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)} title={t("p_first")}>«</button>
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
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)} title={t("p_last")}>»</button>
          </div>
        </div>
      </div>

      {picker && <TypePickerModal t={t} onClose={() => setPicker(false)} onPick={() => setPicker(false)} />}
      <CustomerDrawer t={t} lang={lang} c={drawerC} onClose={() => setDrawerC(null)} />
    </>
  );
}

window.CustomersPage = CustomersPage;
