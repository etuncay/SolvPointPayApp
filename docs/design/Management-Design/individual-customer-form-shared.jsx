// new-individual-customer.jsx — 2.1 Yeni Bireysel Müşteri (Insert/Update/View single page)

// ─────────── Sample data (for Edit/View modes) ───────────
const SAMPLE_PERSON = {
  // Identity
  firstName: "Ayşe",
  lastName: "Demir",
  idType: "TCKN",
  idCountry: "TUR",
  idNo: "12345678901",
  birthDate: "1991-04-18",
  customerType: "individual",

  // Müşteri Bilgileri (existing customer)
  customerNo: "MUS-0100482",
  campaign: "Diaspora Avrupa",
  campaignEndDate: "2026-12-31",
  kycLevel: "L2",
  riskScore: 28,
  riskSegment: "low",
  createdAt: "2024-08-12T11:42:00",
  status: "active",
  statusReason: null,

  // Erişim
  lastLogin: "2026-05-22T09:14:12",
  failedAttempts: 0,
  device: "iPhone 14 · iOS 17.5",
  ipLocation: "İstanbul, TR · 85.96.214.12",

  // Nüfus (from KPS — locked for TR)
  birthPlace: "İstanbul",
  maritalStatus: "married",
  serialNo: "B12 N87234",
  issueDate: "2019-03-04",
  issuingAuthority: "Kadıköy Nüfus Md.",
  validityDate: "2029-03-04",
  motherName: "Fatma",
  fatherName: "Mehmet",
  gender: "female",

  // Detay
  maidenName: "Yılmaz",
  taxCountry: "TUR",
  education: "bachelors",
  employment: "salaried",
  occupation: "Yazılım Geliştirici",
  employer: "Marmara Tekstil A.Ş.",
  language: "tr",
  notes: "Avrupa diaspora kampanyasına bağlı. Düzenli Almanya transferleri.",

  // Foreign (would be hidden when idCountry === TUR)
  visaType: null, visaEndDate: null,
  residencePermit: null, residencePermitEnd: null,
  birthCountry: "TUR", residentCountry: "TUR",

  // Bank accounts
  banks: [
    { id: 1, bank: "Garanti BBVA",  iban: "TR33 0006 2000 1234 0001 2345 67", currency: "TRY", branch: "212", accountNo: "12340012345", suffix: "100", isDefault: true,  status: "active" },
    { id: 2, bank: "İş Bankası",   iban: "TR45 0064 0000 0001 1234 5678 90", currency: "USD", branch: "1234", accountNo: "1234567",     suffix: "200", isDefault: true,  status: "active" },
    { id: 3, bank: "Yapı Kredi",   iban: "TR12 0067 1000 0000 4321 8765 43", currency: "EUR", branch: "844",  accountNo: "43218765",    suffix: "300", isDefault: true,  status: "active" },
    { id: 4, bank: "Garanti BBVA", iban: "TR98 0006 2000 1234 0009 8765 11", currency: "TRY", branch: "212",  accountNo: "98765",       suffix: "101", isDefault: false, status: "active" },
  ],

  // Finansal (read-only summary of cüzdanlar)
  wallets: [
    { id: "WAL-TRY-0001", balance: 24820.50, currency: "TRY", blocked: 0, txCountDay: 4, txAmountDay: 8200 },
    { id: "WAL-USD-0001", balance: 1240.00,  currency: "USD", blocked: 0, txCountDay: 1, txAmountDay: 320 },
    { id: "WAL-EUR-0001", balance: 540.00,   currency: "EUR", blocked: 0, txCountDay: 0, txAmountDay: 0 },
  ],

  // Adresler
  addresses: [
    { id: 1, type: "home",   country: "TUR", city: "İstanbul", district: "Kadıköy", neighbourhood: "Caferağa",   postcode: "34710", street: "Moda Cd.",          building: "12", apt: "5",  uavt: "23847122", isContact: true,  status: "active" },
    { id: 2, type: "work",   country: "TUR", city: "İstanbul", district: "Şişli",   neighbourhood: "Mecidiyeköy", postcode: "34394", street: "Büyükdere Cd.",     building: "201", apt: "14", uavt: "23847900", isContact: false, status: "active" },
  ],

  // İletişim
  contacts: [
    { id: 1, type: "email", value: "ayse.demir@gmail.com",    verified: true,  primary: true },
    { id: 2, type: "email", value: "ayse.demir@marmara.com",  verified: true,  primary: false },
    { id: 3, type: "phone", value: "+90 532 412 67 89",       verified: true,  primary: true },
    { id: 4, type: "phone", value: "+90 216 348 02 14",       verified: false, primary: false, kind: "landline" },
  ],

  // İşlem limitleri
  limits: { perTx: 50000, daily: 80000, monthly: 500000, currency: "TRY" },

  // Belgeler (özet — Doküman Yönetiminde detay)
  documents: [
    { id: 1, category: "Identity",       type: "TC Kimlik Kartı (Ön)",  validFrom: "2019-03-04", validTo: "2029-03-04", status: "approved" },
    { id: 2, category: "Identity",       type: "TC Kimlik Kartı (Arka)",validFrom: "2019-03-04", validTo: "2029-03-04", status: "approved" },
    { id: 3, category: "AddressProof",   type: "İkametgah Belgesi",     validFrom: "2025-11-02", validTo: "2026-11-02", status: "approved" },
  ],
};

