---
screen: customer-search
route: /customers
app: agent
updated: 2026-05-31
status: ready
---

# Müşteri Arama & Görüntüleme

## Amaç

Temsilcinin Müşteri No veya Kimlik No ile tek müşteri sorgulaması; profil/hesap/bekleyen işlem panelleri, uyarı bandı, belge yükleme-görüntüleme ve ana sayfadan deep link navigasyonunun doğrulanması.

## Ön koşullar

- [ ] Agent dev server: `http://localhost:5176`
- [ ] Route: `/customers` (sidebar → Müşteriler)
- [ ] Mock: `CUSTOMERS`, `WALLETS`, `TRANSACTIONS` — bellek içi (`apps/agent/src/mocks/`)

## Test verisi

| Senaryo | Müşteri No | TCKN | Fixture / not |
|---------|------------|------|---------------|
| Normal + düşük KYC uyarısı | `99901` veya `MUS-00099901` | `75683988090` | [demo-caner-avci](../fixtures/customers/demo-caner-avci.md) — L1 KYC, aktif |
| Süresi dolmuş belge uyarısı | `99902` veya `MUS-00099902` | `78568632556` | Hatice Acar — mock belge `validTo` geçmiş |
| Blokaj + yüksek risk uyarıları | `99910` veya `MUS-00099910` | `36338154452` | [demo-yusuf-avci-blocked](../fixtures/customers/demo-yusuf-avci-blocked.md) |
| Bulunamadı | `00000001` | `11111111111` | — |
| Ana sayfa deep link | — | `54820017634` | Bekleyen müşteri: Selim Korkmaz |

### Beklenen uyarı kodları (mock)

| Müşteri | Olası uyarılar |
|---------|----------------|
| Caner Avcı (99901) | `kyc_low` (L1) |
| Hatice Acar (99902) | `doc_expired` |
| Yusuf Avcı (99910) | `blocked`, `risk_high` |

### Hesap bilgileri (Caner — MS-9901-01)

| Alan | Beklenen |
|------|----------|
| Cüzdan No | `MS-9901-01` |
| Para birimi | TRY |
| Kullanılabilir bakiye | ~209.532 (mock) |
| Limitler (L1) | Çekim 10.000 / Transfer 25.000 / Yurt dışı 5.000 |

### Bekleyen işlemler paneli

- Yalnızca sonlanmamış işlem varsa görünür (`Pending`, `OnHold`, `Sent`, `Retrying`, …).
- Caner Avcı (99901) için demo cüzdanına üretilen ~24 işlemden bir kısmı bekleyen durumda olabilir (seed `mulberry32(42)` — deterministik).
- Panel boşsa **render edilmemeli** (§8, §20).

### Ana sayfa — bekleyen müşteriler

| Ad | TCKN | Durum |
|----|------|-------|
| Selim Korkmaz | 54820017634 | pending |
| Derya Aslan | 21908475512 | kyc_review |
| Mert Çelik | 60713298840 | on_hold |

Satır tıklama → `/customers?idNo={TCKN}`

## Adımlar

### A — Sorgu ve paneller

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/customers` aç | PageHead: Müşteriler + `ag_cs_subtitle` alt başlık |
| 2 | DynamicForm — Müşteri No boş, Kimlik No boş, **Ara** | Toast: `ag_cs_search_required` |
| 3 | Kimlik No: `75683988090` → **Ara** | Caner Avcı profili; URL `?customerNo=MUS-00099901&idNo=75683988090` |
| 4 | Sayfayı yenile (deep link) | Aynı müşteri otomatik yüklenir |
| 5 | Müşteri No: `MUS-00099901` → **Ara** | Aynı sonuç (TCKN alanı opsiyonel) |
| 6 | Müşteri No: `99901` (sayısal) → **Ara** | Aynı sonuç |
| 7 | Müşteri No: `00000001` → **Ara** | “Bulunamadı” mesajı (`ag_cs_not_found`); paneller gizli |
| 8 | Caner sonucu — uyarı bandı | Pembe fon / bordo metin; en az `kyc_low` uyarısı |
| 9 | Müşteri Bilgileri paneli | Tek satırlık DynamicTable: ad, TCKN, KYC, risk, iletişim, şehir, üyelik, kampanya, durum |
| 10 | Hesap Bilgileri paneli | `MS-9901-01` satırı; bakiye para birimi formatında |
| 11 | Bekleyen İşlemler paneli | Varsa satırlar; yoksa panel **hiç görünmez** |
| 12 | Bekleyen satıra tıkla | `/transactions/{transactionId}` detay sayfası |

### B — Uyarı senaryoları

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 13 | TCKN `78568632556` (Hatice) ara | `doc_expired` uyarısı; kampanya alanı dolu |
| 14 | TCKN `36338154452` (Yusuf) ara | `blocked` + `risk_high` uyarıları; durum badge kırmızı ton |

### C — Belge işlemleri

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 15 | Sorgu yokken **Belge Yükle / Belge Görme** | Butonlar disabled |
| 16 | Caner sonucu → **Belge Görme** | Modal: kimlik + gelir belgesi listesi |
| 17 | Belge Görme modalında | **İndirme butonu yok** (§8, §19) |
| 18 | Geçerlilik sütunu | `Süresiz` / `Süresi Dolmuş` / `Yakında Dolacak` / aktif etiketleri |
| 19 | Hatice → **Belge Görme** | Kimlik belgesi `Süresi Dolmuş` etiketi |
| 20 | **Belge Yükle** → kategori, tür, dosya seç → kaydet | Toast: `ag_cs_upload_ok`; liste güncellenir |

### D — Navigasyon

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 21 | Caner sonucu → **Düzenle** | `/customers/99901` (bireysel kayıt edit route) |
| 22 | Ana sayfa `/` → Bekleyen Müşteriler → Selim satırı | `/customers?idNo=54820017634`; müşteri otomatik aranır |

### E — i18n (opsiyonel)

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 23 | Dil tr → en → ar | Panel başlıkları, kolonlar, uyarı metinleri `ag_cs_*` ile güncellenir |

## Checklist (son durum)

- [ ] Müşteri No ile arama (`99901`, `MUS-00099901`)
- [ ] Kimlik No ile arama (`75683988090`)
- [ ] Boş sorgu validasyonu
- [ ] Bulunamadı mesajı
- [ ] URL deep link (`?customerNo=` / `?idNo=`)
- [ ] Uyarı bandı üstte belirgin
- [ ] Müşteri + Hesap panelleri
- [ ] Bekleyen işlem paneli — boşken gizli
- [ ] Belge Görme — listelenir, indirilemez
- [ ] Geçerlilik etiketleri doğru
- [ ] Belge Yükle
- [ ] Ana sayfa → `/customers?idNo=`
- [ ] i18n (tr/en/ar)

## Uyumluluk

Tüm sanction / blocked / KYC senaryoları: [fixtures/compliance-scenarios.md](../fixtures/compliance-scenarios.md)

## Bilinen sorunlar

- (güncel oturumda kaydedin)

## İlgili kod

- `apps/agent/src/features/customer-search/`
- Plan: `.cursor/plans/agent/agent_müşteri_arama_2995e015.plan.md`
- Mock: `apps/agent/src/mocks/data.ts`, `wallets.ts`, `transactions.ts`
- Ana sayfa deep link: `apps/agent/src/features/dashboard/panels/pending-customers-panel.tsx`
