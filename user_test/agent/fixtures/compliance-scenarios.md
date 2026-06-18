---
app: agent
topic: compliance
updated: 2026-06-18
status: ready
---

# Uyumluluk demo senaryoları — Sanction / Blocked / KYC

Agent mock ortamında **yaptırım (sanction)**, **blokaj**, **düşük KYC** ve **risk uyarılarını** tekrarlanabilir şekilde tetiklemek için merkezi referans.

**Seed:** `apps/data/src/db/seed-playground-mock-data.ts` → `CUSTOMERS` (`apps/agent/src/mocks/data.ts`)

## Mock kuralları (özet)

| Mekanizma | Tetikleyici | Kod |
|-----------|-------------|-----|
| Sanction ekranı | İsimde `sanction` (büyük/küçük harf duyarsız) | `features/agent-transactions/domain/sanction.ts` |
| Müşteri uyarı bandı | `status=blocked` → blocked; `kyc` L1 veya Tier 0 → kyc_low; `riskSeg` high/critical → risk_high | `customer-lookup.ts` → `buildCustomerWarnings()` |
| Tüzel belge eksik | `type=corporate` ve `kyc !== Approved` | `corporateDocumentMissing()` |
| Çekim sanction | `screenName` → OnHold + toast `ag_wd_sanction_hit` | `mock-withdrawal-adapter.ts` |
| Transfer gönderen sanction | Gönderen `screenName` → OnHold + `ag_tr_sanction_hit` | `mock-transfer-adapter.ts` |
| Transfer alıcı sanction | Alıcı adı → `receiverSanctionHit` → **AdditionalInfoModal**; tekrar hit → `ag_tr_sanction_review` | `mock-transfer-adapter.ts`, `use-transfer-flow.ts` |
| Kendi cüzdanına yatırma (L2 kapısı) | Bireysel L2/L3 veya tüzel `Approved` + aktif değilse banner + submit engeli | `kyc-top-up-gate.ts` |
| Yurt dışı riskli ülke | `IR`, `KP`, `SY` → reddedilir (`ag_tr_err_risk_country`); `AF`, `YE` kodda `review` (mock adapter yalnızca blocked reddeder) | `risk-country.ts` |

## Tüzel yetkili kişiler (tüm tüzel müşterilerde aynı)

| TCKN | Ad | Sanction |
|------|-----|----------|
| `10000000146` | Ahmet Yetkili | Hayır |
| `20000000147` | **Sanction Test Kişi** | **Evet** (isimde `sanction`) |

Fixture: [demo-sanction-test-kisi](customers/demo-sanction-test-kisi.md)

---

## Senaryo matrisi

