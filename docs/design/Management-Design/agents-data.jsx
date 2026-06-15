// agents-data.jsx — mock agent rows for the Temsilciler grid.

(function () {
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(101);
  const pick = (a) => a[Math.floor(rand() * a.length)];

  const PREFIXES = ["Acme", "Yıldız", "Mavi", "Anadolu", "Boğaz", "Aksaray", "Ankara", "Bursa", "Antalya",
                    "Trabzon", "Kuzey", "Güney", "Doğu", "Batı", "Marmara", "Ege", "Karadeniz", "Akdeniz",
                    "Beyaz", "Altın", "Gümüş", "Pamukkale", "Galata", "Beyoğlu", "Üsküdar", "Kadıköy"];
  const TYPES    = ["Döviz", "Para Transfer", "Bayi", "Exchange", "Finans", "Hızlı Para", "Transfer"];
  const SUFFIXES = ["Merkez", "Şube", "Acentesi", "Ofisi", null, null];
  const ORG      = ["A.Ş.", "Ltd. Şti.", "Ltd. Şti.", "A.Ş."];
  const CITIES   = ["İstanbul / Kadıköy", "İstanbul / Beşiktaş", "İstanbul / Üsküdar", "İstanbul / Beyoğlu",
                    "Ankara / Çankaya", "Ankara / Keçiören", "İzmir / Konak", "İzmir / Karşıyaka",
                    "Bursa / Nilüfer", "Antalya / Muratpaşa", "Adana / Seyhan", "Gaziantep / Şahinbey",
                    "Konya / Selçuklu", "Kayseri / Melikgazi", "Trabzon / Ortahisar", "Eskişehir / Tepebaşı"];

  const AGENT_GROUPS = [
    { key: "platinum", label: "Platin", tone: "info",    commission: 0.30 },
    { key: "gold",     label: "Altın",  tone: "warn",    commission: 0.45 },
    { key: "silver",   label: "Gümüş",  tone: "muted",   commission: 0.65 },
    { key: "bronze",   label: "Bronz",  tone: "muted",   commission: 0.85 },
    { key: "standard", label: "Standart", tone: "muted", commission: 1.10 },
  ];
  const SETTLEMENT = ["realtime", "daily", "weekly", "monthly"];
  const STATUSES = [
    { v: "active",   weight: 70 },
    { v: "inactive", weight: 10 },
    { v: "blocked",  weight: 12 },
    { v: "closed",   weight: 8 },
  ];
  function pickWeighted() {
    const total = STATUSES.reduce((a, b) => a + b.weight, 0);
    let r = rand() * total;
    for (const s of STATUSES) { if ((r -= s.weight) <= 0) return s.v; }
    return STATUSES[0].v;
  }

  const BLOCK = ["Mutabakat Açık", "Sanksiyon İncelemesi", "Limit Aşımı", "Kasa Açığı", "Belge Eksik"];
  const CLOSE = ["Sözleşme Feshi", "Tüm Şubeler Kapalı", "İrtibat Kesilmiş", "Lisans İptali"];

  function vkn() {
    return String(1000000000 + Math.floor(rand() * 9000000000)).slice(0, 10);
  }
  function mersis() {
    return Array.from({ length: 4 }, () => String(Math.floor(rand() * 10000)).padStart(4, "0")).join("-");
  }
  function phone() {
    const a = pick([212, 216, 232, 312, 322, 224, 342, 352, 442, 462]);
    const b = 100 + Math.floor(rand() * 900);
    const c = 10 + Math.floor(rand() * 90);
    const d = 10 + Math.floor(rand() * 90);
    return `+90 ${a} ${b} ${c} ${d}`;
  }
  function makeName(i) {
    const pre = PREFIXES[i % PREFIXES.length];
    const ty  = pick(TYPES);
    const sx  = pick(SUFFIXES);
    const og  = pick(ORG);
    const parts = [pre, ty];
    if (sx) parts.push(sx);
    parts.push(og);
    return parts.join(" ");
  }
  function emailFromName(name) {
    const slug = name
      .toLocaleLowerCase("tr-TR")
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o")
      .replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/a\.ş\.|ltd\.|şti\./g, "")
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "");
    const dom = slug.split(".").slice(0, 2).join("");
    return `mutabakat@${dom}.com.tr`;
  }
  function dateStr(daysAgo) {
    const d = new Date(2026, 4, 23);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }

  function makeAgent(i) {
    const name = makeName(i);
    const grp = AGENT_GROUPS[Math.floor(rand() * AGENT_GROUPS.length)];
    const status = pickWeighted();
    const try_  = Math.floor((rand() - 0.15) * 850000); // can be slightly negative
    const usd   = Math.floor(rand() * 24000);
    const eur   = Math.floor(rand() * 18000);
    const lastTxDays = status === "active" ? Math.floor(rand() * 4)
                     : status === "inactive" ? 14 + Math.floor(rand() * 60)
                     : status === "blocked" ? 1 + Math.floor(rand() * 30)
                     : 90 + Math.floor(rand() * 180);
    const createdDays = lastTxDays + 30 + Math.floor(rand() * 1200);
    return {
      id: 30001 + i,
      name,
      city: pick(CITIES),
      email: emailFromName(name),
      phone: phone(),
      vkn: vkn(),
      mersis: mersis(),
      group: grp,
      settlement: pick(SETTLEMENT),
      balance: { TRY: try_, USD: usd, EUR: eur },
      createdAt: dateStr(createdDays),
      lastTxAt: lastTxDays === 0 ? "today" : dateStr(lastTxDays),
      status,
      blockReason: status === "blocked" ? pick(BLOCK) : null,
      closeReason: status === "closed"  ? pick(CLOSE) : null,
      txToday: status === "active" ? Math.floor(rand() * 180) : 0,
      branches: 1 + Math.floor(rand() * 6),
    };
  }

  const AGENTS = Array.from({ length: 42 }, (_, i) => makeAgent(i));
  window.AGENTS = AGENTS;
  window.AGENT_GROUPS = AGENT_GROUPS;
})();
