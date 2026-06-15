---
app: management
screen: dijital-cuzdanlar
route: /wallets
updated: 2026-06-02
status: ready
plan: 4.dijital_cuzdanlar.plan.md
---

# Dijital Cüzdanlar (4)

## Amaç

Rol bazlı cüzdan listesi, KPI chip’leri, filtre/export, satır → 4.1 navigasyonu, `recordStatus=0` gizleme.

## Ön koşullar

- [x] Management dev (`pnpm --filter @epay/management dev`) — testte `http://localhost:5176`
- [x] Oturum: `compliance@epay.demo` / `Epay.1234`
- [x] Fixture: [`fixtures/cuzdanlar.md`](../fixtures/cuzdanlar.md)

## Test verisi

| ID | Hesap No | Kategori |
|----|----------|----------|
| `11` | `MS-9901-01` | customer |
| `1` | `SYS-000002` (ör.) | system |

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | Rol `ops`, `/wallets` | Müşteri + temsilci; **Sistem chip yok** (~90 kayıt) | Geçti |
| 2 | Rol `finance`, `/wallets` | Yalnızca sistem (**10** kayıt); müşteri yok | Geçti |
| 3 | Rol `compliance` | Tüm kategoriler (Müşteri 66, Temsilci 24, Sistem 10) | Geçti |
| 4 | Sistem satırı (`finance`) | Ad/telefon/kimlik `—` | Kod + rol testi |
| 5 | Tam bloke cüzdan | `available = 0` | Vitest `mock-wallet-detail` |
| 6 | Satıra tıkla / `/wallets/11` | 4.1 detay açılır | Geçti |
| 7 | Dışa Aktar | CSV indirilir | UI butonu mevcut |
| 8 | `recordStatus=0` | Listede görünmez | Vitest adapter |

## Checklist

- [x] §20 #1–3, #6 (manuel)
- [x] §20 #5, #8 (vitest)
- [x] Route placeholder kaldırıldı → `WalletsPage`

## Ekran Bazlı Dokümantasyon

### 4 Dijital Cüzdanlar Listesi (`/wallets`)
- Amaç: Cüzdan kayıtlarını kategori ve role göre listelemek.
- Görsel doğrulama: rol bazlı chip/sayaç görünürlüğü, satır aksiyonları ve export butonu.
- Temel aksiyonlar: arama/filtre, satırdan detay geçişi, CSV export.
- Doğrulama notu: liste ekranı `DynamicTable` + table-config binder standardındadır.

### 4.1 Cüzdan Detay (`/wallets/:walletId`)
- Amaç: Cüzdanın finansal ve operasyonel detaylarını panel bazında göstermek.
- Görsel doğrulama: genel bilgiler, limit geçmişi, not/bloke modalları doğru açılır.
- Temel aksiyonlar: bloke et/kaldır, not ekle, limit güncelle.
- Doğrulama notu: detay aksiyonları permission guard ve domain validasyonları ile korunur.

### 4.2 Cüzdan Aktiviteleri (`/wallets/:walletId/activities`)
- Amaç: Cüzdana ait işlem hareketlerini zaman ekseninde izlemek.
- Görsel doğrulama: hareket listesi, yön/tip bilgileri, tarih/saat kolonları görünür.
- Temel aksiyonlar: filtreleme, detay inceleme, export.
- Doğrulama notu: aktiviteler ekranı config tabanlı tablo desenini kullanır.

## Bilinen sorunlar

- Dev portu 5173 doluysa Vite otomatik `5174+` kullanır; URL’yi terminalden doğrulayın.

## İlgili kod

- `apps/management/src/features/wallets/wallets-page.tsx`
- `apps/management/src/features/wallets/api/mock-wallets-adapter.ts`
- Plan: `.cursor/plans/management/4.dijital_cuzdanlar.plan.md`
