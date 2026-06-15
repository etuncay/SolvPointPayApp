// dashboard-page.jsx — Ana Sayfa content (no shell — that comes from Shell).

function FullscreenOverlay({ widget, onClose, t, lang, role }) {
  const I = window.Icon;
  if (!widget) return null;
  return (
    <div className="fs-overlay">
      <div className="fs-head">
        <button className="icon-btn" onClick={onClose}>
          {React.createElement(I.close, { size: 16 })}
        </button>
        <h2>{t(`w_${widget.id}`) || widget.id}</h2>
        <div className="fs-tools">
          <button className="btn">
            {React.createElement(I.filter, { size: 14 })} {lang === "tr" ? "Filtre" : "Filter"}
          </button>
          <button className="btn">
            {React.createElement(I.download, { size: 14 })} CSV
          </button>
          <button className="btn">
            {React.createElement(I.refresh, { size: 14 })} {t("refresh_all")}
          </button>
        </div>
      </div>
      <div className="fs-body">
        <div className="card" style={{ maxWidth: 1400, margin: "0 auto" }}>
          {React.createElement(widget.comp, { t, lang, role, onFullscreen: null })}
        </div>
        <div className="fs-12 t-mute" style={{ textAlign: "center", marginTop: 16 }}>
          {lang === "tr"
            ? "Tam ekran görünümde gerçek uygulamada sıralama, filtreleme, sayfalama ve toplu işlem araçları gelir."
            : "In the real app, fullscreen view brings sorting, filters, pagination and bulk actions."}
        </div>
      </div>
    </div>
  );
}

function WelcomeBanner({ t, lang, msg, onReview, onDismiss }) {
  const I = window.Icon;
  return (
    <div className="welcome">
      <div className="welcome-icon">{React.createElement(I.shield, { size: 14 })}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong>{t("welcome_back")}, Emre.</strong>{" "}
        <span style={{ opacity: 0.85 }}>{msg}</span>{" — "}
        <span style={{ opacity: 0.75 }}>{t("failed_attempt_warn")}</span>{" "}
        <a onClick={onReview} style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 500 }}>
          {t("review")}
        </a>
      </div>
      <button className="x" onClick={onDismiss}>{React.createElement(I.close, { size: 14 })}</button>
    </div>
  );
}

function DashboardPage({ t, lang, role, welcomeMsg = "Mavi köpekbalığı 🦈 — sadece sen bilirsin." }) {
  const I = window.Icon;
  const [fsWidget, setFsWidget] = React.useState(null);
  const [bannerOpen, setBannerOpen] = React.useState(true);

  // Widgets visible for this role
  const visible = window.ALL_WIDGETS.filter(w => w.roles.includes(role));

  return (
    <>
      {bannerOpen && (
        <WelcomeBanner t={t} lang={lang} msg={welcomeMsg}
          onReview={() => {}}
          onDismiss={() => setBannerOpen(false)} />
      )}
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("page_title")}</h1>
          <p className="page-subtitle">{t("page_subtitle")}</p>
        </div>
        <div className="head-actions">
          <span className="t-mute fs-11" style={{ marginRight: 6 }}>
            {t("refreshed_at")} · {new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button className="btn">
            {React.createElement(I.refresh, { size: 14 })} {t("refresh_all")}
          </button>
          <button className="btn">
            {React.createElement(I.plus, { size: 14 })} {t("customize")}
          </button>
        </div>
      </div>
      <div className="grid">
        {visible.map(w => (
          <div key={w.id} className={`col-${w.col}`}>
            {React.createElement(w.comp, {
              t, lang, role,
              onFullscreen: () => setFsWidget(w),
            })}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 28, fontSize: 11, color: "var(--fg-faint)" }}>
        {lang === "tr"
          ? "Yetkinize göre filtrelenmiş — diğer widget'lar farklı rollerde görünebilir."
          : "Filtered by your role — other widgets may appear for different roles."}
      </div>

      {fsWidget && (
        <FullscreenOverlay widget={fsWidget} onClose={() => setFsWidget(null)}
          t={t} lang={lang} role={role} />
      )}
    </>
  );
}

window.DashboardPage = DashboardPage;