| ID | Akış | Müşteri / girdi | Beklenen |
|----|------|-----------------|----------|
| **S1** | Müşteri arama | `99901` / TCKN `75683988090` (Caner Avcı) | Uyarı: `kyc_low` (L1); işlem yapılabilir |
| **S2** | Müşteri arama | `99913` / TCKN `84590344827` (Sıla Yıldız) | Uyarı: `kyc_low` (Tier 0) |
| **S3** | Müşteri arama | `99910` / TCKN `36338154452` (Yusuf Avcı) | Uyarı: `blocked` + `risk_high` |
| **S4** | Müşteri arama | `99907` / VKN `6619590221` (İzmir Limanı) | Uyarı: `risk_high` (critical segment); aktif |
| **S5** | Müşteri arama | `99902` / TCKN `78568632556` (Hatice Acar) | Ek: `doc_expired` (müşteri arama adapter'ı) |
| **S6** | Para çekme | Bireysel L1 — Caner `75683988090` | Uyarı bandı `kyc_low`; kimlik tarama gerekir; sanction yok |
| **S7** | Para çekme | Tüzel onaylı — VKN `1792956117` + yetkili `10000000146` | Normal submit → Pending |
| **S8** | Para çekme | Tüzel — VKN `1792956117` + yetkili **`20000000147`** | **OnHold**; toast `ag_wd_sanction_hit`; onay ekranında bekler |
| **S9** | Para çekme | Tüzel belge eksik — VKN `3131516608` (Karadeniz, KYC Pending) | Belge eksik uyarısı; yetkili seçimi sonrası akış |
| **S10** | Para çekme | Bloklu müşteri — Yusuf `36338154452` | Uyarı `blocked`; işlem politikasına göre gözden geçir |
| **S11** | Transfer → kişi / IBAN | Alıcı adı: `Sanction Test Receiver` | AdditionalInfoModal; bilgi girilince hâlâ hit → `ag_tr_sanction_review` |
| **S12** | Transfer → kişi / IBAN | Alıcı adı: `Mehmet Yılmaz` + ek bilgi sonrası temiz | Pending işlem |
| **S13** | Transfer → kendi cüzdanı | Gönderen Caner (L1) `75683988090` | Banner `ag_tr_kyc_l2_banner`; submit kapalı |
| **S14** | Transfer → kendi cüzdanı | Gönderen Hatice (L2) `78568632556` | Banner yok; submit açık |
| **S15** | Transfer → yurt dışı | Ülke `IR` / `KP` / `SY` | Hata `ag_tr_err_risk_country` |
| **S16** | Transfer → yurt dışı | Ülke `AF` veya `YE` | Mock'ta işlem devam eder (`review` henüz engellemiyor) |
| **S17** | Onay | S8 sonrası `/transactions/:id?mode=confirm` | Durum OnHold; temsilci onay akışı — bkz. [transaction-confirmation](../processes/transaction-confirmation.md) |
| **S18** | Transfer / çekim | Sıla `84590344827` — **10.001** TRY | Toast `ag_limit_exceeded` (Tier 0 tavan 10k) |
| **S19** | Para çekme | Caner persistent — **186.000** TRY | `ag_limit_exceeded` (L1 aylık 185k) |
| **S20** | Transfer | Hatice `78568632556` — **251.000** TRY | `ag_limit_exceeded` (temsilci günlük 250k) |
| **S21** | Transfer / çekim | Hatice — **50.000** TRY | Limit içinde — karşı örnek |

---

## Adım adım — öne çıkan senaryolar

### A — Sanction Test Kişi (çekim → OnHold)

1. `/withdrawal` → VKN `1792956117` (Anadolu Gıda) sorgula.
2. **Yetkili Kişi Kimlik No:** `20000000147`.
3. Formu doldur (tutar, cüzdan, kimlik tarama, referans) → **Devam**.
4. Toast: `ag_wd_sanction_hit`; yönlendirme `/transactions/{id}?mode=confirm`.
5. İşlem durumu **OnHold**; onay senaryosu için seed `90004` vb. — [transaction-confirmation](../processes/transaction-confirmation.md).

Detay: [withdrawal.md § F](../processes/withdrawal.md)

### B — Bloklu müşteri uyarı bandı

1. `/customers` → TCKN `36338154452` (Yusuf Avcı, `99910`).
2. Pembe uyarı bandında `blocked` ve `risk_high` mesajları.
3. İsteğe bağlı: aynı TCKN ile `/withdrawal` sorgusu → aynı uyarılar.

Fixture: [demo-yusuf-avci-blocked](customers/demo-yusuf-avci-blocked.md)

### C — Düşük KYC (L1 / Tier 0)

| Müşteri | No | KYC | Route | Beklenen |
|---------|-----|-----|-------|----------|
| Caner Avcı | 99901 | L1 | `/customers`, `/withdrawal` | `kyc_low`; çekimde kimlik tarama |
| Sıla Yıldız | 99913 | Tier 0 | `/customers`, `/withdrawal`, `/transfers/person` | `kyc_low`; 10k limit (S18) |
| Caner Avcı | 99901 | L1 | `/transfers/own-wallet` | `ag_tr_kyc_l2_banner`; gönder engelli |

### D — Transfer alıcı sanction (modal)

1. `/transfers/person` (veya bankAccount / abroad) → gönderen: Hatice `78568632556`.
2. Alıcı adı: `Sanction Ali` (veya herhangi bir `…sanction…` içeren isim).
3. Submit → **Ek bilgi** modalı açılır (`receiverSanctionHit`).
4. Modalı onayla — isim hâlâ sanction içeriyorsa toast `ag_tr_sanction_review`, işlem oluşmaz.
5. Alıcı adını temiz isimle değiştirip tekrarla → Pending.

### E — Tüzel belge eksik

1. `/withdrawal` → VKN `3131516608` (Karadeniz Denizcilik, KYC Pending).
2. `documentMissing` uyarısı; yetkili `10000000146` ile devam edilebilir (sanction yok).

### F — Limit aşımı (demo tutarları)

1. **Tier 0:** `/transfers/person` → Sıla `84590344827` → tutar **10.001** TRY → `ag_limit_exceeded`.
2. **L1 aylık:** `/withdrawal` → Caner → persistent cüzdan → **186.000** TRY → `ag_limit_exceeded`.
3. **Temsilci günlük:** `/transfers/person` → Hatice `78568632556` → **251.000** TRY → `ag_limit_exceeded`.

Adım adım: [agent-transfers.md § E–F](../processes/agent-transfers.md), [withdrawal.md § J](../processes/withdrawal.md)

Otomatik test: `apps/agent/src/features/limits/api/mock-limit-demo-thresholds.test.ts`

---

## Demo müşteri hızlı tablo

| No | Ad | Kimlik | KYC | Durum | riskSeg | Uyumluluk notu |
|----|-----|--------|-----|-------|---------|----------------|
| 99901 | Caner Avcı | 75683988090 | L1 | active | med | Düşük KYC |
| 99902 | Hatice Acar | 78568632556 | L2 | active | low | Süresi dolmuş belge (arama) |
| 99903 | Anadolu Gıda | 1792956117 | Approved | active | med | Tüzel temiz + sanction yetkili testi |
| 99905 | Ege İnşaat | 5937114410 | Rejected | **blocked** | high | Blokaj |
| 99906 | Karadeniz Denizcilik | 3131516608 | Pending | active | high | Belge eksik |
| 99907 | İzmir Limanı | 6619590221 | Rejected | active | **critical** | Kritik risk uyarısı |
| 99910 | Yusuf Avcı | 36338154452 | L2 | **blocked** | high | Blokaj + risk |
| 99913 | Sıla Yıldız | 84590344827 | Tier 0 | active | low | En düşük KYC |

---

## i18n anahtarları

| Anahtar | Bağlam |
|---------|--------|
| `ag_cs_warn_blocked` | Müşteri arama / çekim uyarı bandı |
| `ag_cs_warn_kyc` | L1 / Tier 0 |
| `ag_cs_warn_risk` | high / critical risk segment |
| `ag_wd_sanction_hit` | Çekim OnHold |
| `ag_tr_sanction_hit` | Transfer gönderen OnHold |
| `ag_tr_sanction_review` | Alıcı sanction — modal sonrası red |
| `ag_tr_kyc_l2_banner` | Kendi cüzdanı L2 kapısı |
| `ag_tr_err_kyc_l2` | Submit sırasında KYC engeli |
| `ag_tr_err_risk_country` | Yurt dışı bloklu ülke |
| `ag_limit_exceeded` | Müşteri veya temsilci limiti aşıldı |
| `ag_limit_closed` | İşlem türü kapalı |
| `ag_limit_unavailable` | Limit servisi yanıt vermedi |

---

## İlgili süreç dokümanları

| Konu | Dosya |
|------|-------|
| Para çekme (F — tüzel/sanction; I/J — uyarı/limit) | [processes/withdrawal.md](../processes/withdrawal.md) |
| Para transferi (uyarı + limit) | [processes/agent-transfers.md](../processes/agent-transfers.md) |
| Müşteri arama uyarıları | [processes/customer-search.md](../processes/customer-search.md) |
| Onay / OnHold | [processes/transaction-confirmation.md](../processes/transaction-confirmation.md) |

## İlgili kod

- `apps/agent/src/features/agent-transactions/domain/sanction.ts`
- `apps/agent/src/features/agent-transactions/domain/customer-lookup.ts`
- `apps/agent/src/features/withdrawal/api/mock-withdrawal-adapter.ts`
- `apps/agent/src/features/agent-transfers/api/mock-transfer-adapter.ts`
- `apps/agent/src/features/agent-transfers/domain/kyc-top-up-gate.ts`
- `apps/agent/src/features/agent-transfers/domain/risk-country.ts`
