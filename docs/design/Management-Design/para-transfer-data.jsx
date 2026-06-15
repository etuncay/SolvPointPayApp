// para-transfer-data.jsx — mock senders, fees, FX, countries for Para Transferi (6).

(function () {
  // Senders keyed by Müşteri No, TCKN, or VKN
  const SENDERS = {
    individual_l2: {
      key: "MUS-0100482",
      type: "individual",
      name: "Ayşe Demir",
      idNo: "12345678901",
      idType: "TCKN",
      kyc: "L2", kycLevel: 2,
      status: "active",
      phone: "+90 532 412 67 89",
      wallets: { TRY: 24820.5, USD: 1240, EUR: 540 },
      sanctionHit: false,
    },
    individual_l1: {
      key: "98765432109",
      type: "individual",
      name: "Kerem Tekin",
      idNo: "98765432109",
      idType: "TCKN",
      kyc: "L1", kycLevel: 1,
      status: "active",
      phone: "+90 535 882 19 04",
      wallets: { TRY: 3200 },
      sanctionHit: false,
    },
    corporate: {
      key: "1234567890",
      type: "corporate",
      name: "Marmara Tekstil A.Ş.",
      vkn: "1234567890",
      idType: "VKN",
      kyc: "Approved", kycLevel: 3,
      status: "active",
      phone: "+90 212 555 88 12",
      wallets: { TRY: 128400, USD: 9800 },
      authPerson: "Mehmet Şahin",
      authPersonId: "23456789012",
      docExpired: true,
      sanctionHit: false,
    },
  };

  // Lookup map (multiple keys → same sender)
  const LOOKUP = {
    "MUS-0100482": "individual_l2",
    "12345678901": "individual_l2",
    "98765432109": "individual_l1",
    "MUS-0298113": "individual_l1",
    "1234567890": "corporate",
    "VKN-1234567890": "corporate",
  };

  function findSender(q) {
    const key = (q || "").trim().toUpperCase().replace(/\s+/g, "");
    const norm = Object.keys(LOOKUP).find(k => k.toUpperCase() === key);
    if (norm) return { ...SENDERS[LOOKUP[norm]] };
    return null;
  }

  // Fee schedule (currency-agnostic, shown in TRY equivalents)
  const FEES = [
    { min: 0,      max: 1000,     fixed: 15, rate: 0.20 },
    { min: 1000,   max: 10000,    fixed: 25, rate: 0.15 },
    { min: 10000,  max: 50000,    fixed: 40, rate: 0.10 },
    { min: 50000,  max: Infinity, fixed: 60, rate: 0.07 },
  ];
  const FEE_CAMPAIGN = "01.01.2026 – 31.12.2026";

  function feeRowFor(amount) {
    return FEES.findIndex(f => amount > f.min && amount <= f.max);
  }
  function computeFee(amount) {
    const i = feeRowFor(amount);
    if (i < 0) return 0;
    const f = FEES[i];
    return f.fixed + amount * (f.rate / 100);
  }

  // FX mid-market value in TRY per 1 unit
  const FX_TRY = { TRY: 1, USD: 38.82, EUR: 42.04, GBP: 49.21 };
  function fxRate(src, tgt) {
    return FX_TRY[src] / FX_TRY[tgt];
  }

  const CURRENCIES = ["TRY", "USD", "EUR", "GBP"];

  const COUNTRIES = [
    { code: "DE", tr: "Almanya",     en: "Germany" },
    { code: "AT", tr: "Avusturya",   en: "Austria" },
    { code: "NL", tr: "Hollanda",    en: "Netherlands" },
    { code: "GB", tr: "İngiltere",   en: "United Kingdom" },
    { code: "FR", tr: "Fransa",      en: "France" },
    { code: "US", tr: "ABD",         en: "United States" },
    { code: "AZ", tr: "Azerbaycan",  en: "Azerbaijan" },
    { code: "IR", tr: "İran",        en: "Iran",   risky: true },
    { code: "SY", tr: "Suriye",      en: "Syria",  risky: true },
    { code: "RU", tr: "Rusya",       en: "Russia", risky: true },
  ];

  // Registered recipients (for 6.3 masked-match demo)
  const REG_RECIPIENTS = {
    "11223344556": { name: "Zeynep Yıldız", masked: "Z*** Y*****", customerNo: "MUS-0177204" },
    "MUS-0177204": { name: "Zeynep Yıldız", masked: "Z*** Y*****", customerNo: "MUS-0177204" },
  };

  function fmtCur(n, ccy, lang) {
    const locale = lang === "tr" ? "tr-TR" : "en-US";
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + " " + ccy;
  }

  Object.assign(window, {
    PT_SENDERS: SENDERS, PT_findSender: findSender,
    PT_FEES: FEES, PT_FEE_CAMPAIGN: FEE_CAMPAIGN, PT_feeRowFor: feeRowFor, PT_computeFee: computeFee,
    PT_fxRate: fxRate, PT_CURRENCIES: CURRENCIES, PT_COUNTRIES: COUNTRIES,
    PT_REG_RECIPIENTS: REG_RECIPIENTS, PT_fmtCur: fmtCur, PT_FX_TRY: FX_TRY,
  });
})();