// Foreign sample overlay
const FOREIGN_OVERLAY = {
  firstName: "Hans",
  lastName: "Müller",
  idType: "PASSPORT",
  idCountry: "DEU",
  idNo: "C8F4G2H21",
  birthDate: "1985-09-22",
  birthPlace: "München",
  birthCountry: "DEU",
  residentCountry: "TUR",
  visaType: "ShortTerm",
  visaEndDate: "2026-12-15",
  residencePermit: "TR-99-2024-04421",
  residencePermitEnd: "2026-12-15",
  motherName: "Petra",
  fatherName: "Klaus",
  maidenName: null,
  taxCountry: "DEU",
  language: "en",
  notes: "Yabancı uyruklu — vize/oturum kontrolü düzenli yapılır.",
};

window.SAMPLE_PERSON = SAMPLE_PERSON;
window.FOREIGN_OVERLAY = FOREIGN_OVERLAY;

// ─────────── Reusable field components ───────────
function Field({ label, required, hint, error, locked, lockReason, children, col = 1, className = "" }) {
  const I = window.Icon;
  return (
    <div className={`field col-${col} ${className} ${locked ? "locked" : ""}`}>
      <label>
        {label}
        {required && <span className="req">*</span>}
        {locked && (
          <span className="lock" title={lockReason}>
            {React.createElement(I.lock, { size: 10 })}
            KPS
          </span>
        )}
      </label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="err">{React.createElement(I.warning, { size: 11 })}{error}</span>}
    </div>
  );
}

function SectionCard({ no, title, icon, meta, children }) {
  const I = window.Icon;
  return (
    <section className="fcard" id={`sec-${no}`}>
      <div className="fcard-head">
        {icon && (
          <div className="card-icon" style={{ width: 26, height: 26 }}>
            {React.createElement(I[icon], { size: 13 })}
          </div>
        )}
        <span className="no">{no}</span>
        <h3>{title}</h3>
        <span className="meta">{meta}</span>
      </div>
      <div className="fcard-body">{children}</div>
    </section>
  );
}

