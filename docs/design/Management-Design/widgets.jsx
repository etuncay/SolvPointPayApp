// widgets.jsx — Dashboard widget components.
// Each widget is a self-contained <Card> with header + body + footer.
// All widgets accept { t, lang, onOpenFullscreen, role } props.

// ───────── Helpers ─────────
function CardHead({ icon, iconTone = "", title, count, countTone = "", meta, onFullscreen, onClick }) {
  const I = window.Icon;
  return (
    <div className="card-head">
      {icon && (
        <div className={`card-icon ${iconTone}`}>
          {React.createElement(I[icon], { size: 14 })}
        </div>
      )}
      <h3 className="card-title">{title}</h3>
      {count != null && (
        <span className={`card-count ${countTone}`}>{count}</span>
      )}
      <div className="card-meta">
        {meta}
        {onFullscreen && (
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={onFullscreen}
                  title="Tam ekran" aria-label="Tam ekran">
            {React.createElement(I.fullscreen, { size: 13 })}
          </button>
        )}
        <button className="icon-btn" style={{ width: 24, height: 24 }} aria-label="Daha fazla">
          {React.createElement(I.more, { size: 14 })}
        </button>
      </div>
    </div>
  );
}

function CardFoot({ t, count, label = "view_all" }) {
  const I = window.Icon;
  return (
    <div className="card-foot">
      <span className="t-mute">{t("last_updated")} · {t("now")}</span>
      <a>
        {t(label)}
        {React.createElement(I.arrow, { size: 12 })}
      </a>
    </div>
  );
}

function RiskBadge({ risk, t }) {
  if (risk === "high") return <span className="badge danger">{t("s_high")}</span>;
  if (risk === "med")  return <span className="badge warn">{t("s_medium")}</span>;
  return <span className="badge muted">{t("s_low")}</span>;
}

function StateBadge({ s, t }) {
  if (s === "pending")   return <span className="badge warn">{t("s_pending")}</span>;
  if (s === "review")    return <span className="badge info">{t("s_review")}</span>;
  if (s === "held")      return <span className="badge danger">{t("s_held")}</span>;
  if (s === "rejected")  return <span className="badge danger">{t("s_rejected")}</span>;
  if (s === "cancelled") return <span className="badge muted">{t("s_cancelled")}</span>;
  return null;
}

function Corridor({ from, to }) {
  const I = window.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: 12 }}>
      <span>{window.flagify(from)} {from}</span>
      {React.createElement(I.arrow, { size: 11, style: { color: "var(--fg-muted)" } })}
      <span>{window.flagify(to)} {to}</span>
    </span>
  );
}

