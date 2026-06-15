---
app: management
screen: reports-catalog
route: /reports, /reports/:code
updated: 2026-06-02
status: ready
plan: 11.raporlar.plan.md
---

# Raporlar (11)

## Amaç

14 raporluk katalog ekranını, parametreli üretim akışını, CSV export'u, arşiv listesini ve rol bazlı kategori görünürlüğünü doğrulamak.

## Ön koşullar

- [x] Dev sunucu çalışıyor (`http://localhost:5175`)
- [x] Demo oturum aktif (`management`, `finance`, `compliance`, `ops`)

## Adımlar (§20)

| # | Aksiyon | Beklenen | Sonuç |
|---|---------|----------|-------|
| 1 | `/reports` aç (`management`) | 14 rapor, 3 kategori (Operasyonel/Finansal 6, TCMB/EVAS 5, MASAK 3), arama çubuğu | Geçti |
| 2 | Finansal İşlemler → Üret | Param drawer açılır (tarih aralığı + para birimi), Üret/Vazgeç butonları | Geçti |
| 3 | Tarih aralığı seç, Üret tıkla | Preview grid: kolon başlıkları, satır sayısı, correlationId; CSV butonu aktif, PDF disabled | Geçti |
| 4 | CSV butonu tıkla | CSV dosyası indirilir | Geçti |
| 5 | Son üretimler paneli | Arşiv tablosu: rapor adı, tarih, satır sayısı, correlationId, re-export CSV ikonu | Geçti |
| 6 | `finance` ile `/reports` | 11 rapor, yalnızca Operasyonel/Finansal (6) + TCMB/EVAS (5); MASAK kategorisi yok | Geçti |
| 7 | `compliance` ile `/reports` | 9 rapor: Operasyonel/Finansal (1 — yalnızca Risk ve Uyum Özeti), TCMB/EVAS (5), MASAK (3) | Geçti |
| 8 | `ops` ile `/reports` | Ana sayfaya yönlendirilir (erişim engeli) | Geçti |

## Checklist

- [x] Route gerçek sayfaya bağlı (placeholder kaldırıldı)
- [x] 14 rapor kodu kayıtlı (generator-registry testi)
- [x] Param drawer: tarih aralığı ve günlük rapor modları çalışıyor
- [x] Preview grid + CSV export çalışıyor
- [x] Arşiv listesi üretim sonrası güncelleniyor
- [x] Rol bazlı kategori filtresi spec'e uygun
- [x] ops erişim engeli doğru çalışıyor

## Ekran Bazlı Dokümantasyon

### 11 Rapor Kataloğu (`/reports`)

- Amaç: Tüm rapor tanımlarını kategori bazlı listelemek ve üretim akışına giriş noktası sağlamak.
- Görsel doğrulama: 14 rapor kart/listesi, kategori ayrımı ve arama bileşeni görünür.
- Temel aksiyonlar: rapor seçimi, kategoriye göre tarama, role göre görünür rapor setinin doğrulanması.
- Doğrulama notu: `ops` rolünde erişim engeli, diğer rollerde kategori kırılımı spec’e uygundur.

### 11 Parametre Çekmecesi (`/reports/:code` üretim akışı)

- Amaç: Seçilen rapor için parametre toplamak ve üretimi başlatmak.
- Görsel doğrulama: Tarih aralığı/günlük parametre alanları ve Üret/Vazgeç aksiyonları görünür.
- Temel aksiyonlar: parametre validasyonu, üretim tetikleme, çekmece kapatma.
- Doğrulama notu: Rapor tipine göre parametre seti dinamik biçimde açılır.

### 11 Önizleme Gridi (üretim sonrası)

- Amaç: Üretilen rapor sonucunu satır/kolon bazlı hızlı gözden geçirmek.
- Görsel doğrulama: kolon başlıkları, satır sayısı ve correlationId alanı görünür.
- Temel aksiyonlar: sonuç inceleme, CSV export, çıktı kalitesini hızlı kontrol.
- Doğrulama notu: PDF aksiyonunun disabled olması beklenen bir iş kuralıdır.

### 11 Arşiv / Son Üretimler Paneli

- Amaç: Yakın geçmiş rapor üretimlerini izlemek ve tekrar export etmek.
- Görsel doğrulama: arşiv tablosunda rapor adı, tarih, satır sayısı, correlationId görünür.
- Temel aksiyonlar: geçmiş üretimden CSV re-export, üretim geçmişi denetimi.
- Doğrulama notu: Yeni üretim sonrası panelin anlık güncellenmesi zorunlu kabul kriteridir.

## İlgili kod

- `apps/management/src/features/reports/reports-catalog-page.tsx`
- `apps/management/src/features/reports/domain/permissions.ts`
- `apps/management/src/features/reports/domain/report-catalog.ts`
- `apps/management/src/features/reports/domain/generator-registry.ts`
- `apps/management/src/features/reports/api/mock-reports-adapter.ts`
- `apps/management/src/features/reports/hooks/use-reports-catalog.tsx`
- `apps/management/src/features/reports/components/report-param-drawer.tsx`
- `apps/management/src/features/reports/components/report-preview-grid.tsx`
- `apps/management/src/features/reports/components/report-archive-list.tsx`
