// wallets-data.jsx — wallet rows for Dijital Cüzdanlar.

(function () {
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(33);
  const pick = (a) => a[Math.floor(rand() * a.length)];

  // wallet_type enum — UI labels in i18n
  // Category: customer / agent / system
  const TYPES = [
    { code: "customer_main",      cat: "customer", icon: "wallet"   },
    { code: "customer_savings",   cat: "customer", icon: "wallet"   },
    { code: "agent_advance",      cat: "agent",    icon: "building" },
    { code: "agent_commission",   cat: "agent",    icon: "building" },
    { code: "system_reserve",     cat: "system",   icon: "shield"   },
    { code: "system_revenue",     cat: "system",   icon: "chart"    },
    { code: "system_suspense",    cat: "system",   icon: "warning"  },
    { code: "system_settlement",  cat: "system",   icon: "key"      },
  ];
  const CURRENCIES = ["TRY", "TRY", "TRY", "TRY", "USD", "USD", "EUR", "GBP"];

  function dateStr(daysAgo) {
    const d = new Date(2026, 4, 23);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }

  const wallets = [];
  let walletId = 1;

  // ─── System wallets (fewer, fixed) ───
  const SYSTEM_FIXED = [
    { code: "system_reserve",    name: "MERKEZ REZERV TRY",           ccy: "TRY", bal: 18_420_000 },
    { code: "system_reserve",    name: "MERKEZ REZERV USD",           ccy: "USD", bal: 1_280_400 },
    { code: "system_reserve",    name: "MERKEZ REZERV EUR",           ccy: "EUR", bal: 920_350 },
    { code: "system_revenue",    name: "KOMİSYON GELİR HESABI",       ccy: "TRY", bal: 4_823_550 },
    { code: "system_revenue",    name: "FX MARJ GELİR",                ccy: "TRY", bal: 1_245_800 },
    { code: "system_suspense",   name: "ŞÜPHELİ HESAP (SUSPENSE)",     ccy: "TRY", bal: 84_220, blocked: 84_220 },
    { code: "system_suspense",   name: "ŞÜPHELİ FX (SUSPENSE)",        ccy: "USD", bal: 12_400, blocked: 12_400 },
    { code: "system_settlement", name: "MUTABAKAT HESABI TRY",         ccy: "TRY", bal: 632_400 },
    { code: "system_settlement", name: "MUTABAKAT HESABI USD",         ccy: "USD", bal: 84_220 },
    { code: "system_settlement", name: "MUTABAKAT HESABI EUR",         ccy: "EUR", bal: 142_300 },
  ];
  SYSTEM_FIXED.forEach((s, i) => {
    wallets.push({
      id: walletId++,
      ownerNo: null,
      ownerType: "system",
      walletNo: "SYS-" + String(walletId).padStart(6, "0"),
      type: s.code,
      cat: "system",
      ownerName: s.name,
      phone: null,
      idNo: null,
      city: null,
      balance: s.bal,
      blocked: s.blocked || 0,
      ccy: s.ccy,
      txToday: Math.floor(rand() * 240),
      txAmtToday: Math.floor(rand() * 1_800_000),
      createdAt: dateStr(420 + i * 30),
    });
  });

  // ─── Customer wallets ───
  if (window.CUSTOMERS) {
    window.CUSTOMERS.forEach((c, i) => {
      if (c.type === "prospective") return; // prospects don't have wallets
      // each customer has 1 TRY main + maybe a foreign-ccy savings
      const main = {
        id: walletId++,
        ownerNo: c.id,
        ownerType: "customer",
        walletNo: `MS-${String(c.id).slice(-4)}-01`,
        type: "customer_main",
        cat: "customer",
        ownerName: c.name,
        phone: c.phone,
        idNo: c.idNo,
        idKind: c.idKind,
        city: c.city,
        balance: Math.floor(rand() * 250_000),
        blocked: 0,
        ccy: "TRY",
        txToday: c.status === "active" ? Math.floor(rand() * 12) : 0,
        txAmtToday: c.status === "active" ? Math.floor(rand() * 35_000) : 0,
        createdAt: c.createdAt,
      };
      // 35% chance balance has block, 5% full block
      if (rand() < 0.05) main.blocked = -1;
      else if (rand() < 0.18) main.blocked = Math.floor(main.balance * (0.1 + rand() * 0.4));
      wallets.push(main);
      // 30% have a second ccy wallet
      if (rand() < 0.30 && c.type === "individual") {
        const ccy = pick(["USD", "EUR", "GBP"]);
        wallets.push({
          id: walletId++,
          ownerNo: c.id,
          ownerType: "customer",
          walletNo: `MS-${String(c.id).slice(-4)}-02`,
          type: "customer_savings",
          cat: "customer",
          ownerName: c.name,
          phone: c.phone,
          idNo: c.idNo,
          idKind: c.idKind,
          city: c.city,
          balance: Math.floor(rand() * 12_000),
          blocked: 0,
          ccy,
          txToday: Math.floor(rand() * 3),
          txAmtToday: Math.floor(rand() * 4500),
          createdAt: c.createdAt,
        });
      }
    });
  }

  // ─── Agent wallets ───
  if (window.AGENTS) {
    window.AGENTS.forEach(a => {
      // Each agent has 1 advance (TRY) + 1 commission (TRY) [+ maybe USD/EUR advances]
      ["TRY"].forEach(ccy => {
        wallets.push({
          id: walletId++,
          ownerNo: a.id,
          ownerType: "agent",
          walletNo: `BY-${String(a.id).slice(-4)}-01`,
          type: "agent_advance",
          cat: "agent",
          ownerName: a.name,
          phone: a.phone,
          idNo: a.vkn,
          idKind: "VKN",
          city: a.city,
          balance: a.balance[ccy],
          blocked: 0,
          ccy,
          txToday: a.txToday,
          txAmtToday: a.txToday * 4200,
          createdAt: a.createdAt,
        });
      });
      // commission (always TRY)
      wallets.push({
        id: walletId++,
        ownerNo: a.id,
        ownerType: "agent",
        walletNo: `BY-${String(a.id).slice(-4)}-02`,
        type: "agent_commission",
        cat: "agent",
        ownerName: a.name,
        phone: a.phone,
        idNo: a.vkn,
        idKind: "VKN",
        city: a.city,
        balance: Math.floor(a.balance.TRY * 0.015 + rand() * 20_000),
        blocked: 0,
        ccy: "TRY",
        txToday: Math.floor(a.txToday * 0.3),
        txAmtToday: Math.floor(a.txToday * 65),
        createdAt: a.createdAt,
      });
      // some have USD/EUR advance
      if (rand() < 0.4) {
        const ccy = rand() < 0.5 ? "USD" : "EUR";
        wallets.push({
          id: walletId++,
          ownerNo: a.id,
          ownerType: "agent",
          walletNo: `BY-${String(a.id).slice(-4)}-03`,
          type: "agent_advance",
          cat: "agent",
          ownerName: a.name,
          phone: a.phone,
          idNo: a.vkn,
          idKind: "VKN",
          city: a.city,
          balance: a.balance[ccy],
          blocked: 0,
          ccy,
          txToday: Math.floor(rand() * 12),
          txAmtToday: Math.floor(rand() * 2400),
          createdAt: a.createdAt,
        });
      }
    });
  }

  // available balance helper
  function available(w) {
    if (w.blocked === -1) return 0;
    return Math.max(0, w.balance - w.blocked);
  }
  wallets.forEach(w => { w.available = available(w); });

  window.WALLETS = wallets;
})();
