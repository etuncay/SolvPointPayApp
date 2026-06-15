---
screen: dashboard
route: /
app: agent
updated: 2026-05-31
status: ready
---

# Ana Sayfa (Dashboard)

## Amaç

Günlük işlem grafikleri, bekleyen işlem/müşteri panelleri, başarısız erişim banner'ı ve panel → detay navigasyonu.

## Ön koşullar

- [ ] Agent dev server: `http://localhost:5176`
- [ ] Route: `/` (giriş sonrası ana sayfa)
- [ ] Mock: `agentTransactionsStore` seed (bellek içi) + `dashboardService` failed login mock

## Test verisi

| Panel | Seed kaynağı | Beklenen satır |
|-------|--------------|----------------|
| Bekleyen işlemler | `agent-transactions-store.ts` | 3 Pending (90001–90003) |
| Bekleyen müşteriler | `seedPendingCustomers()` | 3 müşteri |
| Günlük grafikler | `listDailyActivity()` | Son 7 gün bar chart |
| Başarısız erişim | `mock-dashboard-adapter` | Mock varsa sarı banner |

| Bekleyen işlem ID | TX No | Senaryo |
|-------------------|-------|---------|
| 90001 | TX-AG-90001 | Para çekme — alıcı temsilci |
| 90002 | TX-AG-90002 | Banka transferi — gönderen temsilci |
| 90003 | TX-AG-90003 | Yurt dışı — kritik risk (beyan) |

| Bekleyen müşteri | TCKN | Durum |
|------------------|------|-------|
| Selim Korkmaz | 54820017634 | pending |
| Derya Aslan | 21908475512 | kyc_review |
| Mert Çelik | 60713298840 | on_hold |

## Adımlar

| # | Aksiyon | Beklenen |
|---|---------|----------|
| 1 | `/` aç | PageHead + alt başlık |
| 2 | Başarısız erişim banner | Varsa uyarı metni + “Ayarlar” linki (failed sekmesi) |
| 3 | Günlük grafikler | İşlem sayısı + tutar; yeşil/kırmızı legend |
| 4 | Bekleyen işlemler tablosu | 3 satır; tıklanınca Pending → `/transactions/{id}/approve` |
| 5 | OnHold satır (90004) | Dashboard'da görünmez (yalnızca Pending listelenir) |
| 6 | Bekleyen müşteriler | 3 satır; tıklanınca `/customers?idNo={TCKN}` (ör. Selim → `54820017634`) |
| 7 | İşlem onaylandıktan sonra | Bekleyen işlemler paneli satır sayısı azalır veya panel kaybolur |

## Checklist (son durum)

- [ ] Grafikler render
- [ ] Bekleyen işlem → onay ekranı
- [ ] Bekleyen müşteri → müşteri arama (`/customers?idNo=`)
- [ ] Banner → ayarlar drawer

## Bilinen sorunlar

- (güncel oturumda kaydedin)

## İlgili kod

- `apps/agent/src/features/dashboard/`
- İşlem seed: `apps/agent/src/features/transaction-confirmation/api/agent-transactions-store.ts`
