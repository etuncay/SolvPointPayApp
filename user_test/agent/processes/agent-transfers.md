---
screen: agent-transfers
route: /transfers/*
app: agent
updated: 2026-06-18
status: ready
---

# Para Transferi

## Amaç

Temsilcinin dört transfer varyantında (kendi cüzdanı, kişiye, banka/IBAN, yurt dışı) gönderen sorgusu, **uyumluluk uyarı bandı** (blocked / düşük KYC / risk), **KYC L2 kapısı** (kendi cüzdanı), **limit reddi** ve sanction akışlarının doğrulanması (`docs/Agent/6.para-transferi.md`).

## Ön koşullar

- [ ] Agent dev server: `http://localhost:5176` (`pnpm --filter @epay/agent dev`)
- [ ] Mock mod (`isDemoMode`) — IndexedDB seed yüklü
- [ ] Giriş: `agent@epay.demo` / `Epay.1234`
- [ ] Sidebar → Para Transferi alt menüsü erişilebilir (`transfers.access` izni)

## Route'lar

| Varyant | Route | `TransferVariant` |
|---------|-------|-------------------|
| Kendi cüzdanına | `/transfers/own-wallet` | `ownWallet` |
| Kişiye | `/transfers/person` | `person` |
| Banka hesabına (IBAN) | `/transfers/bank-account` | `bankAccount` |
| Yurt dışı | `/transfers/abroad` | `abroad` |

## Test verisi — uyumluluk

| Senaryo | TCKN / VKN | Müşteri | Fixture | Uyarı / kapı |
|---------|------------|---------|---------|--------------|
| Düşük KYC (L1) | `75683988090` | Caner Avcı `99901` | [demo-caner-avci](../fixtures/customers/demo-caner-avci.md) | `kyc_low` |
| Düşük KYC (Tier 0) | `84590344827` | Sıla Yıldız `99913` | [demo-sila-yildiz-tier0](../fixtures/customers/demo-sila-yildiz-tier0.md) | `kyc_low` + **10k limit** |
| Blokaj + risk | `36338154452` | Yusuf Avcı `99910` | [demo-yusuf-avci-blocked](../fixtures/customers/demo-yusuf-avci-blocked.md) | `blocked` + `risk_high` |
| L2 temiz gönderen | `78568632556` | Hatice Acar `99902` | [demo-hatice-acar](../fixtures/customers/demo-hatice-acar.md) | Uyarı yok (belge süresi aramada) |
| Tüzel temiz | `1792956117` | Anadolu Gıda `99903` | — | Yetkili seçimi |
| Kayıtsız | `00000000000` | — | — | `ag_tr_not_found` + kayıt CTA |

Sorgu satırındaki **örnek chip'ler** (TRY kimlik): L2, L1, tüzel, kayıtsız; ayrıca Tier 0 ve bloklu profiller için TCKN doğrudan girilebilir.

## Test verisi — limit (mock)

| Senaryo | Gönderen | Tutar (TRY) | Varyant | Beklenen |
|---------|----------|-------------|---------|----------|
| **L18** Tier 0 tavan | Sıla `84590344827` | **10.001** | `person` veya `bankAccount` | Toast `ag_limit_exceeded` |
| **L19** Tier 0 içinde | Sıla | **5.000** | `person` | Limit OK (OCR + form tamamsa Pending) |
| **L20** Temsilci günlük | Hatice `78568632556` | **251.000** | `person` | Toast `ag_limit_exceeded` (agent günlük 250k) |
| **L21** Normal tutar | Hatice | **50.000** | `person` | Limit OK |

Otomatik doğrulama: `apps/agent/src/features/limits/api/mock-limit-demo-thresholds.test.ts`

Mock limit kuralları: `apps/agent/src/features/limits/api/mock-agent-remaining-limit.adapter.ts`

---

## Adımlar

### A — Sorgu ve uyarı bandı (ortak)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/transfers/person` aç | PageHead + gönderen sorgu formu |
| 2 | Boş **Sorgula** | Toast `ag_tr_err_search_required` |
| 3 | TCKN `75683988090` (Caner) → **Sorgula** | Gönderen kartı; `SearchWarningsBanner` → `kyc_low` |
| 4 | TCKN `36338154452` (Yusuf) → **Sorgula** | Uyarı bandı: `blocked` + `risk_high` |
| 5 | TCKN `84590344827` (Sıla) → **Sorgula** | Yalnızca `kyc_low` |

### B — Kendi cüzdanına: KYC L2 kapısı (S13)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 6 | `/transfers/own-wallet` → Caner `75683988090` | Kırmızı banner `ag_tr_kyc_l2_banner`; **Gönder** devre dışı |
| 7 | Aynı ekranda Hatice `78568632556` | Banner yok; form + submit açık |
| 8 | Caner ile submit dene (UI bypass) | Toast `ag_tr_err_kyc_l2` |

### C — Kişiye transfer: düşük KYC + kimlik tarama

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 9 | `/transfers/person` → Caner sorgula | Kimlik tarama paneli görünür (L1 aktif) |
| 10 | Alıcı adı `Mehmet Yılmaz`, tutar 1.000, ref `TR-DEMO-001` | OCR tamamla → submit → `/transactions/{id}?mode=confirm` |

### D — Bloklu gönderen (uyarı, mock submit)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 11 | `/transfers/person` → Yusuf `36338154452` | Uyarı bandı görünür; form doldurulabilir |
| 12 | Formu doldur → **Gönder** | Mock'ta blokaj **submit'i engellemez**; uyarı bilgilendiricidir. Üretimde politika farklı olabilir. |

> Blokajın yalnızca uyarı olduğunu demo sırasında belirtin; asıl doğrulama bandın görünmesidir.

### E — Limit aşımı — Tier 0 (L18)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 13 | `/transfers/person` → Sıla `84590344827` | `kyc_low` uyarısı |
| 14 | Tutar **10.001** TRY, alıcı + ref doldur, kimlik tarama (gerekirse) → **Gönder** | Toast **`ag_limit_exceeded`**; işlem oluşmaz |
| 15 | Tutarı **5.000** TRY'ye düşür → tekrar gönder | Limit geçer (bakiye yeterliyse) → Pending |

### F — Limit aşımı — temsilci günlük (L20)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 16 | `/transfers/person` → Hatice `78568632556` | Uyarı bandı yok |
| 17 | Tutar **251.000** TRY → **Gönder** | Toast **`ag_limit_exceeded`** |
| 18 | Tutar **50.000** TRY | Başarılı submit |

### G — Sanction (özet — detay compliance doc)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 19 | Hatice gönderen; alıcı adı `Sanction Ali` | AdditionalInfoModal → `ag_tr_sanction_review` |
| 20 | Yurt dışı → ülke `IR` | `ag_tr_err_risk_country` |

Bkz. [fixtures/compliance-scenarios.md](../fixtures/compliance-scenarios.md) — S11, S15, D.

---

## Checklist (son durum)

- [ ] Gönderen sorgusu + örnek chip'ler
- [ ] `kyc_low` uyarı bandı (L1 / Tier 0)
- [ ] `blocked` + `risk_high` uyarı bandı
- [ ] Kendi cüzdanı L2 banner + submit kilidi
- [ ] Tier 0 limit reddi (10.001 TRY)
- [ ] Temsilci günlük limit reddi (251.000 TRY)
- [ ] Sanction modal / yurt dışı ülke (opsiyonel)
- [ ] Submit → onay ekranı navigasyonu
- [ ] i18n tr/en/ar (`ag_tr_*`, `ag_cs_warn_*`, `ag_limit_*`)

## Uyumluluk ve limit referansı

Merkezi matris: [fixtures/compliance-scenarios.md](../fixtures/compliance-scenarios.md)

Para çekme tarafı (aynı uyarı/limit kuralları): [withdrawal.md](withdrawal.md) — § I, § J

## Bilinen sorunlar

- Mock'ta `blocked` durumu submit'i engellemez — yalnızca uyarı bandı.
- `AF` / `YE` yurt dışı ülkeleri `review` kodunda; mock adapter yalnızca `blocked` ülkeleri reddeder (S16).

## İlgili kod

- `apps/agent/src/features/agent-transfers/`
- `apps/agent/src/features/customer-search/components/search-warnings-banner.tsx`
- `apps/agent/src/features/limits/api/mock-agent-remaining-limit.adapter.ts`
- `apps/agent/src/features/agent-transfers/domain/kyc-top-up-gate.ts`
- Limit test: `apps/agent/src/features/limits/api/mock-limit-demo-thresholds.test.ts`
