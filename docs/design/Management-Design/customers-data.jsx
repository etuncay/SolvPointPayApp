// customers-data.jsx — mock customer rows for the Müşteriler grid.

(function () {
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(7);
  const pick = (a) => a[Math.floor(rand() * a.length)];

  const FIRST_M = ["Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Emre", "Burak", "Tolga", "Onur", "Kerem", "Furkan", "Berk", "Cem", "Serkan", "Hakan", "Yusuf", "Salih", "İlker", "Doğukan", "Caner"];
  const FIRST_F = ["Ayşe", "Fatma", "Elif", "Zeynep", "Hatice", "Merve", "Selin", "Deniz", "Ceren", "Sevgi", "Esra", "Gamze", "Pınar", "Buse", "Aslı", "Ece", "Damla", "Nazlı", "İrem", "Sıla"];
  const LASTS  = ["Yılmaz", "Demir", "Şahin", "Kaya", "Çelik", "Aydın", "Öztürk", "Yıldız", "Arslan", "Doğan", "Koç", "Polat", "Aksoy", "Erdoğan", "Aslan", "Tekin", "Çetin", "Avcı", "Bulut", "Korkmaz", "Güneş", "Acar", "Karaca", "Özdemir", "Kurt"];

  const CORP_NAMES = [
    "Marmara Tekstil A.Ş.", "Boğaziçi Lojistik Ltd. Şti.", "Anadolu Gıda Üretim A.Ş.",
    "Yıldız Yapı Endüstri Ltd.", "Ege İnşaat Müteahhitlik A.Ş.", "Karadeniz Denizcilik A.Ş.",
    "İzmir Limanı Hizmetleri A.Ş.", "Başkent Bilişim Çözümleri Ltd.", "Akdeniz Turizm Yatırım A.Ş.",
    "Doğu Anadolu Tarım Ürünleri Koop.", "Pamukkale Termal Otelcilik A.Ş.",
    "Kapadokya Reklam Ajansı Ltd. Şti.", "Galata Finans Danışmanlık A.Ş.",
    "Bursa Otomotiv Yedek Parça Ltd.", "Trakya Şarapçılık Ltd. Şti.",
  ];

  const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kayseri", "Trabzon"];
  const CAMPAIGNS = [
    null, null, null, null,
    "Yaz Kampanyası 2026", "Hoşgeldin Bonusu", "Premium Müşteri", "Diaspora Avrupa",
    "İlk Transfer Ücretsiz", "Sadakat Programı",
  ];

  const KYC_INDIV = ["L1", "L2", "L3", "Tier 0"]; // kyc_level
  const KYC_CORP = ["Approved", "Pending", "Returned", "Rejected"]; // approval_status
  const RISK_SEG = ["low", "med", "high", "critical"];
  const STATUSES = [
    { v: "active",   weight: 65 },
    { v: "inactive", weight: 12 },
    { v: "blocked",  weight: 12 },
    { v: "closed",   weight: 8 },
    { v: "prospect", weight: 3 },
  ];
  function pickWeighted() {
    const total = STATUSES.reduce((a, b) => a + b.weight, 0);
    let r = rand() * total;
    for (const s of STATUSES) { if ((r -= s.weight) <= 0) return s.v; }
    return STATUSES[0].v;
  }

  const BLOCK_REASONS = ["Belge Eksik", "AML İncelemesi", "Adres Doğrulanmadı", "Şüpheli İşlem", "Sanksiyon Eşleşmesi"];
  const CLOSE_REASONS = ["Uzun Süre Kullanılmama", "Müşteri Talebi", "Vefat Bildirimi", "İrtibat Kesilmiş"];

  function tckn(i) {
    // 11-digit string seeded; not a real Luhn — visual only
    let n = String(10000000000 + Math.floor(rand() * 90000000000));
    return n.slice(0, 11);
  }
  function vkn(i) {
    return String(1000000000 + Math.floor(rand() * 9000000000)).slice(0, 10);
  }
  function passport() {
    const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return L[Math.floor(rand() * 26)] + String(Math.floor(rand() * 90000000) + 10000000);
  }
  function phone(i) {
    const a = 500 + Math.floor(rand() * 99);
    const b = 100 + Math.floor(rand() * 900);
    const c = 10 + Math.floor(rand() * 90);
    const d = 10 + Math.floor(rand() * 90);
    return `+90 ${a} ${b} ${c} ${d}`;
  }
  function emailFromName(name, corp = false) {
    const slug = name
      .toLocaleLowerCase("tr-TR")
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o")
      .replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/a\.ş\.|ltd\.|şti\.|koop\.|kooperatifi/g, "")
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "");
    const domains = corp
      ? [`${slug.split(".")[0]}.com.tr`, `${slug.split(".")[0]}.com`, `${slug.split(".")[0]}.tr`]
      : ["gmail.com", "outlook.com", "hotmail.com", "icloud.com", "yandex.com"];
    return `${slug}@${pick(domains)}`;
  }
  function dateStr(daysAgo) {
    const d = new Date(2026, 4, 23);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }

  function makeCustomer(i) {
    // distribution: ~70% individual, ~25% corporate, ~5% prospective
    const r = rand();
    const type = r < 0.70 ? "individual" : r < 0.95 ? "corporate" : "prospective";
    const isFemale = rand() > 0.5;
    let fullName, name;
    if (type === "corporate") {
      fullName = CORP_NAMES[i % CORP_NAMES.length];
      name = fullName;
    } else {
      const f = isFemale ? pick(FIRST_F) : pick(FIRST_M);
      const l = pick(LASTS);
      fullName = `${f} ${l}`;
      name = fullName;
    }
    const status = type === "prospective" ? "prospect" : pickWeighted();
    const seg = pick(RISK_SEG);
    const riskScore = seg === "low" ? Math.floor(10 + rand() * 25)
                    : seg === "med" ? Math.floor(35 + rand() * 25)
                    : seg === "high" ? Math.floor(60 + rand() * 20)
                    : Math.floor(80 + rand() * 20);
    const kyc = type === "corporate" ? pick(KYC_CORP) : pick(KYC_INDIV);
    const kycType = type === "corporate" ? "approval_status" : "kyc_level";

    const idKind = type === "corporate" ? "VKN" : rand() < 0.85 ? "TCKN" : "PASS";
    const idNo   = idKind === "VKN" ? vkn(i)
                 : idKind === "TCKN" ? tckn(i)
                 : passport();

    return {
      id: 99901 + i,
      type,
      name,
      isFemale,
      email: emailFromName(name, type === "corporate"),
      phone: phone(i),
      idKind,
      idNo,
      city: pick(CITIES),
      campaign: pick(CAMPAIGNS),
      kyc, kycType,
      riskScore,
      riskSeg: seg,
      createdAt: dateStr(Math.floor(rand() * 540)),
      status,
      blockReason: status === "blocked" ? pick(BLOCK_REASONS) : null,
      closeReason: status === "closed"  ? pick(CLOSE_REASONS) : null,
    };
  }

  const COUNT = 58;
  const CUSTOMERS = Array.from({ length: COUNT }, (_, i) => makeCustomer(i));

  window.CUSTOMERS = CUSTOMERS;
})();
