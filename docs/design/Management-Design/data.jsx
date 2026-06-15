// data.jsx — deterministic mock data for the BackOffice dashboard.

const TR_NAMES = [
  "Ahmet Yılmaz", "Ayşe Demir", "Mehmet Şahin", "Fatma Kaya", "Mustafa Çelik",
  "Elif Aydın", "Hüseyin Öztürk", "Zeynep Yıldız", "Ali Arslan", "Hatice Doğan",
  "Emre Koç", "Selin Polat", "Burak Aksoy", "Deniz Erdoğan", "Ceren Aslan",
  "Kerem Tekin", "Merve Çetin", "Onur Avcı", "Sevgi Bulut", "Tolga Korkmaz",
];

const AGENT_NAMES = [
  "Acme Döviz - Kadıköy", "Yıldız Para Transfer - Üsküdar", "Mavi Bayi - Beşiktaş",
  "Anatolia Exchange - İzmir", "Boğaz Finans - Beyoğlu", "Aksaray Hızlı Para",
  "Ankara Merkez Bayi", "Bursa Garanti Bayi", "Antalya Sahil Transfer", "Trabzon Karadeniz Bayi",
];

const CORRIDORS = [
  ["TR", "DE"], ["TR", "AT"], ["TR", "NL"], ["TR", "BE"], ["TR", "FR"],
  ["DE", "TR"], ["GB", "TR"], ["US", "TR"], ["AT", "TR"], ["SE", "TR"],
  ["TR", "AZ"], ["TR", "UA"], ["TR", "BG"],
];

function flagify(c) {
  // turn 2-letter code into emoji flag
  const A = 0x1F1E6;
  return String.fromCodePoint(...c.toUpperCase().split("").map(ch => A + ch.charCodeAt(0) - 65));
}

// Seeded RNG
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

function gen(n, fn) { return Array.from({ length: n }, (_, i) => fn(i)); }

// ───────── My pending approvals (mixed approvals queue) ─────────
const MY_APPROVALS = gen(14, (i) => {
  const types = [
    { code: "TRF_AML", label: "AML Onayı", icon: "shield" },
    { code: "REFUND", label: "İade Onayı", icon: "ban" },
    { code: "AGENT_LIMIT", label: "Bayi Limit Artışı", icon: "building" },
    { code: "PARAM", label: "Parametre Değişikliği", icon: "settings" },
    { code: "REG_CUST", label: "Yüksek Risk Müşteri", icon: "user" },
  ];
  const t = types[i % types.length];
  return {
    id: `APR-${(8421 + i).toString().padStart(6, "0")}`,
    type: t.label,
    typeCode: t.code,
    icon: t.icon,
    requester: TR_NAMES[i % TR_NAMES.length],
    age: 5 + i * 17,
    priority: i < 3 ? "high" : i < 7 ? "med" : "low",
    amount: t.code === "TRF_AML" || t.code === "REFUND" ? Math.floor(2000 + rand() * 180000) : null,
  };
});

// ───────── Pending transfers ─────────
const PENDING_XFER = gen(18, (i) => {
  const c = pick(CORRIDORS);
  return {
    id: `TRX-${(20489 + i * 7).toString().padStart(7, "0")}`,
    customer: TR_NAMES[(i * 3) % TR_NAMES.length],
    from: c[0], to: c[1],
    amount: Math.floor(800 + rand() * 95000),
    state: i < 4 ? "review" : "pending",
    age: 1 + i * 8,
    risk: i < 2 ? "high" : i < 9 ? "med" : "low",
  };
});

// ───────── KYC manual queue ─────────
const KYC_QUEUE = gen(12, (i) => ({
  id: `KYC-${(5012 + i).toString().padStart(5, "0")}`,
  customer: TR_NAMES[(i * 5) % TR_NAMES.length],
  reason: pick(["Belge okuma hatası", "Adres doğrulanamadı", "Sanksiyon eşleşmesi", "Selfie eşleşmiyor", "Doğum tarihi uyumsuz", "PEP listesi"]),
  age: 12 + i * 23,
  level: pick(["L1", "L2", "L3"]),
  risk: i < 3 ? "high" : "med",
}));

// ───────── AML held transfers ─────────
const AML_HELD = gen(9, (i) => {
  const c = pick(CORRIDORS);
  return {
    id: `TRX-${(40012 + i * 13).toString().padStart(7, "0")}`,
    customer: TR_NAMES[(i * 7) % TR_NAMES.length],
    from: c[0], to: c[1],
    amount: Math.floor(5000 + rand() * 250000),
    rule: pick(["Yüksek tutar eşiği", "Hızlı tekrar gönderim", "Riskli koridor", "Sanksiyon eşleşmesi", "Yapay parçalama (structuring)", "Bilinen şüpheli alıcı"]),
    age: 30 + i * 41,
    risk: "high",
  };
});

// ───────── Rejected / cancelled today ─────────
const REJECTED = gen(11, (i) => {
  const c = pick(CORRIDORS);
  return {
    id: `TRX-${(60014 + i * 5).toString().padStart(7, "0")}`,
    customer: TR_NAMES[(i * 11) % TR_NAMES.length],
    from: c[0], to: c[1],
    amount: Math.floor(500 + rand() * 60000),
    state: i % 3 === 0 ? "cancelled" : "rejected",
    reason: pick(["Müşteri talebi", "Yetersiz bakiye", "AML reddi", "Sanksiyon", "Kart reddi", "Süre aşımı", "KYC eksik"]),
    age: 5 + i * 18,
  };
});