// ─────────── Belge Yükleme modal ───────────
function DocUploadModal({ open, onClose, t, lang }) {
  const I = window.Icon;
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{lang === "tr" ? "Belge Yükle" : "Upload document"}</h2>
          <p>{lang === "tr" ? "Müşteri dosyasına eklenecek belgeyi seçin." : "Pick a document to attach to the customer file."}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={lang === "tr" ? "Belge Kategorisi" : "Category"} required>
            <select className="select">
              <option>Identity</option>
              <option>AddressProof</option>
              <option>SourceOfFunds</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label={lang === "tr" ? "Belge Türü" : "Type"} required>
            <select className="select">
              <option>TC Kimlik Kartı (Ön)</option>
              <option>TC Kimlik Kartı (Arka)</option>
              <option>Pasaport</option>
              <option>İkametgah Belgesi</option>
              <option>Maaş Bordrosu</option>
            </select>
          </Field>
          <div className="fgrid cols-2" style={{ gap: 14 }}>
            <Field label={lang === "tr" ? "Geçerlilik Başlangıç" : "Valid from"} required>
              <input className="input" type="date" defaultValue="2026-05-23" />
            </Field>
            <Field label={lang === "tr" ? "Geçerlilik Bitiş" : "Valid until"} required>
              <input className="input" type="date" defaultValue="2027-05-23" />
            </Field>
          </div>
          <Field label={lang === "tr" ? "Dosya" : "File"} required>
            <div style={{
              border: "2px dashed var(--line-strong)",
              borderRadius: "var(--r-md)",
              padding: "20px 16px",
              textAlign: "center",
              color: "var(--fg-muted)",
              fontSize: 12.5,
              cursor: "pointer",
            }}>
              {React.createElement(I.download, { size: 20, style: { transform: "rotate(180deg)", marginBottom: 6, opacity: 0.6 } })}
              <div><strong style={{ color: "var(--fg)" }}>{lang === "tr" ? "Sürükleyip bırakın" : "Drag & drop"}</strong> {lang === "tr" ? "veya dosya seçin" : "or browse"}</div>
              <div className="fs-11 t-mute" style={{ marginTop: 4 }}>PDF, JPG, PNG · {lang === "tr" ? "maks." : "max."} 10MB</div>
            </div>
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button className="btn" onClick={onClose}>{lang === "tr" ? "İptal" : "Cancel"}</button>
          <button className="btn primary" onClick={onClose}>{lang === "tr" ? "Ekle" : "Add"}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────── Bloke modal ───────────
function BlockModal({ open, onClose, t, lang }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ color: "var(--danger-fg)" }}>
            {lang === "tr" ? "Müşteriyi Blokeye Al" : "Block customer"}
          </h2>
          <p>{lang === "tr"
            ? "Müşteri tam blokeye alınacak. Devam eden ve tamamlanan işlemler etkilenmez."
            : "Customer will be fully blocked. Ongoing and completed transactions are unaffected."}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={lang === "tr" ? "Gerekçe" : "Reason"} required>
            <select className="select">
              <option>Belge Eksik</option>
              <option>AML İncelemesi</option>
              <option>Şüpheli İşlem</option>
              <option>Sanksiyon Eşleşmesi</option>
              <option>Müşteri Talebi</option>
            </select>
          </Field>
          <Field label={lang === "tr" ? "Bloke Bitiş Tarihi" : "Block until"} hint={lang === "tr" ? "Boş bırakılırsa süresizdir. Batch otomatik kaldırır." : "Leave empty for indefinite. Daily batch auto-releases."}>
            <input className="input" type="date" />
          </Field>
          <Field label={lang === "tr" ? "Not" : "Note"}>
            <textarea className="textarea" placeholder={lang === "tr" ? "Operasyonel not…" : "Operational note…"}></textarea>
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button className="btn" onClick={onClose}>{lang === "tr" ? "Vazgeç" : "Cancel"}</button>
          <button className="btn danger" onClick={onClose} style={{ background: "var(--danger)", color: "white", borderColor: "var(--danger)" }}>
            {lang === "tr" ? "Blokeye Al" : "Block"}
          </button>
        </div>
      </div>
    </div>
  );
}

window.DocUploadModal = DocUploadModal;
window.BlockModal = BlockModal;
window.Field = Field;
window.SectionCard = SectionCard;
