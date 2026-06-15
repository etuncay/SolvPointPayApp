---
app: management
code: apps/management
dev_url: http://localhost:5173
dev_command: pnpm --filter @epay/management dev
updated: 2026-06-01
---

# Management — ekran testleri

Backoffice uygulaması (`@epay/management`) manuel test süreçleri.

## Süreçler

### Dashboard ve Müşteriler (1, 2.x)

İndeks: [processes/dashboard-ve-musteriler-modulu.md](processes/dashboard-ve-musteriler-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 1 Dashboard | [01-dashboard.md](processes/01-dashboard.md) | `/` |
| 2 Liste | [02-musteriler-liste.md](processes/02-musteriler-liste.md) | `/customers` |
| 2.1 Bireysel | [02.1-bireysel-musteri.md](processes/02.1-bireysel-musteri.md) | `/customers/.../individual` |
| 2.2 Tüzel | [02.2-tuzel-musteri.md](processes/02.2-tuzel-musteri.md) | `/customers/.../corporate` |
| 2.3 Notlar | [02.3-musteri-notlari.md](processes/02.3-musteri-notlari.md) | `/customers/notes` |
| 2.4 Belge | [02.4-belge-inceleme.md](processes/02.4-belge-inceleme.md) | `/customers/documents/review` |
| 2.5 Ücret | [02.5-musteri-ucretleri.md](processes/02.5-musteri-ucretleri.md) | `/customers/fees` |
| 2.6 Kampanya | [02.6-kampanya-yonetimi.md](processes/02.6-kampanya-yonetimi.md) | `/customers/campaigns` |

### Temsilciler (3.x)

İndeks: [processes/temsilciler-modulu.md](processes/temsilciler-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 3.0 Liste | [03-temsilciler-liste.md](processes/03-temsilciler-liste.md) | `/agents` |
| 3.1 Temsilci form | [03.1-yeni-temsilci.md](processes/03.1-yeni-temsilci.md) | `/agents/new`, `/agents/:agentId` |
| 3.2 Yetkili kişi | [03.2-yeni-yetkili-kisi.md](processes/03.2-yeni-yetkili-kisi.md) | `/agents/authorized-persons/...` |
| 3.3 Grup yönetimi | [03.3-temsilci-grup-yonetimi.md](processes/03.3-temsilci-grup-yonetimi.md) | `/agents/groups` |
| 3.3.1 Grup atama | [03.3.1-temsilci-grup-iliskisi.md](processes/03.3.1-temsilci-grup-iliskisi.md) | `/agents/groups/:groupCode/agents` |
| 3.4 Ücret | [03.4-temsilci-ucretleri.md](processes/03.4-temsilci-ucretleri.md) | `/agents/fees` |

### Doküman Yönetim Sistemi (9.x)

İndeks: [processes/dokuman-yonetim-sistemi-modulu.md](processes/dokuman-yonetim-sistemi-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 9 Liste | [09-dokuman-yonetim-sistemi.md](processes/09-dokuman-yonetim-sistemi.md) | `/documents` |
| 9.1 Yeni | [09.1-yeni-dokuman-ekle.md](processes/09.1-yeni-dokuman-ekle.md) | `/documents/new` |
| 9.2 Detay | [09.2-dokuman-detay.md](processes/09.2-dokuman-detay.md) | `/documents/:documentId` |
| 9.3 Tipler | [09.3-dokuman-tipleri.md](processes/09.3-dokuman-tipleri.md) | `/documents/types` |
| 9.4 Tip form | [09.4-yeni-dokuman-tipi-tanimlama.md](processes/09.4-yeni-dokuman-tipi-tanimlama.md) | `/documents/types/new`, `.../edit` |

### Destek Merkezi (10.x)

| Modül | Süreç | Route |
|-------|-------|-------|
| 10 Liste | [10-destek-merkezi.md](processes/10-destek-merkezi.md) | `/support/cases` |
| 10.1 Yeni talep | [10.1-yeni-talep-giris.md](processes/10.1-yeni-talep-giris.md) | `/support/cases/new`, `/support/cases/:caseId` |
| 10.2 Raporlama | [10.2-raporlama.md](processes/10.2-raporlama.md) | `/support/reports` |

### Raporlar (11)

| Modül | Süreç | Route |
|-------|-------|-------|
| 11 Katalog | [11-raporlar.md](processes/11-raporlar.md) | `/reports`, `/reports/:code` |

### Operasyonel Süreçler (8.x)

İndeks: [processes/operasyonel-surecler-modulu.md](processes/operasyonel-surecler-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 8 Menü | [08-operasyonel-surec-yonetimi.md](processes/08-operasyonel-surec-yonetimi.md) | `/ops` |
| 8.1 Onay | [08.1-onay-havuzu.md](processes/08.1-onay-havuzu.md) | `/approvals` |
| 8.2 KYC | [08.2-kyc-yonetimi.md](processes/08.2-kyc-yonetimi.md) | `/ops/kyc` |
| 8.3 Muhasebe | [08.3-muhasebe-entegrasyon.md](processes/08.3-muhasebe-entegrasyon.md) | `/ops/accounting` |
| 8.4 BTRANS | [08.4-btrans-raporlari.md](processes/08.4-btrans-raporlari.md) | `/ops/btrans` |
| 8.5 Mutabakat | [08.5-finansal-mutabakat.md](processes/08.5-finansal-mutabakat.md) | `/ops/reconciliation` |
| 8.6 FX | [08.6-kur-fx-yonetimi.md](processes/08.6-kur-fx-yonetimi.md) | `/ops/fx` |

### Risk ve Uyum (7.x)

İndeks: [processes/risk-ve-uyum-modulu.md](processes/risk-ve-uyum-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 7 Dashboard | [07-risk-ve-uyum.md](processes/07-risk-ve-uyum.md) | `/risk` |
| 7.1 Skor tanım | [07.1-risk-skor-tanimlama.md](processes/07.1-risk-skor-tanimlama.md) | `/risk/score-definition` |
| 7.2 Limitler | [07.2-risk-bazli-limitler.md](processes/07.2-risk-bazli-limitler.md) | `/risk/limits` |
| 7.3 Skorlar | [07.3-risk-skorlari.md](processes/07.3-risk-skorlari.md) | `/risk/scores` |
| 7.4 Kurallar | [07.4-dolandiricilik-kurallari.md](processes/07.4-dolandiricilik-kurallari.md) | `/risk/fraud-rules` |
| 7.4.1 Kural detay | [07.4.1-kural-tanimlama-detay.md](processes/07.4.1-kural-tanimlama-detay.md) | `/risk/fraud-rules/:ruleId` |
| 7.5 Vakalar | [07.5-vaka-inceleme.md](processes/07.5-vaka-inceleme.md) | `/risk/cases` |
| 7.5.1 Bildir | [07.5.1-dolandiricilik-bildir.md](processes/07.5.1-dolandiricilik-bildir.md) | Modal |
| 7.5.2 Vaka detay | [07.5.2-vaka-detaylari.md](processes/07.5.2-vaka-detaylari.md) | `/risk/cases/:caseId` |
| 7.6 Yönetim | [07.6-yonetim.md](processes/07.6-yonetim.md) | `/risk/admin` |

### Bankalar (6.x)

İndeks: [processes/bankalar-modulu.md](processes/bankalar-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 6 Menü | [06-bankalar-menu.md](processes/06-bankalar-menu.md) | `/banks` |
| 6.1 Entegre | [06.1-entegre-bankalar.md](processes/06.1-entegre-bankalar.md) | `/banks/integrated` |
| 6.2 Hesaplar | [06.2-banka-hesap-bilgileri.md](processes/06.2-banka-hesap-bilgileri.md) | `/banks/accounts` |
| 6.3 Hareketler | [06.3-banka-hesap-hareketleri.md](processes/06.3-banka-hesap-hareketleri.md) | `/banks/movements` |
| 6.4 Mutabakat | [06.4-banka-mutabakati.md](processes/06.4-banka-mutabakati.md) | `/banks/reconciliation` |

### Para Transferleri (5.x)

İndeks: [processes/para-transferleri-modulu.md](processes/para-transferleri-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 5 Liste | [05-para-transferleri.md](processes/05-para-transferleri.md) | `/transfers` |
| 5.1 Detay | [05.1-islem-detay.md](processes/05.1-islem-detay.md) | `/transfers/:transactionId` |
| 5.2 Manuel | [05.2-iade-iptal-duzeltme.md](processes/05.2-iade-iptal-duzeltme.md) | `/transfers/manual` |

### Dijital Cüzdanlar (4.x)

İndeks: [processes/cuzdanlar-modulu.md](processes/cuzdanlar-modulu.md)

| Modül | Süreç | Route |
|-------|-------|-------|
| 4 Liste | [04-dijital-cuzdanlar.md](processes/04-dijital-cuzdanlar.md) | `/wallets` |
| 4.1 Detay | [04.1-cuzdan-detay.md](processes/04.1-cuzdan-detay.md) | `/wallets/:walletId` |
| 4.2 Aktiviteler | [04.2-cuzdan-aktiviteleri.md](processes/04.2-cuzdan-aktiviteleri.md) | `/wallets/:walletId/activities` |

Yeni süreç eklerken:

- Dosya: `processes/{screen-slug}.md`
- Frontmatter `app: management` zorunlu
- Kod kökü: `apps/management/src/features/`

### Diğer önerilen süreçler

| Ekran | Route (örnek) | Feature |
|-------|---------------|---------|
| Onay havuzu | `/approvals` | `features/approval-pool` |
| KYC | `/ops/kyc` | `features/kyc-management` |

## Fixture'lar

| Fixture | Açıklama |
|---------|----------|
| [fixtures/dashboard-ve-musteriler.md](fixtures/dashboard-ve-musteriler.md) | Dashboard + Müşteriler 2.x |
| [fixtures/temsilciler.md](fixtures/temsilciler.md) | Temsilciler 3.0–3.4 |
| [fixtures/cuzdanlar.md](fixtures/cuzdanlar.md) | Dijital Cüzdanlar 4, 4.1, 4.2 |
| [fixtures/para-transferleri.md](fixtures/para-transferleri.md) | Para Transferleri 5, 5.1, 5.2 |
| [fixtures/bankalar.md](fixtures/bankalar.md) | Bankalar 6, 6.1–6.4 |
| [fixtures/risk-ve-uyum.md](fixtures/risk-ve-uyum.md) | Risk ve Uyum 7, 7.1–7.6 |
| [fixtures/operasyonel-surecler.md](fixtures/operasyonel-surecler.md) | Operasyonel Süreçler 8, 8.1–8.6 |
| [fixtures/dokuman-yonetim-sistemi.md](fixtures/dokuman-yonetim-sistemi.md) | Doküman Yönetim Sistemi 9, 9.1–9.4 |

## Run kayıtları

`runs/YYYY-MM-DD-{screen-slug}.md`

Son run: [2026-06-02-raporlar.md](runs/2026-06-02-raporlar.md)

## Şablon

[`../_templates/management/process.template.md`](../_templates/management/process.template.md)