// ───────── Daily transaction volume (24h, hourly) ─────────
const DAILY_VOLUME = gen(24, (h) => {
  // Realistic curve: low at night, peak 11-15h, second peak 18-21h
  const base = 200 + 800 * Math.exp(-Math.pow((h - 13) / 4.5, 2)) + 500 * Math.exp(-Math.pow((h - 19.5) / 2.8, 2));
  const success = Math.floor(base + rand() * 80);
  const failed = Math.floor(success * (0.04 + rand() * 0.06));
  return {
    hour: h,
    success,
    failed,
    amount: Math.floor(success * (1200 + rand() * 800)),
  };
});

// ───────── New customers (30 days) ─────────
const NEW_CUSTOMERS_30D = gen(30, (i) => {
  const trend = 80 + i * 1.6;
  const weekly = Math.sin(i / 1.1) * 22;
  return {
    day: i,
    count: Math.max(10, Math.floor(trend + weekly + (rand() - 0.5) * 35)),
  };
});

// ───────── Top customers (sending/receiving today) ─────────
const TOP_CUSTOMERS = gen(10, (i) => ({
  rank: i + 1,
  name: TR_NAMES[(i * 4) % TR_NAMES.length],
  id: `MUS-${(100348 + i * 17).toString().padStart(7, "0")}`,
  sent: Math.floor(40000 + (10 - i) * 25000 + rand() * 10000),
  received: Math.floor(20000 + (10 - i) * 18000 + rand() * 8000),
  withdrawn: Math.floor(15000 + (10 - i) * 12000 + rand() * 6000),
  txCount: Math.floor(20 - i + rand() * 8),
}));

// ───────── Top agents (received / paid out today) ─────────
const TOP_AGENTS = gen(10, (i) => ({
  rank: i + 1,
  name: AGENT_NAMES[i % AGENT_NAMES.length],
  id: `BAY-${(2001 + i * 7).toString().padStart(5, "0")}`,
  received: Math.floor(180000 + (10 - i) * 95000 + rand() * 30000),
  paid: Math.floor(120000 + (10 - i) * 80000 + rand() * 22000),
  txCount: Math.floor(85 - i * 6 + rand() * 15),
}));

// ───────── System health ─────────
const SYS_HEALTH = {
  successRate: 99.42,
  p95: 184,
  p99: 612,
  errorRate: 0.58,
  uptime7d: 99.98,
  topErrors: [
    { svc: "kyc-verify-svc",     errors: 1284, p95: 412, p99: 1820, delta: +12 },
    { svc: "transfer-router",    errors:  782, p95: 168, p99:  640, delta:  -3 },
    { svc: "fx-pricing-engine",  errors:  421, p95: 92,  p99:  280, delta:  +8 },
  ],
  critical: [
    { endpoint: "POST /transfer/initiate",  p95: 124, p99: 380, err: 0.21 },
    { endpoint: "POST /kyc/verify",          p95: 412, p99: 1820, err: 1.84 },
    { endpoint: "GET  /customer/balance",    p95:  62, p99:  150, err: 0.04 },
  ],
};

// ───────── Failed sign-in attempts ─────────
const FAILED_LOGINS = [
  { ip: "85.96.214.12",  loc: "İstanbul, TR",  when: "Bugün 09:14",       ua: "Chrome 124 / macOS",   },
  { ip: "212.156.74.99", loc: "Bilinmiyor",    when: "Dün 22:48",          ua: "Firefox 126 / Windows" },
  { ip: "188.43.21.5",   loc: "Moskova, RU",   when: "21 May 02:31",       ua: "Safari / iPhone"      },
  { ip: "10.41.7.122",   loc: "VPN",           when: "19 May 11:02",       ua: "Edge / Windows"       },
];

// ───────── Notifications (topbar bell) ─────────
const NOTIFS = [
  { id: 1, level: "warn",   title: "AML kuralı tetiklendi",  desc: "TRX-0040012 — yüksek tutar eşiği", time: "2dk", icon: "shield" },
  { id: 2, level: "info",   title: "Onayınız bekleniyor",     desc: "APR-008427 — Bayi limit artışı",   time: "12dk", icon: "approve" },
  { id: 3, level: "danger", title: "Servis hata oranı yüksek", desc: "kyc-verify-svc 1.8% — eşik 0.5%", time: "34dk", icon: "warning" },
  { id: 4, level: "ok",     title: "Günlük mutabakat tamam", desc: "Tüm bayi mutabakatları kapatıldı", time: "1sa",  icon: "check" },
];

Object.assign(window, {
  MY_APPROVALS, PENDING_XFER, KYC_QUEUE, AML_HELD, REJECTED,
  DAILY_VOLUME, NEW_CUSTOMERS_30D, TOP_CUSTOMERS, TOP_AGENTS,
  SYS_HEALTH, FAILED_LOGINS, NOTIFS, TR_NAMES, AGENT_NAMES, flagify,
});
