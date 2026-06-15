// individual-customer-form.jsx — main form composition

function IndividualCustomerForm({ t, lang, role, mode = "edit", isForeign = false, isProspect = false }) {
  const I = window.Icon;
  const p = { ...window.SAMPLE_PERSON, ...(isForeign ? window.FOREIGN_OVERLAY : {}) };
  if (isProspect) p.customerType = "prospective";

  const isNew  = mode === "new";
  const isView = mode === "view";
  const isTR   = !isForeign && p.idCountry === "TUR";
  // KPS-lock: TR vatandaş Nüfus Bilgileri panelinde alanlar locked
  const kpsLocked = isTR && !isNew;

  const [docOpen, setDocOpen]   = React.useState(false);
  const [blkOpen, setBlkOpen]   = React.useState(false);
  const [activeSec, setActiveSec] = React.useState("nufus");
  const [bannerOpen, setBannerOpen] = React.useState(true);

  // Section anchor highlight on scroll
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible[0]) setActiveSec(visible[0].target.id.replace("sec-", ""));
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 0.2] }
    );
    document.querySelectorAll(".fcard[id^='sec-']").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [mode, isForeign, isProspect]);

  const STATUS_LABEL = {
    active: t("st_active"), inactive: t("st_inactive"),
    blocked: t("st_blocked"), closed: t("st_closed"), prospect: t("st_prospect"),
  };
  const liveStatus = isNew ? "inactive" : (isProspect ? "prospect" : p.status);

  // Rail config: sections visible per mode
  const sections = [
    { id: "musteri",    no: "1", label: lang === "tr" ? "Müşteri Bilgileri" : "Customer info",       hidden: isNew },
    { id: "erisim",     no: "2", label: lang === "tr" ? "Erişim Bilgileri" : "Access info",          hidden: isNew },
    { id: "nufus",      no: "5", label: lang === "tr" ? "Nüfus Bilgileri" : "Civil registry",        hidden: false },
    { id: "detay",      no: "6", label: lang === "tr" ? "Detay Bilgiler" : "Additional details",     hidden: false },
    { id: "yabanci",    no: "7", label: lang === "tr" ? "Yabancı Müşteri" : "Foreign customer",      hidden: !isForeign },
    { id: "banka",      no: "3", label: lang === "tr" ? "Banka Hesapları" : "Bank accounts",         hidden: false },
    { id: "finansal",   no: "4", label: lang === "tr" ? "Finansal Bilgiler" : "Wallets",             hidden: isNew || isProspect },
    { id: "adres",      no: "8", label: lang === "tr" ? "Adresler" : "Addresses",                    hidden: false },
    { id: "iletisim",   no: "9", label: lang === "tr" ? "İletişim" : "Contact channels",             hidden: false },
    { id: "limit",      no: "10", label: lang === "tr" ? "İşlem Limitleri" : "Transaction limits",   hidden: isNew || isProspect },
    { id: "belgeler",   no: "+", label: lang === "tr" ? "Belgeler" : "Documents",                    hidden: false },
  ];

  // ── PAGE HEADER ──
  const pageTitle = isNew
    ? (lang === "tr" ? "Yeni Bireysel Müşteri" : "New individual customer")
    : `${p.firstName} ${p.lastName}`;
  const pageSubtitle = isNew
    ? (lang === "tr" ? "Kimlik bilgileri girilince Nüfus Paneli KPS'ten doldurulur." : "Civil registry auto-fills from KPS once identity is entered.")
    : (lang === "tr" ? `Müşteri No · ${p.customerNo}` : `Customer No · ${p.customerNo}`);

  return (
    <>
      {/* Page head */}
      <div className="page-head" style={{ alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          {!isNew && (
            <span className="avatar indv-f" style={{
              width: 44, height: 44, borderRadius: "50%",
              display: "grid", placeItems: "center",
              fontSize: 14, fontWeight: 600,
              background: isProspect ? "var(--bg-sunken)" : (p.gender === "female" ? "oklch(0.92 0.05 320)" : "oklch(0.92 0.05 195)"),
              color: isProspect ? "var(--fg-muted)" : (p.gender === "female" ? "oklch(0.42 0.13 320)" : "oklch(0.42 0.10 195)"),
              border: isProspect ? "1px dashed var(--line-strong)" : "none",
              flexShrink: 0,
            }}>
              {(p.firstName[0] + p.lastName[0]).toUpperCase()}
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {pageTitle}
              {isView && (
                <span className="badge muted" style={{ fontSize: 10.5 }}>
                  {React.createElement(I.eye, { size: 11 })}
                  {lang === "tr" ? "Görüntüleme" : "View only"}
                </span>
              )}
            </h1>
            <div className="head-status">
              <span className={`st ${liveStatus}`}>{STATUS_LABEL[liveStatus]}</span>
              {!isNew && (
                <>
                  <span className="reason">{pageSubtitle}</span>
                  <span className="ts">· {lang === "tr" ? "Oluşturma" : "Created"} {new Date(p.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}</span>
                </>
              )}
              {isNew && <span className="reason">{pageSubtitle}</span>}
            </div>
          </div>
        </div>
        <div className="head-actions" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          {!isNew && (
            <>
              <button className="btn">
                {React.createElement(I.pulse, { size: 13 })}
                {lang === "tr" ? "Müşteri Aktiviteleri" : "Activity"}
              </button>
              {p.status === "active" && (
                <button className="btn danger" onClick={() => setBlkOpen(true)}>
                  {React.createElement(I.ban, { size: 13 })}
                  {lang === "tr" ? "Bloke Et" : "Block"}
                </button>
              )}
              {p.status === "blocked" && (
                <button className="btn">
                  {React.createElement(I.check, { size: 13 })}
                  {lang === "tr" ? "Bloke Kaldır" : "Unblock"}
                </button>
              )}
            </>
          )}
          <button className="btn" onClick={() => setDocOpen(true)}>
            {React.createElement(I.download, { size: 13, style: { transform: "rotate(180deg)" } })}
            {lang === "tr" ? "Belge Yükle" : "Upload doc"}
          </button>
          {!isNew && (
            <button className="btn">
              {React.createElement(I.doc, { size: 13 })}
              {lang === "tr" ? "Belge Görme/İndirme" : "View / download"}
            </button>
          )}
        </div>
      </div>

      {/* Background-checks banner */}
      {!isNew && bannerOpen && (
        <div className="ins-banner">
          <div className="ic">{React.createElement(I.shield, { size: 14 })}</div>
          <div style={{ flex: 1 }}>
            <strong>{lang === "tr" ? "Arka plan kontrolleri:" : "Background checks:"}</strong>{" "}
            {lang === "tr"
              ? "KPS son senkron 22 May 09:14 · Sanction taraması temiz · IBAN doğrulama 4/4 ✓"
              : "KPS last sync 22 May 09:14 · Sanction clean · IBAN check 4/4 ✓"}
          </div>
          <button className="x" onClick={() => setBannerOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6 }}>
            {React.createElement(I.close, { size: 14 })}
          </button>
        </div>
      )}

      {/* Top identity strip */}
      <div className="id-strip">
        <Field label={lang === "tr" ? "Adı ve Soyadı" : "Full name"} required col={1}>
          <input className="input" value={isNew ? "" : `${p.firstName} ${p.lastName}`} placeholder={lang === "tr" ? "Ad Soyad" : "Full name"} readOnly={kpsLocked || isView} />
        </Field>
        <Field label={isForeign ? (lang === "tr" ? "Pasaport No" : "Passport No") : "TCKN"} required col={1}>
          <input className="input mono" value={isNew ? "" : p.idNo} placeholder={isForeign ? "X12345678" : "11 hane"} readOnly={!isNew} />
        </Field>
        <Field label={lang === "tr" ? "Kimlik Tipi" : "ID type"} required col={1}>
          <select className="select" defaultValue={p.idType} disabled={!isNew}>
            <option value="TCKN">TC Kimlik</option>
            <option value="PASSPORT">{lang === "tr" ? "Pasaport" : "Passport"}</option>
            <option value="RES_PERMIT">{lang === "tr" ? "Oturum İzni" : "Residence permit"}</option>
          </select>
        </Field>
        <Field label={lang === "tr" ? "Uyruğu" : "Nationality"} required col={1}>
          <select className="select" defaultValue={p.idCountry} disabled={!isNew}>
            <option value="TUR">🇹🇷 Türkiye</option>
            <option value="DEU">🇩🇪 Almanya</option>
            <option value="AUT">🇦🇹 Avusturya</option>
            <option value="NLD">🇳🇱 Hollanda</option>
            <option value="USA">🇺🇸 ABD</option>
          </select>
        </Field>
        <Field label={lang === "tr" ? "Doğum Tarihi" : "Birth date"} required col={1} hint={isNew ? (lang === "tr" ? "18 yaş altı transfer yapamaz" : "Under-18 cannot transact") : null}>
          <input className="input" type="date" defaultValue={p.birthDate} readOnly={kpsLocked} />
        </Field>
        <Field label={lang === "tr" ? "Müşteri Tipi" : "Customer type"} required col={1}>
          <select className="select" defaultValue={isProspect ? "prospective" : "individual"} disabled={isView}>
            <option value="individual">{t("t_individual")}</option>
            <option value="prospective">{t("t_prospective")}</option>
          </select>
        </Field>
      </div>

      {/* Form body: rail + cards */}
      <div className="form-layout">
        <nav className="section-rail">
          <div className="rail-section">{lang === "tr" ? "Bölümler" : "Sections"}</div>
          {sections.filter(s => !s.hidden).map(s => (
            <a key={s.id} href={`#sec-${s.id}`} className={activeSec === s.id ? "cur" : ""}>
              <span className="rail-no">{s.no}</span>
              <span>{s.label}</span>
            </a>
          ))}
        </nav>

        <div className="form-stack">
          {/* 1. Müşteri Bilgileri */}
          {!isNew && (
            <SectionCard no="1" title={lang === "tr" ? "Müşteri Bilgileri" : "Customer information"} icon="user"
              meta={<>
                <span>KYC</span>
                <span className={`kyc-pill ${p.kycLevel === "L3" ? "l3" : p.kycLevel === "L2" ? "l2" : "l1"}`}>{p.kycLevel}</span>
              </>}>
              {/* set explicit id for IntersectionObserver hook */}
              <div className="fgrid">
                <Field label={lang === "tr" ? "Müşteri No" : "Customer No"} locked lockReason="System-assigned">
                  <input className="input mono locked" value={p.customerNo} readOnly />
                </Field>
                <Field label={lang === "tr" ? "Kampanya" : "Campaign"}>
                  <select className="select" defaultValue={p.campaign}>
                    <option>{p.campaign}</option>
                    <option>Hoşgeldin Bonusu</option>
                    <option>Premium Müşteri</option>
                    <option>İlk Transfer Ücretsiz</option>
                  </select>
                </Field>
                <Field label={lang === "tr" ? "Kampanya Sonlanma" : "Campaign end"} locked lockReason="Auto from campaign">
                  <input className="input mono locked" type="date" value={p.campaignEndDate} readOnly />
                </Field>
                <Field label={lang === "tr" ? "KYC Seviyesi" : "KYC level"} locked>
                  <input className="input locked" value={p.kycLevel} readOnly />
                </Field>
                <Field label={lang === "tr" ? "Risk Skoru" : "Risk score"} locked lockReason={lang === "tr" ? "Risk Skoru servisinden gelir" : "From Risk service"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input className="input mono locked" value={`${p.riskScore} / 100`} readOnly style={{ flex: 1 }} />
                    <span className={`risk-seg ${p.riskSegment}`}>{p.riskSegment === "low" ? t("s_low") : p.riskSegment === "med" ? t("s_medium") : t("s_high")}</span>
                  </div>
                </Field>
                <Field label={lang === "tr" ? "Risk Segmenti" : "Risk segment"} locked>
                  <input className="input locked" value={p.riskSegment === "low" ? t("s_low") : p.riskSegment === "med" ? t("s_medium") : t("s_high")} readOnly />
                </Field>
                <Field label={lang === "tr" ? "Oluşturma Tarihi" : "Created"} locked>
                  <input className="input mono locked" value={new Date(p.createdAt).toLocaleString(lang === "tr" ? "tr-TR" : "en-US")} readOnly />
                </Field>
                <Field label="Status" locked>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`st ${liveStatus}`}>{STATUS_LABEL[liveStatus]}</span>
                    {p.statusReason && <span className="t-mute fs-11">{p.statusReason}</span>}
                  </div>
                </Field>
              </div>
            </SectionCard>
          )}

          {/* 2. Erişim Bilgileri */}
          {!isNew && (
            <SectionCard no="2" title={lang === "tr" ? "Erişim Bilgileri" : "Access information"} icon="key"
              meta={<span className="fs-11">{lang === "tr" ? "Servisten gelir" : "From service"}</span>}>
              <div className="fgrid">
                <Field label={lang === "tr" ? "Son Login" : "Last login"} locked>
                  <input className="input mono locked" value={new Date(p.lastLogin).toLocaleString(lang === "tr" ? "tr-TR" : "en-US")} readOnly />
                </Field>
                <Field label={lang === "tr" ? "Başarısız Teşebbüs" : "Failed attempts"} locked>
                  <input className="input mono locked" value={`${p.failedAttempts} / 30 ${lang === "tr" ? "gün" : "days"}`} readOnly />
                </Field>
                <Field label={lang === "tr" ? "Cihaz" : "Device"} locked>
                  <input className="input locked" value={p.device} readOnly />
                </Field>
                <Field label={lang === "tr" ? "IP / Lokasyon" : "IP / Location"} locked>
                  <input className="input mono locked fs-12" value={p.ipLocation} readOnly />
                </Field>
              </div>
            </SectionCard>
          )}

          {/* 5. Nüfus Bilgileri */}
          <SectionCard no="5" title={lang === "tr" ? "Nüfus Bilgileri" : "Civil registry"}
            icon="building"
            meta={kpsLocked
              ? <span className="verif ok"><span className="d"></span>{lang === "tr" ? "KPS senkron" : "KPS synced"}</span>
              : (isNew ? <span className="t-mute fs-11">{lang === "tr" ? "TCKN sonrası dolar" : "Auto-fills after TCKN"}</span> : null)}>
            {kpsLocked && (
              <div className="fc-banner info" style={{ marginBottom: 14 }}>
                {React.createElement(I.info, { size: 14, style: { marginTop: 1 } })}
                <span>{lang === "tr"
                  ? "Türk vatandaşlarında nüfus bilgileri KPS'ten otomatik dolar ve değiştirilemez."
                  : "For Turkish citizens, civil registry is auto-filled from KPS and read-only."}</span>
              </div>
            )}
            <div className="fgrid">
              <Field label={lang === "tr" ? "Doğum Yeri" : "Birth place"} required locked={kpsLocked}>
                <input className="input" defaultValue={isNew ? "" : p.birthPlace} />
              </Field>
              <Field label={lang === "tr" ? "Medeni Durum" : "Marital status"} required locked={kpsLocked}>
                <select className="select" defaultValue={p.maritalStatus}>
                  <option value="single">{lang === "tr" ? "Bekâr" : "Single"}</option>
                  <option value="married">{lang === "tr" ? "Evli" : "Married"}</option>
                  <option value="divorced">{lang === "tr" ? "Boşanmış" : "Divorced"}</option>
                  <option value="widowed">{lang === "tr" ? "Dul" : "Widowed"}</option>
                </select>
              </Field>
              <Field label={lang === "tr" ? "Cinsiyet" : "Gender"} required locked={kpsLocked}>
                <select className="select" defaultValue={p.gender}>
                  <option value="female">{lang === "tr" ? "Kadın" : "Female"}</option>
                  <option value="male">{lang === "tr" ? "Erkek" : "Male"}</option>
                </select>
              </Field>
              <Field label={lang === "tr" ? "Seri / Doküman No" : "Serial / Document No"} required locked={kpsLocked}>
                <input className="input mono" defaultValue={isNew ? "" : p.serialNo} placeholder="A12 N12345" />
              </Field>
              <Field label={lang === "tr" ? "Veriliş Tarihi" : "Issue date"} required locked={kpsLocked}>
                <input className="input" type="date" defaultValue={p.issueDate} />
              </Field>
              <Field label={lang === "tr" ? "Veren Makam" : "Issuing authority"} required locked={kpsLocked}>
                <input className="input" defaultValue={isNew ? "" : p.issuingAuthority} />
              </Field>
              <Field label={lang === "tr" ? "Geçerlilik Tarihi" : "Validity date"} required locked={kpsLocked}>
                <input className="input" type="date" defaultValue={p.validityDate} />
              </Field>
              <Field label={lang === "tr" ? "Anne Adı" : "Mother's name"} required={isTR} locked={kpsLocked}>
                <input className="input" defaultValue={isNew ? "" : p.motherName} />
              </Field>
              <Field label={lang === "tr" ? "Baba Adı" : "Father's name"} required={isTR} locked={kpsLocked}>
                <input className="input" defaultValue={isNew ? "" : p.fatherName} />
              </Field>
            </div>
          </SectionCard>

          {/* 6. Detay Bilgiler */}
          <SectionCard no="6" title={lang === "tr" ? "Detay Bilgiler" : "Additional details"} icon="user">
            <div className="fgrid">
              {p.gender === "female" && p.maritalStatus === "married" && (
                <Field label={lang === "tr" ? "Evlenmeden Önceki Soyadı" : "Maiden name"} required>
                  <input className="input" defaultValue={isNew ? "" : p.maidenName} />
                </Field>
              )}
              <Field label={lang === "tr" ? "Vergi Ülkesi" : "Tax country"} required>
                <select className="select" defaultValue={p.taxCountry}>
                  <option value="TUR">🇹🇷 Türkiye</option>
                  <option value="DEU">🇩🇪 Almanya</option>
                  <option value="USA">🇺🇸 ABD</option>
                </select>
              </Field>
              <Field label={lang === "tr" ? "Eğitim Durumu" : "Education"} required>
                <select className="select" defaultValue={p.education}>
                  <option value="primary">{lang === "tr" ? "İlkokul" : "Primary"}</option>
                  <option value="highschool">{lang === "tr" ? "Lise" : "High school"}</option>
                  <option value="bachelors">{lang === "tr" ? "Lisans" : "Bachelor's"}</option>
                  <option value="masters">{lang === "tr" ? "Yüksek Lisans" : "Master's"}</option>
                  <option value="phd">Doktora / PhD</option>
                </select>
              </Field>
              <Field label={lang === "tr" ? "Çalışma Durumu" : "Employment"} required>
                <select className="select" defaultValue={p.employment}>
                  <option value="salaried">{lang === "tr" ? "Ücretli" : "Salaried"}</option>
                  <option value="self">{lang === "tr" ? "Serbest Meslek" : "Self-employed"}</option>
                  <option value="student">{lang === "tr" ? "Öğrenci" : "Student"}</option>
                  <option value="retired">{lang === "tr" ? "Emekli" : "Retired"}</option>
                  <option value="unemployed">{lang === "tr" ? "Çalışmıyor" : "Unemployed"}</option>
                </select>
              </Field>
              <Field label={lang === "tr" ? "Mesleği" : "Occupation"} required>
                <input className="input" defaultValue={isNew ? "" : p.occupation} />
              </Field>
              <Field label={lang === "tr" ? "Çalıştığı Kurum" : "Employer"}>
                <input className="input" defaultValue={isNew ? "" : p.employer} />
              </Field>
              <Field label={lang === "tr" ? "Dil Tercihi" : "Language"} required>
                <select className="select" defaultValue={p.language}>
                  <option value="tr">🇹🇷 Türkçe</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="ar">العربية</option>
                </select>
              </Field>
              <Field label={lang === "tr" ? "Notlar" : "Notes"} col={4} hint={lang === "tr" ? "TCKN/kart numarası içeren notlar KVKK gereği reddedilir." : "Notes containing TCKN/card numbers are rejected (KVKK)."}>
                <textarea className="textarea" defaultValue={isNew ? "" : p.notes}></textarea>
              </Field>
            </div>
          </SectionCard>

          {/* 7. Yabancı Müşteri */}
          {isForeign && (
            <SectionCard no="7" title={lang === "tr" ? "Yabancı Müşteri" : "Foreign customer"} icon="globe">
              <div className="fgrid">
                <Field label={lang === "tr" ? "Vize Tipi" : "Visa type"} required>
                  <select className="select" defaultValue={p.visaType}>
                    <option value="ShortTerm">{lang === "tr" ? "Kısa Dönem" : "Short term"}</option>
                    <option value="LongTerm">{lang === "tr" ? "Uzun Dönem" : "Long term"}</option>
                    <option value="Student">{lang === "tr" ? "Öğrenci" : "Student"}</option>
                    <option value="Work">{lang === "tr" ? "Çalışma" : "Work"}</option>
                    <option value="VisaExempt">{lang === "tr" ? "Vize Muafiyeti" : "Visa exempt"}</option>
                  </select>
                </Field>
                <Field label={lang === "tr" ? "Vize Bitiş Tarihi" : "Visa end date"} required>
                  <input className="input" type="date" defaultValue={p.visaEndDate} />
                </Field>
                <Field label={lang === "tr" ? "Oturum İzni" : "Residence permit"}>
                  <input className="input mono" defaultValue={p.residencePermit} />
                </Field>
                <Field label={lang === "tr" ? "Oturum İzni Bitiş" : "Permit end"}>
                  <input className="input" type="date" defaultValue={p.residencePermitEnd} />
                </Field>
                <Field label={lang === "tr" ? "Doğum Ülkesi" : "Country of birth"} required>
                  <select className="select" defaultValue={p.birthCountry}>
                    <option value="DEU">🇩🇪 Almanya</option>
                    <option value="AUT">🇦🇹 Avusturya</option>
                    <option value="TUR">🇹🇷 Türkiye</option>
                    <option value="USA">🇺🇸 ABD</option>
                  </select>
                </Field>
                <Field label={lang === "tr" ? "Yerleşik Ülke" : "Country of residence"} required>
                  <select className="select" defaultValue={p.residentCountry}>
                    <option value="TUR">🇹🇷 Türkiye</option>
                    <option value="DEU">🇩🇪 Almanya</option>
                  </select>
                </Field>
              </div>
            </SectionCard>
          )}

          {/* 3. Banka Hesapları */}
          <SectionCard no="3" title={lang === "tr" ? "Banka Hesapları" : "Bank accounts"} icon="bank"
            meta={<span className="fs-11 t-mute">{lang === "tr" ? "Yabancı banka eklenemez" : "No foreign banks"}</span>}>
            <div className="fcard-body padless" style={{ margin: "-18px -18px 14px" }}>
              <table className="itable">
                <thead>
                  <tr>
                    <th>{lang === "tr" ? "Banka" : "Bank"}</th>
                    <th>IBAN</th>
                    <th>{lang === "tr" ? "Para Birimi" : "Currency"}</th>
                    <th>{lang === "tr" ? "Şube" : "Branch"}</th>
                    <th>{lang === "tr" ? "Hesap No" : "Account No"}</th>
                    <th>Ek No</th>
                    <th>{lang === "tr" ? "Varsayılan" : "Default"}</th>
                    <th>Status</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(isNew ? [] : p.banks).map((b, i) => (
                    <tr key={b.id}>
                      <td>{b.bank}</td>
                      <td><span className="iban">{b.iban}</span> <span className="check-pill" style={{ marginLeft: 6 }}>✓ IBAN</span></td>
                      <td className="mono fs-12">{b.currency}</td>
                      <td className="mono fs-12">{b.branch}</td>
                      <td className="mono fs-12">{b.accountNo}</td>
                      <td className="mono fs-12">{b.suffix}</td>
                      <td>
                        <label className="cbx-row">
                          <input type="checkbox" className="cbx" defaultChecked={b.isDefault} disabled={isView} />
                          {b.isDefault && <span className="fs-11 t-mute">({b.currency})</span>}
                        </label>
                      </td>
                      <td><span className="st active">{t("st_active")}</span></td>
                      <td>
                        <div className="row-actions">
                          <button title="Edit">{React.createElement(I.eye, { size: 13 })}</button>
                          <button title="Remove">{React.createElement(I.close, { size: 13 })}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(isNew ? [] : p.banks).length === 0 && (
                    <tr><td colSpan={9}><div className="empty-state" style={{ padding: 24 }}>
                      <div className="t-mute fs-12">{lang === "tr" ? "Henüz banka hesabı eklenmedi" : "No bank accounts yet"}</div>
                    </div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <button className="add-row-btn" disabled={isView}>
              {React.createElement(I.plus, { size: 14 })} {lang === "tr" ? "Banka Hesabı Ekle" : "Add bank account"}
            </button>
          </SectionCard>

          {/* 4. Finansal Bilgiler */}
          {!isNew && !isProspect && (
            <SectionCard no="4" title={lang === "tr" ? "Finansal Bilgiler" : "Wallets"} icon="wallet"
              meta={<a className="t-mute fs-11" style={{ color: "var(--accent-fg)", textDecoration: "none", cursor: "pointer" }}>{lang === "tr" ? "Cüzdan ekranında aç" : "Open in Wallets"} →</a>}>
              <div className="fcard-body padless" style={{ margin: "-18px -18px 0" }}>
                <table className="itable">
                  <thead>
                    <tr>
                      <th>{lang === "tr" ? "Cüzdan No" : "Wallet No"}</th>
                      <th>{lang === "tr" ? "Bakiye" : "Balance"}</th>
                      <th>{lang === "tr" ? "Bloke" : "Blocked"}</th>
                      <th>{lang === "tr" ? "Bugün Adet" : "Tx today"}</th>
                      <th>{lang === "tr" ? "Bugün Tutar" : "Vol today"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.wallets.map(w => (
                      <tr key={w.id}>
                        <td><span className="mono fs-12">{w.id}</span></td>
                        <td><span className="amount" style={{ fontSize: 13 }}>{new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US").format(w.balance)} <span className="t-mute fs-11">{w.currency}</span></span></td>
                        <td><span className="mono fs-12">{w.blocked} <span className="t-mute">{w.currency}</span></span></td>
                        <td className="mono fs-12">{w.txCountDay}</td>
                        <td className="mono fs-12">{new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US").format(w.txAmountDay)} <span className="t-mute">{w.currency}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* 8. Adresler */}
          <SectionCard no="8" title={lang === "tr" ? "Adresler" : "Addresses"} icon="home"
            meta={<span className="fs-11 t-mute">{lang === "tr" ? "1 irtibat adresi zorunlu" : "1 contact address required"}</span>}>
            {(isNew ? [] : p.addresses).map((a, i) => (
              <div key={a.id} className="addr-card">
                <div className="corner">
                  {a.isContact && <span className="badge ok">{lang === "tr" ? "İrtibat adresi" : "Contact address"}</span>}
                  <button className="icon-btn" style={{ width: 24, height: 24 }} title="Edit">
                    {React.createElement(I.eye, { size: 13 })}
                  </button>
                  <button className="icon-btn" style={{ width: 24, height: 24 }} title="Remove">
                    {React.createElement(I.close, { size: 13 })}
                  </button>
                </div>
                <div className="fgrid" style={{ gap: "12px 16px" }}>
                  <Field label={lang === "tr" ? "Adres Tipi" : "Type"} required>
                    <select className="select" defaultValue={a.type}>
                      <option value="home">{lang === "tr" ? "Ev" : "Home"}</option>
                      <option value="work">{lang === "tr" ? "İş" : "Work"}</option>
                      <option value="other">{lang === "tr" ? "Diğer" : "Other"}</option>
                    </select>
                  </Field>
                  <Field label={lang === "tr" ? "Ülke" : "Country"} required>
                    <select className="select" defaultValue={a.country}>
                      <option value="TUR">🇹🇷 Türkiye</option>
                      <option value="DEU">🇩🇪 Almanya</option>
                    </select>
                  </Field>
                  {a.country === "TUR" ? (
                    <>
                      <Field label="İl" required>
                        <select className="select" defaultValue={a.city}>
                          <option>İstanbul</option><option>Ankara</option><option>İzmir</option>
                        </select>
                      </Field>
                      <Field label="İlçe" required>
                        <select className="select" defaultValue={a.district}>
                          <option>Kadıköy</option><option>Şişli</option><option>Beşiktaş</option>
                        </select>
                      </Field>
                      <Field label="Mahalle" required>
                        <select className="select" defaultValue={a.neighbourhood}>
                          <option>Caferağa</option><option>Mecidiyeköy</option>
                        </select>
                      </Field>
                      <Field label={lang === "tr" ? "Posta Kodu" : "Postcode"} required>
                        <input className="input mono" defaultValue={a.postcode} />
                      </Field>
                      <Field label={lang === "tr" ? "Sokak / Cadde" : "Street"} required col={2}>
                        <input className="input" defaultValue={a.street} />
                      </Field>
                      <Field label={lang === "tr" ? "Bina No" : "Building No"} required>
                        <input className="input mono" defaultValue={a.building} />
                      </Field>
                      <Field label={lang === "tr" ? "Daire" : "Apt"}>
                        <input className="input mono" defaultValue={a.apt} />
                      </Field>
                      <Field label="UAVT No" hint={lang === "tr" ? "Adres Kayıt Sistemi" : "Address registry"}>
                        <input className="input mono" defaultValue={a.uavt} readOnly />
                      </Field>
                      <Field label={lang === "tr" ? "İrtibat adresi mi?" : "Contact address?"} col={2}>
                        <label className="cbx-row" style={{ height: 32 }}>
                          <input type="checkbox" className="cbx" defaultChecked={a.isContact} />
                          {lang === "tr" ? "Bu adresi irtibat adresi olarak işaretle" : "Mark as contact address"}
                        </label>
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="State / Region" required><input className="input" /></Field>
                      <Field label="City" required><input className="input" /></Field>
                      <Field label="Postcode" required><input className="input mono" /></Field>
                      <Field label="Address" col={4}><textarea className="textarea"></textarea></Field>
                    </>
                  )}
                </div>
              </div>
            ))}
            {(isNew ? [] : p.addresses).length === 0 && (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="t-mute fs-12">{lang === "tr" ? "Henüz adres eklenmedi" : "No addresses yet"}</div>
              </div>
            )}
            <button className="add-row-btn" style={{ marginTop: 10 }} disabled={isView}>
              {React.createElement(I.plus, { size: 14 })} {lang === "tr" ? "Adres Ekle" : "Add address"}
            </button>
          </SectionCard>

          {/* 9. İletişim */}
          <SectionCard no="9" title={lang === "tr" ? "İletişim Bilgileri" : "Contact channels"} icon="bell"
            meta={<span className="fs-11 t-mute">{lang === "tr" ? "1 e-posta + 1 telefon asıl" : "1 email + 1 phone primary"}</span>}>
            <div className="fcard-body padless" style={{ margin: "-18px -18px 14px" }}>
              <table className="itable">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>{lang === "tr" ? "Tip" : "Type"}</th>
                    <th>{lang === "tr" ? "Adres / Numara" : "Address / Number"}</th>
                    <th>{lang === "tr" ? "Doğrulama" : "Verification"}</th>
                    <th>{lang === "tr" ? "Asıl Kanal" : "Primary"}</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(isNew ? [] : p.contacts).map(c => (
                    <tr key={c.id}>
                      <td>
                        <span className="badge muted" style={{ fontSize: 10.5 }}>
                          {React.createElement(I[c.type === "email" ? "doc" : "support"], { size: 11 })}
                          {c.type === "email" ? "E-posta" : (c.kind === "landline" ? "Sabit" : "Mobil")}
                        </span>
                      </td>
                      <td className={c.type === "phone" ? "mono" : ""}>{c.value}</td>
                      <td>
                        {c.verified
                          ? <span className="verif ok"><span className="d"></span>{lang === "tr" ? "Doğrulandı" : "Verified"}</span>
                          : <span className="verif pend"><span className="d"></span>{lang === "tr" ? "Bekliyor" : "Pending"} <a style={{ color: "var(--accent-fg)", marginLeft: 4, cursor: "pointer" }}>{lang === "tr" ? "OTP gönder" : "Send OTP"}</a></span>}
                      </td>
                      <td>
                        {c.primary
                          ? <span className="badge accent" style={{ background: "var(--accent-soft)", color: "var(--accent-fg)" }}>★ {lang === "tr" ? "Asıl" : "Primary"}</span>
                          : <button className="btn ghost" style={{ padding: "2px 8px", fontSize: 11 }}>{lang === "tr" ? "Asıl yap" : "Make primary"}</button>}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button title="Edit">{React.createElement(I.eye, { size: 13 })}</button>
                          <button title="Remove">{React.createElement(I.close, { size: 13 })}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="add-row-btn" disabled={isView}>
                {React.createElement(I.plus, { size: 14 })} {lang === "tr" ? "E-posta Ekle" : "Add email"}
              </button>
              <button className="add-row-btn" disabled={isView}>
                {React.createElement(I.plus, { size: 14 })} {lang === "tr" ? "Telefon Ekle" : "Add phone"}
              </button>
            </div>
          </SectionCard>

          {/* 10. İşlem Limitleri */}
          {!isNew && !isProspect && (
            <SectionCard no="10" title={lang === "tr" ? "İşlem Limitleri" : "Transaction limits"} icon="trend"
              meta={<span className="fs-11 t-mute">{lang === "tr" ? "KYC seviyesine göre" : "By KYC level"}</span>}>
              <div className="fgrid cols-3">
                <Field label={lang === "tr" ? "İşlem Limiti" : "Per-tx limit"}>
                  <div className="input-affix">
                    <input className="input mono" defaultValue={p.limits.perTx} />
                    <span className="affix">{p.limits.currency}</span>
                  </div>
                </Field>
                <Field label={lang === "tr" ? "Günlük İşlem Limiti" : "Daily limit"}>
                  <div className="input-affix">
                    <input className="input mono" defaultValue={p.limits.daily} />
                    <span className="affix">{p.limits.currency}</span>
                  </div>
                </Field>
                <Field label={lang === "tr" ? "Aylık İşlem Limiti" : "Monthly limit"}>
                  <div className="input-affix">
                    <input className="input mono" defaultValue={p.limits.monthly} />
                    <span className="affix">{p.limits.currency}</span>
                  </div>
                </Field>
              </div>
            </SectionCard>
          )}

          {/* + Belgeler */}
          <SectionCard no="+" title={lang === "tr" ? "Belgeler" : "Documents"} icon="doc"
            meta={<a className="t-mute fs-11" style={{ color: "var(--accent-fg)", textDecoration: "none", cursor: "pointer" }}>{lang === "tr" ? "Doküman Yönetimi'nde aç" : "Open in DMS"} →</a>}>
            <div className="fcard-body padless" style={{ margin: "-18px -18px 14px" }}>
              <table className="itable">
                <thead>
                  <tr>
                    <th>{lang === "tr" ? "Kategori" : "Category"}</th>
                    <th>{lang === "tr" ? "Tür" : "Type"}</th>
                    <th>{lang === "tr" ? "Geçerlilik" : "Validity"}</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(isNew ? [] : p.documents).map(d => (
                    <tr key={d.id}>
                      <td><span className="badge muted">{d.category}</span></td>
                      <td>{d.type}</td>
                      <td className="mono fs-12">{d.validFrom} → {d.validTo}</td>
                      <td><span className={`kyc-pill ${d.status === "approved" ? "ok" : "pending"}`}>{d.status}</span></td>
                      <td>
                        <div className="row-actions">
                          <button title="View">{React.createElement(I.eye, { size: 13 })}</button>
                          <button title="Download">{React.createElement(I.download, { size: 13 })}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(isNew ? [] : p.documents).length === 0 && (
                    <tr><td colSpan={5}><div className="empty-state" style={{ padding: 24 }}>
                      <div className="t-mute fs-12">{lang === "tr" ? "Asgari bir Identity belgesi yüklenmelidir" : "At least one Identity document is required"}</div>
                    </div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <button className="add-row-btn" onClick={() => setDocOpen(true)}>
              {React.createElement(I.plus, { size: 14 })} {lang === "tr" ? "Belge Yükle" : "Upload document"}
            </button>
          </SectionCard>
        </div>
      </div>

      {/* Sticky form actions */}
      <div className="form-actions">
        <div className="left">
          {React.createElement(I.info, { size: 12 })}
          <span>
            {isView
              ? (lang === "tr" ? "Görüntüleme modu — kayıt değiştirilemez." : "View only — no changes allowed.")
              : (lang === "tr"
                ? "Kaydet'te belge kontrolü → arka planda KPS doğrulama + sanction taraması çalışır."
                : "Save triggers document check then background KPS + sanction screening.")}
          </span>
        </div>
        <div className="right">
          <button className="btn ghost">{lang === "tr" ? "Vazgeç" : "Cancel"}</button>
          {!isView && (
            <>
              <button className="btn">
                {React.createElement(I.doc, { size: 13 })}
                {lang === "tr" ? "Taslak Kaydet" : "Save draft"}
              </button>
              <button className="btn primary lg">
                {React.createElement(I.check, { size: 14 })}
                {isNew
                  ? (lang === "tr" ? "Kaydet ve Doğrula" : "Save & verify")
                  : (lang === "tr" ? "Kaydet" : "Save")}
              </button>
            </>
          )}
        </div>
      </div>

      <DocUploadModal open={docOpen} onClose={() => setDocOpen(false)} t={t} lang={lang} />
      <BlockModal open={blkOpen} onClose={() => setBlkOpen(false)} t={t} lang={lang} />
    </>
  );
}

window.IndividualCustomerForm = IndividualCustomerForm;