function CustAvatar({ name, idx = 0 }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="cust-avatar">
      <span className={`dot c${(idx % 5) + 1}`}>{initials}</span>
      <span>{name}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W1. My Pending Approvals
// ─────────────────────────────────────────────────────────────────────
function WMyApprovals({ t, lang, onFullscreen }) {
  const rows = window.MY_APPROVALS.slice(0, 6);
  const total = window.MY_APPROVALS.length;
  return (
    <div className="card">
      <CardHead icon="approve" iconTone="accent" title={t("w_my_approvals")}
                count={total} countTone="accent"
                onFullscreen={onFullscreen} />
      <div className="card-body">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>{t("col_ref")}</th>
              <th>{t("col_reason")}</th>
              <th className="r">{t("col_amount")}</th>
              <th className="r" style={{ width: 70 }}>{t("col_age")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="mono fs-12">{r.id}</td>
                <td>{r.type}<span className="t-mute" style={{ marginLeft: 6, fontSize: 11 }}>· {r.requester.split(" ")[0]}</span></td>
                <td className="r amount">{r.amount ? window.fmtMoney(r.amount, lang) : <span className="t-mute">—</span>}</td>
                <td className="r mono t-soft fs-12">{window.fmtAge(r.age, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFoot t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W2. Pending Transfers
// ─────────────────────────────────────────────────────────────────────
function WPendingXfer({ t, lang, onFullscreen }) {
  const rows = window.PENDING_XFER.slice(0, 6);
  const total = window.PENDING_XFER.length;
  return (
    <div className="card">
      <CardHead icon="transfer" iconTone="warn" title={t("w_pending_xfer")}
                count={total} countTone="warn"
                onFullscreen={onFullscreen} />
      <div className="card-body">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>{t("col_ref")}</th>
              <th>{t("col_customer")}</th>
              <th>{t("col_corridor")}</th>
              <th className="r">{t("col_amount")}</th>
              <th className="r" style={{ width: 60 }}>{t("col_age")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="mono fs-12">{r.id}</td>
                <td><CustAvatar name={r.customer} idx={i} /></td>
                <td><Corridor from={r.from} to={r.to} /></td>
                <td className="r amount">{window.fmtMoney(r.amount, lang)}</td>
                <td className="r mono t-soft fs-12">{window.fmtAge(r.age, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFoot t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W3. KYC Manual Verification
// ─────────────────────────────────────────────────────────────────────
function WKycManual({ t, lang, onFullscreen }) {
  const rows = window.KYC_QUEUE.slice(0, 6);
  const total = window.KYC_QUEUE.length;
  return (
    <div className="card">
      <CardHead icon="shield" iconTone="info" title={t("w_kyc_manual")}
                count={total} countTone="info"
                onFullscreen={onFullscreen} />
      <div className="card-body">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 95 }}>{t("col_ref")}</th>
              <th>{t("col_customer")}</th>
              <th>{t("col_reason")}</th>
              <th className="r" style={{ width: 60 }}>{t("col_age")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="mono fs-12">{r.id}</td>
                <td><CustAvatar name={r.customer} idx={i + 2} /></td>
                <td className="t-soft">{r.reason}</td>
                <td className="r mono t-soft fs-12">{window.fmtAge(r.age, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFoot t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W4. AML Held Transfers
// ─────────────────────────────────────────────────────────────────────
function WAmlHeld({ t, lang, onFullscreen }) {
  const rows = window.AML_HELD.slice(0, 6);
  return (
    <div className="card">
      <CardHead icon="shield" iconTone="danger" title={t("w_aml_held")}
                count={window.AML_HELD.length} countTone="danger"
                onFullscreen={onFullscreen} />
      <div className="card-body">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>{t("col_ref")}</th>
              <th>{t("col_customer")}</th>
              <th>{t("col_reason")}</th>
              <th className="r">{t("col_amount")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="mono fs-12">{r.id}</td>
                <td><CustAvatar name={r.customer} idx={i + 1} /></td>
                <td className="t-soft" style={{ maxWidth: 0 }}>{r.rule}</td>
                <td className="r amount">{window.fmtMoney(r.amount, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFoot t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W5. Rejected / Cancelled today
// ─────────────────────────────────────────────────────────────────────
function WRejected({ t, lang, onFullscreen }) {
  const rows = window.REJECTED.slice(0, 6);
  const rej = window.REJECTED.filter(r => r.state === "rejected").length;
  const cnc = window.REJECTED.filter(r => r.state === "cancelled").length;
  return (
    <div className="card">
      <CardHead icon="ban" iconTone="" title={t("w_rejected")}
                meta={
                  <span className="fs-11 t-mute">
                    <span className="mono" style={{ color: "var(--danger-fg)" }}>{rej}</span> + <span className="mono">{cnc}</span>
                  </span>
                }
                onFullscreen={onFullscreen} />
      <div className="card-body">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>{t("col_ref")}</th>
              <th>{t("col_customer")}</th>
              <th>{t("col_reason")}</th>
              <th>{t("col_state")}</th>
              <th className="r">{t("col_amount")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="mono fs-12">{r.id}</td>
                <td><CustAvatar name={r.customer} idx={i + 3} /></td>
                <td className="t-soft">{r.reason}</td>
                <td><StateBadge s={r.state} t={t} /></td>
                <td className="r amount">{window.fmtMoney(r.amount, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFoot t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W6. Daily Volume Chart (bars + line)
// ─────────────────────────────────────────────────────────────────────
function WDailyVolume({ t, lang }) {
  const [range, setRange] = React.useState("today");
  const data = window.DAILY_VOLUME;
  const totSuccess = data.reduce((a, b) => a + b.success, 0);
  const totFailed = data.reduce((a, b) => a + b.failed, 0);
  const totAmount = data.reduce((a, b) => a + b.amount, 0);
  const successRate = (totSuccess / (totSuccess + totFailed)) * 100;

  // SVG chart geometry
  const W = 720, H = 200, P = { l: 40, r: 12, t: 14, b: 22 };
  const innerW = W - P.l - P.r, innerH = H - P.t - P.b;
  const maxBar = Math.max(...data.map(d => d.success + d.failed));
  const maxAmt = Math.max(...data.map(d => d.amount));
  const xStep = innerW / data.length;
  const barW = Math.max(6, xStep * 0.62);

  const linePts = data.map((d, i) => {
    const x = P.l + i * xStep + xStep / 2;
    const y = P.t + (1 - d.amount / maxAmt) * innerH;
    return [x, y];
  });
  const linePath = linePts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${linePath} L${linePts[linePts.length - 1][0]},${P.t + innerH} L${linePts[0][0]},${P.t + innerH} Z`;

  // gridlines (3 horizontal)
  const gridY = [0.25, 0.5, 0.75].map(p => P.t + innerH * p);
  return (
    <div className="card">
      <CardHead icon="chart" iconTone="accent" title={t("w_daily_volume")}
                meta={
                  <div className="seg">
                    {["today", "yesterday", "last_7", "last_30"].map(k => (
                      <button key={k} className={range === k ? "on" : ""} onClick={() => setRange(k)}>
                        {t(k)}
                      </button>
                    ))}
                  </div>
                } />
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", paddingBottom: 0 }}>
        <div className="kpi">
          <span className="kpi-label">{t("today_count")}</span>
          <span className="kpi-value sm">{window.fmtNumber(totSuccess + totFailed, lang)}</span>
          <span className="kpi-delta up">↑ 8.4% vs {t("yesterday").toLowerCase()}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("today_amount")}</span>
          <span className="kpi-value sm">{window.fmtMoney(totAmount, lang)}</span>
          <span className="kpi-delta up">↑ 12.1%</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("success_rate")}</span>
          <span className="kpi-value sm">{successRate.toFixed(2)}%</span>
          <span className="kpi-delta down">↓ 0.18 pp</span>
        </div>
      </div>
      <div className="chart-wrap">
        <div className="chart-legend">
          <span><span className="dot" style={{ background: "var(--ok)" }}></span>{t("chart_success")}</span>
          <span><span className="dot" style={{ background: "var(--danger)" }}></span>{t("chart_failed")}</span>
          <span><span className="dot" style={{ background: "var(--accent)", borderRadius: 999 }}></span>{t("chart_amount")}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="200" preserveAspectRatio="none"
             style={{ display: "block" }}>
          {/* gridlines */}
          {gridY.map((y, i) => (
            <line key={i} x1={P.l} x2={W - P.r} y1={y} y2={y}
                  stroke="var(--line)" strokeDasharray="2 4" />
          ))}
          {/* x-axis hours */}
          {data.map((d, i) => i % 3 === 0 && (
            <text key={i} x={P.l + i * xStep + xStep / 2} y={H - 6}
                  fontSize="9" fill="var(--fg-muted)" textAnchor="middle"
                  fontFamily="var(--font-mono)">
              {String(d.hour).padStart(2, "0")}
            </text>
          ))}
          {/* y-axis labels */}
          {[0, 0.5, 1].map((p, i) => (
            <text key={i} x={P.l - 6} y={P.t + innerH * (1 - p) + 3}
                  fontSize="9" fill="var(--fg-muted)" textAnchor="end"
                  fontFamily="var(--font-mono)">
              {Math.round(maxBar * p)}
            </text>
          ))}
          {/* bars: failed stacked on success */}
          {data.map((d, i) => {
            const x = P.l + i * xStep + (xStep - barW) / 2;
            const totalH = ((d.success + d.failed) / maxBar) * innerH;
            const failH = (d.failed / maxBar) * innerH;
            const sucH = totalH - failH;
            const yBase = P.t + innerH;
            return (
              <g key={i}>
                <rect x={x} y={yBase - sucH} width={barW} height={sucH}
                      fill="var(--ok)" opacity={0.85} rx="1.5" />
                <rect x={x} y={yBase - totalH} width={barW} height={failH}
                      fill="var(--danger)" opacity={0.85} rx="1.5" />
              </g>
            );
          })}
          {/* line: amount */}
          <path d={areaPath} fill="var(--accent)" opacity="0.08" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          {linePts.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="2.2" fill="var(--bg-elev)"
                    stroke="var(--accent)" strokeWidth="1.2" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W7. New Customers (30d sparkline)
// ─────────────────────────────────────────────────────────────────────
function WNewCustomers({ t, lang }) {
  const data = window.NEW_CUSTOMERS_30D;
  const total = data.reduce((a, b) => a + b.count, 0);
  const today = data[data.length - 1].count;
  const W = 360, H = 110, P = { l: 4, r: 4, t: 4, b: 16 };
  const innerW = W - P.l - P.r, innerH = H - P.t - P.b;
  const max = Math.max(...data.map(d => d.count));
  const barW = innerW / data.length - 1.5;
  return (
    <div className="card">
      <CardHead icon="users" iconTone="ok" title={t("w_new_customers")} />
      <div className="kpi-row" style={{ paddingBottom: 4 }}>
        <div className="kpi">
          <span className="kpi-label">{t("today")}</span>
          <span className="kpi-value">{window.fmtNumber(today, lang)}</span>
          <span className="kpi-delta up">↑ 14% {t("last_7").toLowerCase()}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("last_30")}</span>
          <span className="kpi-value sm">{window.fmtNumber(total, lang)}</span>
          <span className="kpi-delta up">↑ 6.2%</span>
        </div>
      </div>
      <div className="chart-wrap" style={{ paddingTop: 0 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="110" preserveAspectRatio="none"
             style={{ display: "block" }}>
          {data.map((d, i) => {
            const x = P.l + i * (barW + 1.5);
            const h = (d.count / max) * innerH;
            const y = P.t + innerH - h;
            const isToday = i === data.length - 1;
            return (
              <rect key={i} x={x} y={y} width={barW} height={h}
                    fill={isToday ? "var(--accent)" : "var(--ok)"}
                    opacity={isToday ? 1 : 0.6} rx="1.5" />
            );
          })}
          {/* day labels at every 5 */}
          {data.map((d, i) => (i === 0 || i === data.length - 1 || (i + 1) % 7 === 0) && (
            <text key={i} x={P.l + i * (barW + 1.5) + barW / 2} y={H - 4}
                  fontSize="9" fill="var(--fg-muted)" textAnchor="middle"
                  fontFamily="var(--font-mono)">
              {i === data.length - 1 ? "Bug." : `${d.day + 1}`}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W8. Top 10 Customers (sender / receiver / withdrawer)
// ─────────────────────────────────────────────────────────────────────
function WTopCustomers({ t, lang, onFullscreen }) {
  const [tab, setTab] = React.useState("sent");
  const sorted = [...window.TOP_CUSTOMERS].sort((a, b) => b[tab] - a[tab]).slice(0, 10);
  const max = sorted[0][tab];
  return (
    <div className="card">
      <CardHead icon="user" iconTone="info" title={t("w_top_customers")}
                meta={
                  <div className="seg">
                    <button className={tab === "sent" ? "on" : ""} onClick={() => setTab("sent")}>{lang === "tr" ? "Gönderen" : "Sender"}</button>
                    <button className={tab === "received" ? "on" : ""} onClick={() => setTab("received")}>{lang === "tr" ? "Alan" : "Receiver"}</button>
                    <button className={tab === "withdrawn" ? "on" : ""} onClick={() => setTab("withdrawn")}>{lang === "tr" ? "Çeken" : "Withdrawer"}</button>
                  </div>
                }
                onFullscreen={onFullscreen} />
      <div className="card-body padded" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sorted.map((c, i) => {
          const pct = (c[tab] / max) * 100;
          return (
            <div key={c.id} className="linkable" style={{
              display: "grid",
              gridTemplateColumns: "22px 1fr auto",
              alignItems: "center",
              gap: 10,
              padding: "5px 6px",
              borderRadius: 6,
              position: "relative",
            }}>
              <span className="mono fs-11 t-mute" style={{ textAlign: "right" }}>{i + 1}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                  <span className="mono fs-11 t-mute">{c.id}</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-sunken)", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", opacity: 0.7, borderRadius: 999 }}></div>
                </div>
              </div>
              <span className="amount fs-12">{window.fmtMoney(c[tab], lang)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W9. Top 10 Agents (received / paid out)
// ─────────────────────────────────────────────────────────────────────
function WTopAgents({ t, lang, onFullscreen }) {
  const [tab, setTab] = React.useState("received");
  const sorted = [...window.TOP_AGENTS].sort((a, b) => b[tab] - a[tab]).slice(0, 10);
  const max = sorted[0][tab];
  return (
    <div className="card">
      <CardHead icon="building" iconTone="warn" title={t("w_top_agents")}
                meta={
                  <div className="seg">
                    <button className={tab === "received" ? "on" : ""} onClick={() => setTab("received")}>{lang === "tr" ? "Alan" : "Receive"}</button>
                    <button className={tab === "paid" ? "on" : ""} onClick={() => setTab("paid")}>{lang === "tr" ? "Veren" : "Pay-out"}</button>
                  </div>
                }
                onFullscreen={onFullscreen} />
      <div className="card-body padded" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sorted.map((c, i) => {
          const pct = (c[tab] / max) * 100;
          return (
            <div key={c.id} className="linkable" style={{
              display: "grid",
              gridTemplateColumns: "22px 1fr auto auto",
              alignItems: "center",
              gap: 10,
              padding: "5px 6px",
              borderRadius: 6,
            }}>
              <span className="mono fs-11 t-mute" style={{ textAlign: "right" }}>{i + 1}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-sunken)", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--warn)", opacity: 0.7, borderRadius: 999 }}></div>
                </div>
              </div>
              <span className="mono fs-11 t-mute">{c.txCount} işl.</span>
              <span className="amount fs-12">{window.fmtMoney(c[tab], lang)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  W10. System Health
// ─────────────────────────────────────────────────────────────────────
function WSysHealth({ t, lang }) {
  const I = window.Icon;
  const h = window.SYS_HEALTH;
  return (
    <div className="card">
      <CardHead icon="pulse" iconTone="ok" title={t("w_sys_health")}
                meta={
                  <span className="fs-11" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ok-fg)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)", boxShadow: "0 0 0 3px var(--ok-soft)" }}></span>
                    Operational
                  </span>
                } />
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", paddingBottom: 6 }}>
        <div className="kpi">
          <span className="kpi-label">{t("sys_uptime")}</span>
          <span className="kpi-value sm">{h.successRate.toFixed(2)}%</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t("sys_p95")}</span>
          <span className="kpi-value sm">{h.p95}<span className="t-mute fs-11"> ms</span></span>
        </div>
        <div className="kpi">
          <span className="kpi-label">p99</span>
          <span className="kpi-value sm">{h.p99}<span className="t-mute fs-11"> ms</span></span>
        </div>
      </div>
      <div className="card-body padded" style={{ paddingTop: 0 }}>
        <div className="section-h" style={{ marginTop: 6 }}>{t("sys_top_errors")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {h.topErrors.map(e => (
            <div key={e.svc} className="linkable" style={{
              display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10,
              alignItems: "center", padding: "5px 6px", borderRadius: 6,
              fontSize: 12,
            }}>
              <span className="mono">{e.svc}</span>
              <span className="t-mute fs-11">p95 {e.p95}ms</span>
              <span className="badge danger mono">{window.fmtNumber(e.errors, lang)}</span>
              <span className={`mono fs-11 ${e.delta > 0 ? "" : ""}`}
                    style={{ color: e.delta > 0 ? "var(--danger-fg)" : "var(--ok-fg)", minWidth: 32, textAlign: "right" }}>
                {e.delta > 0 ? "▲" : "▼"}{Math.abs(e.delta)}%
              </span>
            </div>
          ))}
        </div>
        <div className="section-h" style={{ marginTop: 14 }}>{t("sys_critical")}</div>
        <table className="tbl" style={{ marginLeft: -18, marginRight: -18, width: "calc(100% + 36px)" }}>
          <thead>
            <tr>
              <th>{t("col_endpoint")}</th>
              <th className="r">{t("col_p95")}</th>
              <th className="r">{t("col_p99")}</th>
              <th className="r">{t("col_err")}</th>
            </tr>
          </thead>
          <tbody>
            {h.critical.map(c => (
              <tr key={c.endpoint}>
                <td className="mono fs-12">{c.endpoint}</td>
                <td className="r mono fs-12">{c.p95}ms</td>
                <td className="r mono fs-12">{c.p99}ms</td>
                <td className="r">
                  <span className={`badge mono ${c.err > 1 ? "danger" : c.err > 0.5 ? "warn" : "ok"}`}>
                    {c.err.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ───────── Widget registry by role ─────────
// "List" permission per role — controls what's visible
const ALL_WIDGETS = [
  { id: "my_approvals", comp: WMyApprovals, col: 4, roles: ["ops", "finance", "compliance", "management"] },
  { id: "pending_xfer", comp: WPendingXfer, col: 8, roles: ["ops", "management"] },
  { id: "kyc_manual",   comp: WKycManual,   col: 6, roles: ["ops", "compliance", "management"] },
  { id: "aml_held",     comp: WAmlHeld,     col: 6, roles: ["compliance", "ops", "management"] },
  { id: "rejected",     comp: WRejected,    col: 12, roles: ["ops", "compliance", "finance", "management"] },
  { id: "daily_volume", comp: WDailyVolume, col: 8, roles: ["finance", "management"] },
  { id: "new_customers",comp: WNewCustomers,col: 4, roles: ["finance", "management"] },
  { id: "top_customers",comp: WTopCustomers,col: 6, roles: ["finance", "management", "ops"] },
  { id: "top_agents",   comp: WTopAgents,   col: 6, roles: ["finance", "management", "ops"] },
  { id: "sys_health",   comp: WSysHealth,   col: 12, roles: ["management"] },
];

Object.assign(window, {
  WMyApprovals, WPendingXfer, WKycManual, WAmlHeld, WRejected,
  WDailyVolume, WNewCustomers, WTopCustomers, WTopAgents, WSysHealth,
  ALL_WIDGETS,
});
