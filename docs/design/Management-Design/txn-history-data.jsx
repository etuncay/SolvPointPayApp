// txn-history-data.jsx — mock transaction movements for İşlem Hareketleri (7).

(function () {
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(2026);
  const pick = (a) => a[Math.floor(rand() * a.length)];

  const NAMES = [
    "Ahmet Yılmaz", "Ayşe Demir", "Mehmet Şahin", "Fatma Kaya", "Mustafa Çelik",
    "Elif Aydın", "Hüseyin Öztürk", "Zeynep Yıldız", "Ali Arslan", "Hatice Doğan",
    "Emre Koç", "Selin Polat", "Burak Aksoy", "Deniz Erdoğan", "Ceren Aslan",
    "Hans Müller", "Maria Rossi", "John Smith", "Anna Schmidt", "Pierre Dubois",
  ];
  const CORP = ["Marmara Tekstil A.Ş.", "Boğaziçi Lojistik Ltd.", "Anadolu Gıda A.Ş.", "Ege İnşaat A.Ş."];

  const TYPES = [
    { code: "own",    tr: "Kendi Cüzdanına", en: "Own Wallet",    no: "6.1" },
    { code: "bank",   tr: "Banka Hesabına",  en: "Bank Account",  no: "6.2" },
    { code: "person", tr: "Kişiye",          en: "To a Person",   no: "6.3" },
    { code: "abroad", tr: "Yurt Dışına",     en: "Abroad",        no: "6.4" },
    { code: "withdraw", tr: "Para Çekme",    en: "Withdrawal",    no: "5" },
  ];
  const CCY = ["TRY", "TRY", "TRY", "USD", "EUR"];
  const STATUSES = [
    { v: "completed", w: 58 },
    { v: "pending",   w: 14 },
    { v: "sent",      w: 8 },
    { v: "onhold",    w: 6 },
    { v: "rejected",  w: 6 },
    { v: "cancelled", w: 5 },
    { v: "error",     w: 3 },
  ];
  function pickStatus() {
    const tot = STATUSES.reduce((a, b) => a + b.w, 0);
    let r = rand() * tot;
    for (const s of STATUSES) { if ((r -= s.w) <= 0) return s.v; }
    return "completed";
  }
  const PURPOSES = ["Aile Desteği", "Mal Alımı", "Hizmet Ödemesi", "Kira", "Eğitim", "Maaş", "—"];

  function iban() {
    let s = "TR";
    for (let i = 0; i < 24; i++) s += Math.floor(rand() * 10);
    return s.replace(/(.{4})/g, "$1 ").trim();
  }
  function fxIban() {
    const cc = pick(["DE", "NL", "GB", "FR", "AT"]);
    let s = cc;
    for (let i = 0; i < 20; i++) s += Math.floor(rand() * 10);
    return s.replace(/(.{4})/g, "$1 ").trim();
  }

  function dt(daysAgo, hour) {
    const d = new Date(2026, 4, 31, hour, Math.floor(rand() * 60), 0);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  }

  function make(i) {
    const type = pick(TYPES);
    const ccy = type.code === "own" ? "TRY" : pick(CCY);
    const amount = Math.floor(300 + rand() * 95000);
    const status = pickStatus();
    const role = rand() > 0.45 ? "sender" : "receiver";
    const isToday = i < 14; // most recent are "today"
    const daysAgo = isToday ? 0 : Math.floor(rand() * 45) + 1;
    const hour = 8 + Math.floor(rand() * 12);
    const senderCorp = rand() > 0.82;
    const recvCorp = rand() > 0.85;
    const sender = senderCorp ? pick(CORP) : pick(NAMES);
    const recv = type.code === "own" ? sender : (recvCorp ? pick(CORP) : pick(NAMES));

    // agent income (TRY) — commission earned on this txn
    const baseFee = 15 + amount * 0.0012;
    const incomeTRY = Math.round((status === "rejected" || status === "cancelled") ? 0 : baseFee * (role === "sender" ? 1 : 0.5));

    return {
      id: `TRX-${(2200000 + i * 137).toString()}`,
      date: dt(daysAgo, hour),
      isToday,
      sender, senderCorp,
      receiver: recv, recvCorp,
      iban: (type.code === "bank") ? iban() : (type.code === "abroad" ? fxIban() : ""),
      type,
      ccy,
      amount,
      purpose: pick(PURPOSES),
      ref: `REF${(100000 + Math.floor(rand() * 899999))}`,
      status,
      role,
      incomeTRY,
    };
  }

  const TXNS = Array.from({ length: 64 }, (_, i) => make(i));
  window.TXNS = TXNS;
})();
